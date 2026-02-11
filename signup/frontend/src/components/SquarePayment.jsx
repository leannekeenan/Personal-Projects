import { useEffect, useRef, useState } from 'react';

const SquarePayment = ({ onTokenReceived, isProcessing }) => {
  const paymentInstance = useRef(null);
  const cardInstance = useRef(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeSquare = async () => {
      if (!window.Square) {
        console.error("Square SDK not found");
        return;
      }

      if (paymentInstance.current) return;

      try {
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        console.log("DEBUG: App ID being used:", appId);
        console.log("DEBUG: Location ID being used:", locationId);

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
        // --- TEMPORARY TEST CHANGE ---
        console.log("Real token generated:", result.token);
        
        // Use the Sandbox 'magic' token instead of the real one
        onTokenReceived('cnon:card-nonce-ok'); 
        // ------------------------------
      } else {
        alert(`Validation Error: ${result.errors[0].message}`);
      }
    } catch (e) {
      console.error("Tokenization failed", e);
    }
  };

  return (
    <div className="payment-box">
      {isError && <p style={{color: 'red'}}>⚠️ Payment portal failed to load. Please refresh.</p>}
      <div id="card-container"></div>
      
      <button 
        type="button" 
        className={`finalize-button ${isProcessing ? 'loading' : ''}`}
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing Your Quest..." : "Finalize Your Preorder"}
      </button>
    </div>
  );
};

export default SquarePayment;