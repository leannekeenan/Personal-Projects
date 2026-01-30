import { useEffect, useRef, useState } from 'react';

const SquarePayment = ({ onTokenReceived }) => {
  const paymentInstance = useRef(null);
  const cardInstance = useRef(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeSquare = async () => {
      // 1. Safety check: Don't initialize if Square isn't on the window yet
      if (!window.Square) {
        console.error("Square SDK not found");
        return;
      }

      // 2. Prevent double-initialization
      if (paymentInstance.current) return;

      try {
        // Replace with your actual Sandbox App ID if not using env variables
        const appId = import.meta.env.VITE_SQUARE_APP_ID || 'YOUR_APP_ID_HERE';
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID_HERE';

        const payments = window.Square.payments(appId, locationId);
        paymentInstance.current = payments;

        const card = await payments.card();
        // 3. Attach to the div ID. Ensure this ID exists in your HTML/CSS
        await card.attach('#card-container');
        cardInstance.current = card;
        
        setIsError(false);
      } catch (e) {
        console.error("Square Initialization Failed:", e);
        setIsError(true);
      }
    };

    initializeSquare();

    // 4. CLEANUP: This kills the old card box when the component re-renders
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
    if (!cardInstance.current) return;

    try {
      const result = await cardInstance.current.tokenize();
      if (result.status === 'OK') {
        onTokenReceived(result.token);
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
        className="finalize-button" 
        onClick={handlePayment}
      >
        Finalize Your Preorder
      </button>
    </div>
  );
};

export default SquarePayment;