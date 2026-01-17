import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 



function CRM() {

    
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

    

    useEffect(() => {
        const loggedIn = localStorage.getItem('isAdmin');
        if (loggedIn !== 'true') {
            navigate('/login'); // Kick them out if they aren't logged in
        }
    }, [navigate]);
    
    // THESE STATES CONTROL THE EDITING TOGGLE
    const [editingEmail, setEditingEmail] = useState(null);
    const [editForm, setEditForm] = useState({ clientName: '', phone: '', });

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/customers');
            setCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Fetch Error", err); }
    };

    const viewHistory = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/customers/${email}/history`);
            setHistory(res.data);
            setSelectedCustomer(email);
        } catch (err) { console.error("History Error", err); }
    };

    // THIS SAVES THE NEW NAME/PHONE TO THE DATABASE
    const handleSaveEdit = async (email) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/customers/${email}`, editForm);
            setEditingEmail(null);
            fetchCustomers(); // Refreshes list with the new name
            alert("✅ Identity updated respectfully.");
        } catch (err) {
            alert("❌ Error updating customer");
        }
    };

    const filtered = customers.filter(c => 
        c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="admin-container">
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
    <button style={{ background: 'var(--primary-color)' }}>👥 CRM</button>
</div>

<div className="admin-header"><h1>Customer Manager</h1></div>

<div className="search-bar-container">
    <input 
        type="text" 
        className="search-input" 
        placeholder="Search by ID/Email/Name..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
    />
</div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Visits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c.email}>
                            {editingEmail === c.email ? (
                                <>
                                    {/* --- EDIT MODE: This is where you change the name --- */}
                                    <td>
                                        <input 
                                            className="edit-input"
                                            value={editForm.clientName} 
                                            onChange={e => setEditForm({...editForm, clientName: e.target.value})} 
                                            placeholder="New Name"
                                        />
                                       
                                    </td>
                                    <td>{c.email}</td>
                                    <td>
                                        <input 
                                            className="edit-input"
                                            value={editForm.phone} 
                                            onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                                        />
                                    </td>
                                    <td>{c.totalBookings}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => handleSaveEdit(c.email)}>Save</button>
                                        <button className="delete-btn" style={{marginLeft: '5px'}} onClick={() => setEditingEmail(null)}>Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    {/* --- VIEW MODE: What you see in your screenshot --- */}
                                    <td>
                                        {c.clientName} 
                                        {<small style={{opacity: 0.7, marginLeft: '5px'}}></small>}
                                    </td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.totalBookings}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => {
                                            setEditingEmail(c.email);
                                            setEditForm({ clientName: c.clientName, phone: c.phone || '' });
                                        }}>Edit Identity</button>
                                        <button className="add-btn" style={{marginLeft: '5px', background: '#28a745'}} onClick={() => viewHistory(c.email)}>History</button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* History Section stays exactly as it is in your screenshot */}
            {selectedCustomer && (
                <div className="history-section" style={{marginTop: '30px', borderTop: '2px solid #444', paddingTop: '20px'}}>
                    <h2>History for {selectedCustomer}</h2>
                    <button className="delete-btn" onClick={() => setSelectedCustomer(null)}>Close</button>
                    <table className="admin-table">
                        <thead>
                            <tr><th>Date</th><th>Service</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.service}</td>
                                    <td><span className={`badge ${h.status?.toLowerCase() || 'scheduled'}`}>{h.status || 'Scheduled'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CRM;