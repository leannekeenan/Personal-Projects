import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import logo from './assets/SWEET ADVENTURES CLUB (2).png';
import OrderSuccess from './components/OrderSuccess';
import SquarePayment from './components/SquarePayment';

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
    setFormData(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [productId]: { ...prev.items[productId], [size]: parseInt(value) || 0 }
      }
    }));
  };

  const handlePayment = async (token) => {
    try {
      // This sends the Square Token + all your form data to the backend in one request
      const response = await axios.post('http://localhost:5000/api/preorders', {
        ...formData,
        sourceId: token // Passing the token string directly to your backend
      });

      if (response.status === 201) {
        window.location.href = '/order-success';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'The payment portal failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <header className="adventure-header">
        <img src={logo} alt="Logo" className="logo"/>
        <h1 className="app-title">Sweet Adventures Club Preorder Form</h1>
      </header>
      
      <div className="stock-info">
        <p className="hurry-up">⚔️ Only {stockRemaining} left for preorder!</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="table-wrapper">
          <table className="ordering-table">
            <thead>
              <tr><th>Flavor</th><th>Traveler</th><th>Adventurer</th><th>Explorer</th><th>Quest</th></tr>
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

        <div className="delivery-details">
          <input type="text" placeholder="Adventurer Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Email Address" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Arrival Window</option>
            <option value="9AM-10AM">9AM-10AM</option>
            <option value="10AM-11AM">10AM-11AM</option>
          </select>
        </div>

        {/* Updated to pass the handlePayment function as a prop */}
        <SquarePayment onTokenReceived={handlePayment} />
      </form>
    </div>
  );
}

function App() {
  const [stockRemaining, setStockRemaining] = useState(0);
  useEffect(() => {
    axios.get('http://localhost:5000/api/preorders/stock-level').then(res => setStockRemaining(res.data.remaining));
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