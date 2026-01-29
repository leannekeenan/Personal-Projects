import { useState } from 'react';
import axios from 'axios';
import './App.css';

const PRODUCTS = [
  { id: 'vanilla_veil', name: 'Vanilla Veil' },
  { id: 'cosmic_chocolate', name: 'Cosmic Chocolate' },
  { id: 'cinnasphere', name: 'Cinnasphere' },
  { id: 'pb_portal', name: 'Peanut Butter Portal' },
  { id: 'cookies_clouds', name: 'Cookies & Clouds' },
  { id: 'spice_gourdmand', name: 'Spice Gourdmand' },
  { id: 'aethereal_apple', name: 'Aethereal Apple' },
  { id: 'strawberry_starlight', name: 'Strawberry Starlight' },
  { id: 'pineapple_express', name: 'Pineapple Express' }
];

function App() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    delivery_address: '',
    phone_number: '',
    delivery_time: '',
    delivery_date: '',
    special_instructions: '',
    items: PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: { half: 0, full: 0, cake: 0 } }), {})
  });

  const handleQtyChange = (productId, size, value) => {
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [productId]: { ...prev.items[productId], [size]: parseInt(value) || 0 }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/preorders', formData);
      alert('Order Submitted Successfully!');
      console.log(response.data);
    } catch (err) {
      alert('Error submitting order. Check console.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h5>Choose from the menu below</h5>
        <div className="table-wrapper">
          <table className="ordering-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Half Dozen ($42)</th>
                <th>Full Dozen ($80)</th>
                <th>9" Cake ($80)</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><input type="number" min="0" value={formData.items[product.id].half} onChange={(e) => handleQtyChange(product.id, 'half', e.target.value)} /></td>
                  <td><input type="number" min="0" value={formData.items[product.id].full} onChange={(e) => handleQtyChange(product.id, 'full', e.target.value)} /></td>
                  <td><input type="number" min="0" value={formData.items[product.id].cake} onChange={(e) => handleQtyChange(product.id, 'cake', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5>Delivery Details</h5>
        <div className="row">
          <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="text" placeholder="Delivery Address" required onChange={e => setFormData({...formData, delivery_address: e.target.value})} />
          <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Delivery Window</option>
            <option value="10AM-11AM">10AM-11AM</option>
            <option value="11AM-12PM">11AM-12PM</option>
            {/* Add other options here */}
          </select>

          <input type="date" required onChange={e => setFormData({...formData, delivery_date: e.target.value})} />
          <textarea placeholder="Special Instructions" onChange={e => setFormData({...formData, special_instructions: e.target.value})} />
        </div>

        <button type="submit" className="primary">Submit Your Order</button>
      </form>
    </div>
  );
}

export default App;