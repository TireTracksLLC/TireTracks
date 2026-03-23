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
  const [message, setMessage] = useState('');

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, '');
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('You must be signed in to add inventory.');
      return;
    }

    const size = normalizeSize(form.size);

    if (size.length < 5) {
      setMessage('Enter a valid tire size.');
      return;
    }

    if (!form.condition) {
      setMessage('Pick a condition.');
      return;
    }

    const quantity = parseInt(form.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setMessage('Quantity must be 1 or more.');
      return;
    }

    const price = form.price === '' ? null : Number(form.price);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      setMessage('Price must be valid.');
      return;
    }

    const { error } = await supabase.from('tires').insert([
      {
        user_id: user.id,
        size,
        brand: form.brand || null,
        model: form.model || null,
        condition: form.condition,
        quantity,
        price
      }
    ]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Saved to inventory!');
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

    const { error } = await supabase
      .from('tires')
      .delete()
      .eq('id', deleteId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Tire deleted successfully.');
    setDeleteId('');
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
        <button type="submit">Delete Tire</button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}