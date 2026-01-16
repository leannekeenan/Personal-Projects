import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function CRM() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch unique customers from the new aggregation route
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error("CRM Fetch Error:", err);
      }
    };
    fetchCustomers();
  }, []);

  // Filter by name, email, or phone using the search input
  const filtered = customers.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="admin-container">
      {/* Admin Internal Navigation */}
      <div className="admin-nav" style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '10px',
        borderBottom: '1px solid var(--primary-color)',
        paddingBottom: '15px' 
      }}>
        <button 
          onClick={() => navigate('/admin')} 
          style={{ background: 'transparent', border: '1px solid var(--primary-color)' }}
        >
          📅 Dashboard
        </button>
        <button 
          style={{ background: 'var(--primary-color)' }}
        >
          👥 CRM
        </button>
      </div>

      <div className="admin-header">
        <h1>Client Relationship Manager</h1>
      </div>

      <input 
        type="text" 
        className="search-input" 
        placeholder="Search database by name, email, or phone..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Total Bookings</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.clientName}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span className={`badge ${c.customerType || 'new'}`}>
                      {c.customerType || 'new'}
                    </span>
                  </td>
                  <td>{c.totalBookings}</td>
                  <td>{new Date(c.lastVisit).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                  No clients found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CRM;