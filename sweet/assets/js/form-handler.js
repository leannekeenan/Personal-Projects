document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle the Order Form
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/.netlify/functions/submit-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    window.location.href = '/success.html';
                } else {
                    alert('❌ There was an error submitting your order. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Connection failed. Please check your internet.');
            }
        });
    }

    // 2. Handle the Connect Form
    const connectForm = document.getElementById('connectForm');
    if (connectForm) {
        connectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(connectForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/.netlify/functions/submit-connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    window.location.href = '/success.html';
                } else {
                    alert('❌ Error sending message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});