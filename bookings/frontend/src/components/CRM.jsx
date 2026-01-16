import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function CRM() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error("CRM Fetch Error:", err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Client Relationship Manager</h1>
      </div>

      <input 
        type="text" 
        className="search-input" 
        placeholder="Search database by name or email..." 
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Contact Info</th>
              <th>Status</th>
              <th>Total Bookings</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer._id}>
                <td><strong>{customer.clientName}</strong></td>
                <td>
                  <div>{customer.email}</div>
                  <div style={{fontSize: '0.8rem', opacity: 0.7}}>{customer.phone}</div>
                </td>
                <td>
                  <span className={`badge ${customer.customerType}`}>
                    {customer.customerType}
                  </span>
                </td>
                <td>{customer.totalBookings}</td>
                <td>{new Date(customer.lastVisit).toLocaleDateString()}</td>
                <td>
                  <button className="add-btn" style={{padding: '5px 10px', fontSize: '0.8rem'}}>
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CRM;