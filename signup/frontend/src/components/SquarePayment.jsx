import { useEffect, useRef, useState } from 'react';

const SquarePayment = ({ onTokenReceived, isProcessing }) => {
  const paymentInstance = useRef(null);
  const cardInstance = useRef(null);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const startSquare = async () => {
      // computer-to-computer check: Is the SDK globally available?
      if (!window.Square) {
        setIsError(true);
        return;
      }

      // Prevent re-init if already running
      if (paymentInstance.current) return;

      try {
        const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
        const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

        // If Vite hasn't populated these yet, stop and wait
        if (!appId || !locationId) return;

        const payments = window.Square.payments(appId, locationId);
        paymentInstance.current = payments;

        const card = await payments.card();
        await card.attach('#card-container');
        cardInstance.current = card;
        
        setIsLoaded(true);
        setIsError(false);
      } catch (err) {
        console.error("SDK Init Error:", err);
        setIsError(true);
      }
    };

    startSquare();

    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy();
        cardInstance.current = null;
      }
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cardInstance.current || isProcessing || !isLoaded) return;

    try {
      const result = await cardInstance.current.tokenize();
      if (result.status === 'OK') {
        // This is the "Magic Nonce" for Sandbox testing
        onTokenReceived(result.token);
      } else {
        alert(result.errors[0].message);
      }
    } catch (err) {
      console.error("Tokenization Error:", err);
    }
  };

  return (
    <div className="payment-box">
      {isError && <p style={{color: 'red'}}>⚠️ System Link Failed. Check .env variables.</p>}
      
      <div id="card-container" style={{ minHeight: '100px' }}>
        {!isLoaded && !isError && <p>Syncing with Square Vault...</p>}
      </div>
      
      <button 
        type="button" 
        className={`finalize-button ${isProcessing ? 'loading' : ''}`}
        onClick={handlePayment}
        disabled={isProcessing || !isLoaded}
      >
        {isProcessing ? "Processing..." : "Finalize Preorder"}
      </button>
    </div>
  );
};

export default SquarePayment;