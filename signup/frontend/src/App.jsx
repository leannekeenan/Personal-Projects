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
    phone_number: '',
    delivery_time: '',
    items: PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: { traveler: 0, adventurer: 0, explorer: 0, quest:0 } }), {})
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
      <h1>Sweet Adventures Club - Preorder Form</h1>
      <p>Preorder your favorite treats for pick up next week!</p>

      <p>please follow the instructions below to complete your preorder</p>

      <ul>
        <li></li>
      </ul>
      <form onSubmit={handleSubmit}>
        <h5>Choose from the menu below</h5>
        <ul>
          <li>Travelers Treat: 1 individual treat ($8)</li>
          <li>Adventurers Pack: 3 individual treats ($22)</li>
          <li>Explorers Pack: 6 individual treats ($42)</li>
          <li>Quest Pack: 12 individual treats ($80)</li>
        </ul>
        <div className="table-wrapper">
          <table className="ordering-table">
            <thead>
              <tr>
                <th></th>
                <th>Travelers Treat</th>
                <th>Adventurers Pack</th>
                <th>Explorers Pack</th>
                <th>Quest Pack</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><input type="number" min="0" value={formData.items[product.id].traveler} onChange={(e) => handleQtyChange(product.id, 'traveler', e.target.value)} /></td>

                  <td><input type="number" min="0" value={formData.items[product.id].adventurer} onChange={(e) => handleQtyChange(product.id, 'adventurer', e.target.value)} /></td>

                  <td><input type="number" min="0" value={formData.items[product.id].explorer} onChange={(e) => handleQtyChange(product.id, 'explorer', e.target.value)} /></td>

                  <td><input type="number" min="0" value={formData.items[product.id].quest} onChange={(e) => handleQtyChange(product.id, 'quest', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5>Delivery Details</h5>
        <div className="row">
          <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Delivery Window</option>
            <option value="9AM-10AM">9AM-10AM</option>
            <option value="10AM-11AM">10AM-11AM</option>
            <option value="11AM-12PM">11AM-12PM</option>
            <option value="12PM-1PM">12AM-1PM</option>
          </select>

          {
          /*<input type="date" required onChange={e => setFormData({...formData, delivery_date: e.target.value})} />
          <textarea placeholder="Special Instructions" onChange={e => setFormData({...formData, special_instructions: e.target.value})} />*/
          }
        </div>

        <button type="submit" className="submit-btn">Submit Your Order</button>
      </form>
      <footer>
        <p>Thank you for choosing Sweet Adventures Club! We appreciate you supporting our small local business!
        </p>

        <p>
          Follow us on social media:
          <br />
          Instagram: <a href="https://www.instagram.com/sweetadventuresclub/" target="_blank" rel="noopener noreferrer">@sweetadventuresclub</a>
        </p>

        <p>
          and check out all out flavors on our website:
          <br />
          Website: <a href="https://www.sweetadventuresclub.com" target="_blank" rel="noopener noreferrer">sweetadventuresclub.com</a>
        </p>
      </footer>
    </div>
  );
}

export default App;