import { useEffect, useRef, useState } from 'react';

const SquarePayment = ({ onTokenReceived, isProcessing }) => {
  const paymentInstance = useRef(null);
  const cardInstance = useRef(null);
  const [isError, setIsError] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const initializeSquare = async () => {
      // 1. Safety check for the Square SDK
      if (!window.Square) {
        console.error("Square SDK script not found");
        setIsError(true);
        return;
      }

      // 2. Prevent double-initialization in React Strict Mode
      if (paymentInstance.current) return;

      try {
        // 3. Load from .env securely using Vite's system
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        // Verify variables are loaded before proceeding
        if (!appId || !locationId) {
          throw new Error("VITE_SQUARE variables not found in .env");
        }

        const payments = window.Square.payments(appId, locationId);
        paymentInstance.current = payments;

        const card = await payments.card();
        await card.attach('#card-container');
        cardInstance.current = card;
        
        setIsSdkReady(true);
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
    
    // Guard clause: Ensure SDK is ready and no process is already running
    if (!cardInstance.current || isProcessing || !isSdkReady) return;

    try {
      const result = await cardInstance.current.tokenize();
      if (result.status === 'OK') {
        // Send the secure nonce (token) to your parent component's handler
        onTokenReceived(result.token); 
      } else {
        const errorMsg = result.errors ? result.errors[0].message : "Invalid card details";
        alert(`Payment Error: ${errorMsg}`);
      }
    } catch (e) {
      console.error("Tokenization failed", e);
      alert("System failure: Could not generate payment token.");
    }
  };

  return (
    <div className="payment-box">
      {isError && (
        <p style={{ color: '#ff4d4d', fontWeight: 'bold', padding: '10px', border: '1px solid red' }}>
          ⚠️ Payment Portal failed to load. Please verify your .env file and refresh.
        </p>
      )}
      
      <div id="card-container" style={{ minHeight: '100px', marginBottom: '15px' }}>
        {!isSdkReady && !isError && <p>Connecting to secure payment vault...</p>}
      </div>
      
      <button 
        type="button" 
        className={`finalize-button ${isProcessing ? 'loading' : ''}`}
        onClick={handlePayment}
        disabled={isProcessing || isError || !isSdkReady}
      >
        {isProcessing ? "Verifying with the Bank..." : "Finalize Your Preorder"}
      </button>
    </div>
  );
};

export default SquarePayment;