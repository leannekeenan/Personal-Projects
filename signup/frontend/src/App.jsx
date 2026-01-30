import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import logo from './assets/SWEET ADVENTURES CLUB (2).png';
import OrderSuccess from "./components/OrderSuccess";
import SquarePayment from "./components/SquarePayment";

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

function TavernForm({ stockRemaining }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone_number: '',
    delivery_time: '',
    items: PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: { traveler: 0, adventurer: 0, explorer: 0, quest: 0 } }), {})
  });

  const handleQtyChange = (productId, size, value) => {
    const qty = parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [productId]: { 
          ...prev.items[productId], 
          [size]: isNaN(qty) ? 0 : qty 
        }
      }
    }));
  };

  const calculateTotal = () => {
    let subtotal = 0;
    Object.values(formData.items).forEach(item => {
      subtotal += (Number(item.traveler) || 0) * 8;
      subtotal += (Number(item.adventurer) || 0) * 22;
      subtotal += (Number(item.explorer) || 0) * 42;
      subtotal += (Number(item.quest) || 0) * 80;
    });

    const taxRate = 0.09875; 
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: grandTotal.toFixed(2)
    };
  };

  // --- THE INTEGRATED TOTALS ---
  const totals = calculateTotal();

  const handlePayment = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/preorders', {
        ...formData,
        sourceId: token,
        amount: totals.total // Sending the specific total string to the backend
      });
      if (response.status === 201) {
        window.location.href = '/order-success';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'The payment portal failed.');
    }
  };

  return (
    <div className="order-container">
      <header className="adventure-header">
        <img src={logo} alt="Logo" className="logo"/>
        <h1 className="app-title">Sweet Adventures Club Preorder Form</h1>
      </header>
      
      <div className="stock-section">
         <p className="sold-out-msg">⚔️ Only {stockRemaining} left for preorder!</p>
         <div className="stock-bar-container">
            <div className="stock-bar-fill" style={{ width: `${(stockRemaining / 42) * 100}%` }}></div>
         </div>
      </div>

      <div className="mission-statement">
        <p>Life is more than the daily grind. It is a quest. Discover your flavor and explore our ever-rising treasures as each journey is uniquely crafted for your journey.</p>
      </div>

      <div className="quest-steps">
        <h3>PREORDERING INSTRUCTIONS</h3>
        <ol>
          <li>Select your Pack from the menu below.</li>
          <li>Enter Adventurer details.</li>
          <li>Commit your order to the folding lands.</li>
          <li>Prepare for your arrival in our common room.</li>
          <li>Enjoy your quest and amazing hand-crafted cookies!</li>
        </ol>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <h2 className="section-title">PROVISION PACK OPTIONS</h2>
        
        <ul className="pack-legend">
          <li><strong>Traveler's Pack</strong> Individual (1) Indulgence ($8)</li>
          <li><strong>Adventurer's Pack</strong> Pack of (3) Road Ready Rations ($22)</li>
          <li><strong>Explorers' Pack</strong> Pack of (6) Decadent Delights ($42)</li>
          <li><strong>Quest Pack</strong> 1 Dozen (12) Legendary Luxuries ($80)</li>
        </ul>

        <div className="table-wrapper">
          <table className="ordering-table">
            <thead>
              <tr>
                <th>Flavor</th>
                <th>Traveler (1)</th>
                <th>Adventurer (3)</th>
                <th>Explorer (6)</th>
                <th>Quest (12)</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(product => (
                <tr key={product.id}>
                  <td className="flavor-name">{product.name}</td>
                  <td><input type="number" min="0" value={formData.items[product.id].traveler} onChange={(e) => handleQtyChange(product.id, 'traveler', e.target.value)} /></td>
                  <td><input type="number" min="0" value={formData.items[product.id].adventurer} onChange={(e) => handleQtyChange(product.id, 'adventurer', e.target.value)} /></td>
                  <td><input type="number" min="0" value={formData.items[product.id].explorer} onChange={(e) => handleQtyChange(product.id, 'explorer', e.target.value)} /></td>
                  <td><input type="number" min="0" value={formData.items[product.id].quest} onChange={(e) => handleQtyChange(product.id, 'quest', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">ADVENTURER DETAILS</h2>
        <div className="delivery-details">
          <input type="text" placeholder="Adventurer Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Adventurer Email Address" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="tel" placeholder="Mobile Frequency (Phone Number)" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Your Arrival Window</option>
            <option value="9AM-10AM">9AM - 10AM</option>
            <option value="10AM-11AM">10AM - 11AM</option>
            <option value="11AM-12PM">11AM - 12PM</option>
            <option value="12PM-1PM">12PM - 1PM</option>
          </select>
        </div>

        <div className="payment-container">
          <div className="total-display">
            <div className="summary-line">
              <span>Subtotal: </span>
              <span>${totals.subtotal}</span>
            </div>
            <div className="summary-line">
              <span>Loot Tax (9.875%): </span>
              <span>${totals.tax}</span>
            </div>
            <hr />
            <h3 className="grand-total-text">Quest Total: ${totals.total}</h3>
          </div>

          <SquarePayment onTokenReceived={handlePayment} />
        </div>
      </form>

      <footer>
        <p>Thank you for letting Sweet Adventures Club craft your next journey!</p>
      </footer>
    </div>
  );
}

function App() {
  const [stockRemaining, setStockRemaining] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:5000/api/preorders/stock-level')
      .then(res => setStockRemaining(res.data.remaining))
      .catch(err => console.log("Stock fetch error:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TavernForm stockRemaining={stockRemaining} />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;