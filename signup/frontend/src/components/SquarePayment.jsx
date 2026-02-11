import { useEffect, useRef, useState } from 'react';

const SquarePayment = ({ onTokenReceived, isProcessing }) => {
  const paymentInstance = useRef(null);
  const cardInstance = useRef(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeSquare = async () => {
      if (!window.Square) {
        console.error("Square SDK not found");
        setIsError(true);
        return;
      }

      if (paymentInstance.current) return;

      try {
        // HARD-CODED KEYS: Paste your actual Sandbox strings here
        const appId = 'sandbox-sq0idb-REPLACE_WITH_YOUR_ACTUAL_APP_ID';
        const locationId = 'REPLACE_WITH_YOUR_ACTUAL_LOCATION_ID';

        console.log("Initializing Square with:", appId, locationId);

        const payments = window.Square.payments(appId, locationId);
        paymentInstance.current = payments;

        const card = await payments.card();
        await card.attach('#card-container');
        cardInstance.current = card;
        
        setIsError(false);
      } catch (e) {
        console.error("Square Initialization Failed:", e);
        setIsError(true);
      }
    };

    initializeSquare();

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy();
        cardInstance.current = null;
        paymentInstance.current = null;
      }
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cardInstance.current || isProcessing) return;

    try {
      const result = await cardInstance.current.tokenize();
      if (result.status === 'OK') {
        // SUCCESS: Send real token to backend
        onTokenReceived(result.token); 
      } else {
        const message = result.errors ? result.errors[0].message : "Invalid card data";
        alert(`Payment Error: ${message}`);
      }
    } catch (e) {
      console.error("Tokenization failed", e);
      alert("System Error: Could not generate payment token.");
    }
  };

  return (
    <div className="payment-box">
      {isError && (
        <p style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
          ⚠️ Payment Portal Failed to Load. Check console for ID mismatch.
        </p>
      )}
      
      <div id="card-container" style={{ minHeight: '100px', marginBottom: '20px' }}></div>
      
      <button 
        type="button" 
        className={`finalize-button ${isProcessing ? 'loading' : ''}`}
        onClick={handlePayment}
        disabled={isProcessing || isError}
      >
        {isProcessing ? "Processing Your Quest..." : "Finalize Your Preorder"}
      </button>
    </div>
  );
};

export default SquarePayment;