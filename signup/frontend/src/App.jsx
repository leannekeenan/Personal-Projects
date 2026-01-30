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
  const [stockRemaining, setStockRemaining] = useState(null); 
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone_number: '',
    delivery_time: '',
    items: PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: { traveler: 0, adventurer: 0, explorer: 0, quest: 0 } }), {})
  });

  useEffect(() => {
    const checkStock = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/preorders/stock-level');
        setStockRemaining(res.data.remaining);
      } catch (err) {
        console.error("The archive is incomplete. Could not fetch stock levels.", err);
      }
    };
    checkStock();
  }, []);

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
    const totalInOrder = calculateTotalUnits(formData.items);

    if (totalInOrder === 0) {
      alert("An adventurer cannot set out with an empty pack! Please select a treat.");
      return;
    }

    if (totalInOrder > stockRemaining) {
      alert(`⚠️ Alas! We only have ${stockRemaining} rations remaining. Your party is requesting ${totalInOrder}. Please adjust your loot.`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/preorders', formData);
      alert('Order Recorded! Check your scroll (email) for the next steps of your journey.');
      const res = await axios.get('http://localhost:5000/api/preorders/stock-level');
      setStockRemaining(res.data.remaining);
    } catch (err) {
      alert('The messenger was intercepted. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <header className="adventure-header">
        <h1>Sweet Adventures Club</h1>
        <p className="tagline">Hand-Held Rations for the Road Ahead</p>
      </header>
      
      <div className="stock-info" style={{ textAlign: 'center', margin: '20px 0' }}>
        {stockRemaining > 0 ? (
          <p className="hurry-up" style={{ 
            color: '#d4a373', 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            padding: '10px',
            border: '2px dotted #d4a373',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            ⚔️ Only {stockRemaining} rations remaining for the next gathering!
          </p>
        ) : (
          <h2 className="sold-out-msg" style={{ color: 'red' }}>OUT OF PROVISIONS FOR THIS JOURNEY</h2>
        )}
      </div>

      <section className="mission-statement">
        <p>Life is more than the daily grind—it is a grand quest. Step into our sanctuary and find road-ready cheesecakes meticulously crafted for your journey.</p>
      </section>

      <div className="quest-steps">
        <h3>Your Preorder Quest Log</h3>
        <ol>
          <li>Select your loot from the menu below</li>
          <li>Enter Adventurer Details</li>
          <li>Commit your order to our baking bards</li>
          <li>Prepay for your provisions at our vendors tavern</li>
          <li>Claim your loot next week during your chosen pick up window</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit}>
        <h5 className="section-title">Provision Packs</h5>
        <ul className="pack-legend">
          <li><strong>Traveler’s Treat:</strong> 1 Individual Cheesecake ($8)</li>
          <li><strong>Adventurer’s Pack:</strong> 3 Road-Ready Rations ($22)</li>
          <li><strong>Explorer’s Pack:</strong> 6 Decadent Treats ($42)</li>
          <li><strong>Quest Pack:</strong> 12 Legendary Portables ($80)</li>
        </ul>

        <div className="table-wrapper">
          <table className="ordering-table">
            <thead>
              <tr>
                <th></th>
                <th>Traveler</th>
                <th>Adventurer</th>
                <th>Explorer</th>
                <th>Quest</th>
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

        <h5 className="section-title">Adventurer Details</h5>
        <div className="delivery-details">
          <input type="text" placeholder="Adventurer Name" required onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input type="email" placeholder="Communication Scroll (Email)" required onChange={e => setFormData({...formData, customer_email: e.target.value})} />
          <input type="tel" placeholder="Mobile Frequency (Phone)" required onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          
          <select required onChange={e => setFormData({...formData, delivery_time: e.target.value})}>
            <option value="">Select Your Arrival Window</option>
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
          {stockRemaining <= 0 ? "SANCTUARY FULL" : "Finalize Your Preorder"}
        </button>
      </form>

      <footer>
        <p>Thank you for letting Sweet Adventures Club fuel your story. Happy trails, adventurer.</p>
        <div className="social-links">
          <a href="https://www.instagram.com/sweet_adventures_club/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <span> | </span>
          <a href="https://sweetadventuresclub.netlify.app" target="_blank" rel="noopener noreferrer">SACAT.com</a>
        </div>
      </footer>
    </div>
  );
}

export default App;