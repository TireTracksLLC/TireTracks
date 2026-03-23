import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function LookupInventory() {
  const [searchSize, setSearchSize] = useState('');
  const [allSizes, setAllSizes] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState([]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  function normalizeSize(s) {
    return s.trim().toUpperCase().replace(/\s+/g, '');
  }

  useEffect(() => {
    async function fetchSizes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tires')
        .select('size')
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
        return;
      }

      const uniqueSizes = [...new Set(data.map(t => t.size))];
      setAllSizes(uniqueSizes);
    }

    fetchSizes();
  }, []);

  useEffect(() => {
    const normalized = normalizeSize(searchSize);

    if (!normalized) {
      setFilteredSizes([]);
      return;
    }

    const matches = allSizes.filter(size =>
      size.includes(normalized)
    );

    setFilteredSizes(matches);
  }, [searchSize, allSizes]);

  async function handleSearch(e) {
    e.preventDefault();
    setMessage('');
    setResults([]);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Sign in to search your inventory.');
      return;
    }

    const normalized = normalizeSize(searchSize);

    if (normalized.length < 5) {
      setMessage('Enter a valid size.');
      return;
    }

    const { data, error } = await supabase
      .from('tires')
      .select('id, size, brand, model, condition, quantity, price, created_at')
      .eq('user_id', user.id)
      .eq('size', normalized)
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data || data.length === 0) {
      setMessage('No matching tires found.');
      return;
    }

    setResults(data);
  }

  return (
    <section className="page inventory-page">
      <h1>Lookup Inventory</h1>

      <form onSubmit={handleSearch} className="inventory-card">
        <input
          type="text"
          placeholder="Search by size (ex: 225/65R17)"
          value={searchSize}
          onChange={(e) => setSearchSize(e.target.value)}
        />

        {filteredSizes.length > 0 && (
          <div className="dropdown">
            {filteredSizes.map((size) => (
              <div
                key={size}
                className="dropdown-item"
                onClick={() => {
                  setSearchSize(size);
                  setFilteredSizes([]);
                }}
              >
                {size}
              </div>
            ))}
          </div>
        )}

        <button type="submit">Search</button>
      </form>

      {message && <p>{message}</p>}

      {results.length > 0 && (
        <div className="inventory-card">
          <h2>Results</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Size</th>
                <th align="left">Brand</th>
                <th align="left">Model</th>
                <th align="left">Condition</th>
                <th align="left">Qty</th>
                <th align="left">Price</th>
              </tr>
            </thead>
            <tbody>
              {results.map((tire) => (
                <tr key={tire.id}>
                  <td>{tire.size}</td>
                  <td>{tire.brand || ''}</td>
                  <td>{tire.model || ''}</td>
                  <td>{tire.condition}</td>
                  <td>{tire.quantity}</td>
                  <td>{tire.price ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}