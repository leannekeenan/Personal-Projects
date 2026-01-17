import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from "react-csv";
import '../App.css';

const headers = [
    { label: "Customer Name", key: "clientName" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Total Visits", key: "totalBookings" },
    { label: "Visit Date", key: "visitDate" },
    { label: "Service Type", key: "serviceType" },
    { label: "Status", key: "visitStatus" }
];

function CRM() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [editingEmail, setEditingEmail] = useState(null);
    const [editForm, setEditForm] = useState({ clientName: '', phone: '' });

    useEffect(() => {
        const loggedIn = localStorage.getItem('isAdmin');
        if (loggedIn !== 'true') navigate('/login');
    }, [navigate]);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/customers');
            setCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("API Error:", err);
        }
    };

    const viewHistory = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/customers/${email}/history`);
            setHistory(res.data);
            setSelectedCustomer(email);
        } catch (err) { console.error(err); }
    };

    const handleSaveEdit = async (email) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/customers/${email}`, editForm);
            setEditingEmail(null);
            fetchCustomers();
            alert("✅ Identity updated.");
        } catch (err) { alert("❌ Update failed"); }
    };

    const filtered = customers.filter(c => 
        (c.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || "").includes(searchTerm)
    );

    // FLATTEN DATA FOR EXCEL (One row per visit)
    const exportData = filtered.flatMap(customer => {
        if (!customer.history || customer.history.length === 0) {
            return [{
                ...customer,
                visitDate: "N/A",
                serviceType: "None",
                visitStatus: "N/A"
            }];
        }
        return customer.history.map(visit => ({
            ...customer,
            visitDate: new Date(visit.date).toLocaleDateString(),
            serviceType: visit.service,
            visitStatus: visit.status || 'Scheduled'
        }));
    });

    return (
        <div className="admin-container">
            <div className="admin-nav" style={{ justifyContent: 'space-between', display: 'flex', borderBottom: '1px solid #444', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="nav-btn" onClick={() => navigate('/admin')}>📅 Dashboard</button>
                    <button className="nav-btn active">👥 CRM</button>
                </div>
                <button className="delete-btn" onClick={() => { localStorage.removeItem('isAdmin'); navigate('/login'); }}>🔒 Lock Grimoire</button>
            </div>

            <h1 style={{ color: 'white', marginTop: '20px' }}>Customer Manager</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search by name/email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: 'white' }}
                />
                
                <CSVLink 
                    // UPDATED THIS LINE TO USE exportData
                    data={exportData.length > 0 ? exportData : [{ clientName: "No Data" }]} 
                    headers={headers}
                    filename="Detailed_Customer_Report.csv"
                    style={{ 
                        background: '#444', 
                        color: 'white', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        textDecoration: 'none',
                        border: '1px solid #666',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    📥 Export Detailed Excel
                </CSVLink>
            </div>

            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #444' }}>
                        <th>Name</th><th>Email</th><th>Phone</th><th>Visits</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? filtered.map(c => (
                        <tr key={c.email} style={{ borderBottom: '1px solid #333' }}>
                            {editingEmail === c.email ? (
                                <>
                                    <td><input className="edit-input" value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} /></td>
                                    <td>{c.email}</td>
                                    <td><input className="edit-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></td>
                                    <td>{c.totalBookings || 0}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => handleSaveEdit(c.email)}>Save</button>
                                        <button className="delete-btn" style={{marginLeft: '5px'}} onClick={() => setEditingEmail(null)}>X</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{c.clientName || "Unknown"}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone || "N/A"}</td>
                                    <td>{c.totalBookings || 0}</td>
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
                    )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No records found in the Ledger.</td></tr>
                    )}
                </tbody>
            </table>

            {selectedCustomer && (
                <div className="history-section" style={{marginTop: '40px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ color: 'white' }}>History for {selectedCustomer}</h2>
                        <button className="delete-btn" onClick={() => setSelectedCustomer(null)}>Close</button>
                    </div>
                    <table className="admin-table" style={{ width: '100%', color: 'white' }}>
                        <thead><tr><th>Date</th><th>Service</th><th>Status</th></tr></thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.service}</td>
                                    <td>{h.status || 'Scheduled'}</td>
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