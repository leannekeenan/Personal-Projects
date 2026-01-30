import React from 'react';
import './App.css';

const OrderSuccess = () => {
  return (
    <div className="app-container">
      <div className="parchment-bg">
        <header className="tavern-header">
          <h1 className="tavern-title">⚔️ Quest Complete! ⚔️</h1>
          <p className="tavern-subtitle">Your Gold has been Accepted</p>
        </header>

        <section className="steps-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="step-card">
            <h3>Huzzah, Adventurer!</h3>
            <p style={{ fontSize: '1.2rem', color: '#5D4037' }}>
              The Grand Ledger has been marked and your rations are secured. 
            </p>
            <div className="divider" style={{ margin: '20px auto', width: '50%' }}></div>
            <p>
              Our baking bards are now preparing your legendary treats. 
              Keep a weather eye on your inbox for your official Provision Receipt.
            </p>
            
            <div style={{ marginTop: '40px' }}>
              <button 
                onClick={() => window.location.href = '/'} 
                className="order-button"
                style={{ cursor: 'pointer' }}
              >
                Return to the Tavern
              </button>
            </div>
          </div>
        </section>

        <footer style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic', color: '#8b5e3c' }}>
          "May your pack be heavy with cheesecake and your heart light on the road."
        </footer>
      </div>
    </div>
  );
};

export default OrderSuccess;