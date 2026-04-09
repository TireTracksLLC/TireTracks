import { useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function ManageInventory() {
  const [form, setForm] = useState({
    size: '',
    brand: '',
    model: '',
    condition: '',
    quantity: 1,
    price: ''
  });

  const [deleteId, setDeleteId] = useState('');
  const [deleteQty, setDeleteQty] = useState(1);
  const [message, setMessage] = useState('');

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, '');
  }

  function normalizeText(value) {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleAddTire(e) {
    e.preventDefault();
    setMessage('');

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('You must be signed in to add inventory.');
      return;
    }

    const size = normalizeSize(form.size);
    const brand = normalizeText(form.brand);
    const model = normalizeText(form.model);

    if (size.length < 5) {
      setMessage('Enter a valid tire size.');
      return;
    }

    if (!form.condition) {
      setMessage('Pick a condition.');
      return;
    }

    const quantityToAdd = parseInt(form.quantity, 10);
    if (!Number.isInteger(quantityToAdd) || quantityToAdd < 1) {
      setMessage('Quantity must be 1 or more.');
      return;
    }

    const price = form.price === '' ? null : Number(form.price);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      setMessage('Price must be valid.');
      return;
    }

    let query = supabase
      .from('tires')
      .select('*')
      .eq('user_id', user.id)
      .eq('size', size)
      .eq('condition', form.condition);

    if (brand === null) {
      query = query.is('brand', null);
    } else {
      query = query.eq('brand', brand);
    }

    if (model === null) {
      query = query.is('model', null);
    } else {
      query = query.eq('model', model);
    }

    if (price === null) {
      query = query.is('price', null);
    } else {
      query = query.eq('price', price);
    }

    const { data: existing, error: findError } = await query.maybeSingle();

    if (findError) {
      setMessage(findError.message);
      return;
    }

    if (existing) {
      const newQuantity = (existing.quantity || 0) + quantityToAdd;

      const { error: updateError } = await supabase
        .from('tires')
        .update({ quantity: newQuantity })
        .eq('id', existing.id);

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setMessage(`Updated quantity. New quantity: ${newQuantity}`);
    } else {
      const { error: insertError } = await supabase.from('tires').insert([
        {
          user_id: user.id,
          size,
          brand,
          model,
          condition: form.condition,
          quantity: quantityToAdd,
          price
        }
      ]);

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      setMessage('Saved to inventory!');
    }

    setForm({
      size: '',
      brand: '',
      model: '',
      condition: '',
      quantity: 1,
      price: ''
    });
  }

  async function handleDeleteTire(e) {
    e.preventDefault();
    setMessage('');

    if (!deleteId) {
      setMessage('Enter the tire ID to delete.');
      return;
    }

    const qtyToRemove = parseInt(deleteQty, 10);
    if (!Number.isInteger(qtyToRemove) || qtyToRemove < 1) {
      setMessage('Delete quantity must be 1 or more.');
      return;
    }

    const { data: tire, error: fetchError } = await supabase
      .from('tires')
      .select('*')
      .eq('id', deleteId)
      .maybeSingle();

    if (fetchError) {
      setMessage(fetchError.message);
      return;
    }

    if (!tire) {
      setMessage('Tire not found.');
      return;
    }

    const newQuantity = (tire.quantity || 0) - qtyToRemove;

    if (newQuantity > 0) {
      const { error: updateError } = await supabase
        .from('tires')
        .update({ quantity: newQuantity })
        .eq('id', deleteId);

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setMessage(`Quantity updated. Remaining: ${newQuantity}`);
    } else {
      const { error: deleteError } = await supabase
        .from('tires')
        .delete()
        .eq('id', deleteId);

      if (deleteError) {
        setMessage(deleteError.message);
        return;
      }

      setMessage('Tire removed completely.');
    }

    setDeleteId('');
    setDeleteQty(1);
  }

  return (
    <section className="page inventory-page">
      <h1>Manage Inventory</h1>

      <form onSubmit={handleAddTire} className="inventory-card">
        <h2>Add Tire</h2>

        <input
          name="size"
          placeholder="Size (ex: 225/65R17)"
          value={form.size}
          onChange={handleChange}
          required
        />

        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={handleChange}
        />

        <input
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
        />

        <select
          name="condition"
          value={form.condition}
          onChange={handleChange}
          required
        >
          <option value="">Condition...</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>

        <input
          name="quantity"
          type="number"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <button type="submit">Save to Inventory</button>
      </form>

      <form onSubmit={handleDeleteTire} className="inventory-card">
        <h2>Delete Tire</h2>

        <input
          placeholder="Enter tire ID"
          value={deleteId}
          onChange={(e) => setDeleteId(e.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Quantity to remove"
          value={deleteQty}
          onChange={(e) => setDeleteQty(e.target.value)}
        />

        <button type="submit">Delete Tire</button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}