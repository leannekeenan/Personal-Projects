document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


document.getElementById("purchase-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const customerName = document.getElementById("customer-name").value;
    const email = document.getElementById("clientEmail").value;
    const phone = document.getElementById("phone").value;
    const orderDate = document.getElementById("order-date").value;
    const orderTime = document.getElementById("order-time").value;
    const deliveryDetails = document.getElementById("delivery-details").value;
    const orderSummary = document.getElementById("order-preview").innerText;
    const totalPrice = document.getElementById("total-price").innerText;
    
    const orderDetails = `Name: ${customerName}\nEmail: ${email}\nPhone: ${phone}\nOrder Date: ${orderDate}\nOrder Time: ${orderTime}\nDelivery Address: ${deliveryDetails}\n\nOrder Summary:\n${orderSummary}\nTotal: ${totalPrice}`;
    
    const mailtoLink = `mailto:${email},sweetadventuresclub@gmail.com?subject=Sweet Adventures Club Order Confirmation&body=${encodeURIComponent(orderDetails)}`;
    
    window.location.href = mailtoLink;
});
