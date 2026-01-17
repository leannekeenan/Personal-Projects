import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/admin/login', { username: user, password: pass });
            if (res.data.success) {
                localStorage.setItem('isAdmin', 'true'); // A simple "pass" stored in the browser
                navigate('/admin');
            }
        } catch (err) {
            alert("Wrong username or password.");
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
                <label>Username:</label><br/>
                <input type="text" onChange={e => setUser(e.target.value)} style={{ marginBottom: '10px' }}/><br/>
                <label>Password:</label><br/>
                <input type="password" onChange={e => setPass(e.target.value)} style={{ marginBottom: '10px' }}/><br/>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#2c3e50', color: 'white', border: 'none' }}>Login</button>
            </form>
        </div>
    );
}

export default Login;