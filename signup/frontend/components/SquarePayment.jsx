import React, { useEffect } from 'react';

// Added onTokenReceived prop to link back to App.jsx
const SquarePayment = ({ onTokenReceived }) => {
  useEffect(() => {
    (async () => {
      // Logic to ensure the Square script from index.html is loaded
      if (!window.Square) {
        console.error("Square SDK not loaded");
        return;
      }

      const payments = window.Square.payments(
        import.meta.env.SQUARE_APPLICATION_ID, 
        import.meta.env.SQUARE_LOCATION_ID
      );

      const cardOptions = {
        style: {
          input: {
            color: "#000000",
            fontSize: "16px",
            placeholderColor: "#a0a0a0",
          },
          invalid: {
            color: "#ff0000",
          },
        },
      };

      try {
        const card = await payments.card(cardOptions);
        await card.attach("#card");
        const payButton = document.getElementById("pay-button");
        
        payButton.addEventListener("click", async function (event) {
          event.preventDefault();
          try {
            const result = await card.tokenize();
            if (result.status === "OK") {
              console.log("Tokenization succeeded:", result.token);
              
              // This sends the token back to the handlePayment function in App.jsx
              if (onTokenReceived) {
                onTokenReceived(result.token);
              }

            } else {
              let errorMessage = `Tokenization failed with status: ${result.status}`;
              if (result.errors) {
                errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
              }
              console.error(errorMessage);
            }
          } catch (e) {
            console.error("Tokenization error:", e);
          }
        });
      } catch (e) {
        console.error("Card initialization error:", e);
      }
    })();
  }, [onTokenReceived]); // Added prop to dependency array

  return (
    <div>
      <div id="card"></div>
      <button id="pay-button" type="button">Pay Now</button>
    </div>
  );
};

export default SquarePayment;