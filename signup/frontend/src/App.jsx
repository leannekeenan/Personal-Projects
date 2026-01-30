import { useState, useEffect } from 'react';
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
  // --- 1. NEW STATE FOR STOCK ---
  const [stockRemaining, setStockRemaining] = useState(48);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone_number: '',
    delivery_time: '',
    items: PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: { traveler: 0, adventurer: 0, explorer: 0, quest: 0 } }), {})
  });

  // --- 2. FETCH STOCK ON LOAD ---
  useEffect(() => {
    const checkStock = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/preorders/stock-level');
        setStockRemaining(res.data.remaining);
      } catch (err) {
        console.error("Could not fetch stock level", err);
      }
    };
    checkStock();
  }, []);

  // --- 3. HELPER TO COUNT UNITS ---
  const calculateTotalUnits = (items) => {
    let totalUnits = 0;
    Object.values(items).forEach(sizes => {
      totalUnits += (Number(sizes.traveler) * 1) + 
                    (Number(sizes.adventurer) * 3) + 
                    (Number(sizes.explorer) * 6) + 
                    (Number(sizes.quest) * 12);
    });
    return totalUnits;
  };

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

    // --- 4. SAFETY CHECKS ---
    const totalInOrder = calculateTotalUnits(formData.items);

    if (totalInOrder === 0) {
      alert("Please select at least one treat!");
      return;
    }

    if (totalInOrder > stockRemaining) {
      alert(`⚠️ Capacity Alert: We only have ${stockRemaining} units left. Your current selection is ${totalInOrder} units. Please adjust your order.`);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/preorders', formData);
      alert('Order Submitted Successfully! Check your email for next steps.');
      
      // Refresh stock level after success
      const res = await axios.get('http://localhost:5000/api/preorders/stock-level');
      setStockRemaining(res.data.remaining);
    } catch (err) {
      alert('Error submitting order.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Sweet Adventures Club - Preorder Form</h1>
      
      {/* STOCK WARNING VIEW */}
      <div className="stock-info" style={{ textAlign: 'center', margin: '20px 0' }}>
        {stockRemaining <= 15 && stockRemaining > 0 && (
          <p className="hurry-up" style={{ color: '#d4a373', fontWeight: 'bold' }}>
            🔥 Limited Capacity: Only {stockRemaining} treats left for this event!
          </p>
        )}
        {stockRemaining <= 0 && (
          <h2 className="sold-out-msg" style={{ color: 'red' }}>SOLD OUT FOR THIS BAKE</h2>
        )}
      </div>

      <p>Preorder your favorite treats for pick up next week!</p>

      <ol>
        <li>Choose your favorite treats from the menu below</li>
        <li>Enter your pickup contact details</li>
        <li>Submit your order</li>
        <li>Check your email for confirmation and payment instructions</li>
        <li>Show your confirmation email to our vendor on site</li>
        <li>Pre-pay for your order</li>
        <li>Pick up your order next week during your chosen delivery window </li>
        <li>Enjoy your sweet treats!</li>
      </ol>

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
                <th>Product</th>
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
        <div className="delivery-details">
          <input type="text" placeholder="Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Email" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Delivery Window</option>
            <option value="9AM-10AM">9AM-10AM</option>
            <option value="10AM-11AM">10AM-11AM</option>
            <option value="11AM-12PM">11AM-12PM</option>
            <option value="12PM-1PM">12PM-1PM</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={stockRemaining <= 0}
        >
          {stockRemaining <= 0 ? "SOLD OUT" : "Submit Your Order"}
        </button>
      </form>

      <footer>
        <p>Thank you for choosing Sweet Adventures Club! We appreciate you supporting our small local business!</p>
        <p>Follow us on Instagram: <a href="https://www.instagram.com/sweet_adventures_club/" target="_blank" rel="noopener noreferrer">@sweetadventuresclub</a></p>
        <p>Website: <a href="https://www.sweetadventuresclub.cnetlify.app" target="_blank" rel="noopener noreferrer">sweetadventuresclub.com</a></p>
      </footer>
    </div>
  );
}

export default App;