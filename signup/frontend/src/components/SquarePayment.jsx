import React, { useEffect, useRef } from 'react';

const SquarePayment = ({ onTokenReceived }) => {
  const isInitialized = useRef(false);
  const cardInstance = useRef(null); // Keep track of the card object itself

  useEffect(() => {
    // If already initialized, do nothing
    if (isInitialized.current) return;

    const initializeSquare = async () => {
      // 1. CLEAR THE DIV COMPLETELY
      const cardContainer = document.getElementById('card');
      if (cardContainer) cardContainer.innerHTML = ''; 

      if (!window.Square) {
        console.error("Square SDK not loaded in index.html");
        return;
      }

      const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
      const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

      try {
        const payments = window.Square.payments(appId, locationId);
        const card = await payments.card({
          style: {
            input: { fontSize: '16px', color: '#3e2723' }
          }
        });

        await card.attach("#card");
        
        // Save references
        cardInstance.current = card;
        isInitialized.current = true;

        const payButton = document.getElementById("pay-button");
        if (payButton) {
          payButton.onclick = async (event) => {
            event.preventDefault();
            payButton.disabled = true; // Prevent double clicking
            try {
              const result = await card.tokenize();
              if (result.status === "OK") {
                onTokenReceived(result.token);
              } else {
                console.error("Tokenization error", result.errors);
                payButton.disabled = false;
              }
            } catch (e) {
              console.error(e);
              payButton.disabled = false;
            }
          };
        }
      } catch (e) {
        console.error("Square Initialization Failed:", e);
      }
    };

    initializeSquare();

    // 2. THE CLEANUP FUNCTION (Crucial for fixing the triple input)
    return () => {
      if (cardInstance.current) {
        cardInstance.current.destroy(); // Explicitly kill the square instance
        cardInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, [onTokenReceived]);

  return (
    <div className="payment-area">
      {/* The container MUST be empty here */}
      <div id="card" style={{ minHeight: '120px', margin: '20px 0' }}></div>
      <button id="pay-button" className="submit-btn" type="button">
        Finalize Your Preorder
      </button>
    </div>
  );
};

export default SquarePayment;