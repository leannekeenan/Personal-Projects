const bubbleContainer = document.getElementById('bubble-container');

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Set random size and position
    const size = Math.random() * 50 + 10; // Random size between 10px and 60px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;

    // Set random animation duration
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`; // Random duration between 5s and 10s

    // Append the bubble to the container
    bubbleContainer.appendChild(bubble);

    // Remove bubble after animation completes
    setTimeout(() => {
        bubble.remove();
    }, 10000);
}

// Generate bubbles at regular intervals
setInterval(createBubble, 500);
