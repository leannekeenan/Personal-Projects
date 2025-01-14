document.addEventListener("DOMContentLoaded", function () {
    const cheesecakeInputs = document.querySelectorAll('.cheesecake-options input');
    const toppingInputs = document.querySelectorAll('.topping-options input');
    const specialRequests = document.getElementById("special-requests");
    const orderPreview = document.getElementById("order-preview");
    const totalPrice = document.getElementById("total-price");
    const submitButton = document.getElementById("submit-order");

    const clientEmail = document.getElementById("clientEmail").value
    // Prices for cheesecakes and toppings
    const cheesecakePrices = {
      "Classic": 80,
      "Chocolate": 80,
      "Pumpkin": 80,
      "Cookies & Cream": 80,
      "Speculoos & Cream": 80,
      "Nilla & Cream": 80,
      "Ginger Snap": 80
    };

    const toppingPrices = {
      "Strawberry Compote": 10,
      "Cherry Compote": 10,
      "Raspberry Compote": 10,
      "Lemon Icing": 10,
      "Apple Compote": 10,
      "Salted Caramel Sauce": 10,
      "White Chocolate Sauce": 10,
      "Dark Chocolate Sauce": 10
    };

    let currentBases = []; // Store all selected cheesecake bases
    let currentToppings = []; // Store all selected toppings and their quantities
    let currentPrice = 0; // To track total price

    // Update order preview and total price
    function updateOrder() {
      let previewText = "";
      currentBases.forEach(base => {
        previewText += `<br>${base.name} (x${base.quantity})`;
      });

      let toppingsText = currentToppings.length ? ` ${currentToppings.map(topping => `${topping.name} (x${topping.quantity})`).join(", ")}` : "No toppings selected";
      
      // Reset total to cheesecake price
      let total = currentPrice;

      // Add topping prices based on their quantities
      currentToppings.forEach(topping => {
        total += toppingPrices[topping.name] * topping.quantity;
      });

      // Update the order preview and total price
      orderPreview.innerHTML = `${previewText}<br>${toppingsText}`;
      totalPrice.innerText = `Total: $${total.toFixed(2)}`;
    }

    // Handle cheesecake base selection (quantity)
    cheesecakeInputs.forEach(input => {
      input.addEventListener('input', function () {
        const baseName = input.closest('label').textContent.split(' - ')[0].trim();
        const quantity = parseInt(input.value) || 0;

        if (quantity > 0) {
          // If cheesecake is selected, add it to the bases list
          const existingBase = currentBases.find(base => base.name === baseName);
          if (existingBase) {
            existingBase.quantity = quantity; // Update quantity if already selected
          } else {
            currentBases.push({ name: baseName, quantity: quantity });
          }
        } else {
          // If quantity is 0, remove the cheesecake base
          currentBases = currentBases.filter(base => base.name !== baseName);
        }

        // Recalculate the total price
        currentPrice = currentBases.reduce((total, base) => total + cheesecakePrices[base.name] * base.quantity, 0);
        updateOrder();
      });
    });

    // Handle topping quantity input (add or update topping)
    toppingInputs.forEach(input => {
      input.addEventListener('input', function () {
        const toppingName = input.closest('label').textContent.split(' - ')[0].trim();
        const quantity = parseInt(input.value) || 0;

        // Find if the topping already exists in the selection
        const existingToppingIndex = currentToppings.findIndex(topping => topping.name === toppingName);

        if (existingToppingIndex > -1) {
          if (quantity > 0) {
            // If topping exists, update quantity
            currentToppings[existingToppingIndex].quantity = quantity;
          } else {
            // If quantity is 0, remove topping
            currentToppings.splice(existingToppingIndex, 1);
          }
        } else if (quantity > 0) {
          // If topping doesn't exist, add it to the list
          currentToppings.push({ name: toppingName, quantity: quantity });
        }

        // Recalculate the total price
        updateOrder();
      });
    });

    // Handle special requests input (just updates the order preview)
    specialRequests.addEventListener('input', updateOrder);

    // Handle order submission (send email confirmation)
    submitButton.addEventListener('click', function () {
      const orderDetails = {
        bases: currentBases,
        toppings: currentToppings,
        total: currentPrice
      };

      // Prepare receipt for email
      const receiptText = `
        Order Details:
        Cheesecakes:
        ${orderDetails.bases.map(base => `${base.name} (x${base.quantity})`).join('\n')}
        
        Toppings:
        ${orderDetails.toppings.length ? orderDetails.toppings.map(topping => `${topping.name} (x${topping.quantity})`).join('\n') : "No toppings selected"}
        
        Special Requests: ${specialRequests.value ? specialRequests.value : "None"}
        
        Total: $${orderDetails.total.toFixed(2)}

        ---

        Thank you for your order!`;

      // Send receipt to company and client (assuming an email-sending backend)
      const emailPayload = {
        toClient: {
          email: {clientEmail},  // Replace with actual client email
          subject: "Your Cheesecake Order Confirmation",
          body: receiptText
        },
        toCompany: {
          email: "sweetadventuresclub@example.com",  // Replace with actual company email
          subject: "New Cheesecake Order Received",
          body: receiptText
        }
      };

      // Assuming you have a backend to handle the email sending
      fetch("/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      })
      .then(response => response.json())
      .then(data => alert("Thank you for your order! Confirmation has been sent."))
      .catch(error => console.error("Error sending receipt:", error));
    });
});
