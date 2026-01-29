import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [preorders, setPreorders] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    productName: '',
    quantity: 1
  });

  // Fetch the "Clipboard" data
  const fetchPreorders = async () => {
    const res = await axios.get('http://localhost:5000/api/preorders');
    setPreorders(res.data);
  };

  useEffect(() => {
    fetchPreorders();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/preorders', formData);
    setFormData({ customerName: '', email: '', productName: '', quantity: 1 });
    fetchPreorders(); // Refresh the list
  };

  return (
    <div className="App">
      <h1>📋 Digital Preorder Clipboard</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        <input placeholder="Name" onChange={e => setFormData({...formData, customerName: e.target.value})} value={formData.customerName} required />
        <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
        <input placeholder="Product" onChange={e => setFormData({...formData, productName: e.target.value})} value={formData.productName} required />
        <button type="submit">Add Preorder</button>
      </form>

      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {preorders.map(order => (
            <tr key={order._id}>
              <td>{order.customerName}</td>
              <td>{order.productName}</td>
              <td>{order.quantity}</td>
              <td>{order.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App