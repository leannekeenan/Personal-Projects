const monster = '/labyrinth/images/cards/monster.png';
const trap = '/labyrinth/images/cards/trap.png';
const right = '/labyrinth/images/cards/right path.png';
const wrong = '/labyrinth/images/cards/wrong path.png';
const treasure = '/labyrinth/images/cards/treasure.png';


// Render river UI with clickable cards
function renderRiver() {
    const riverContainer = document.getElementById('river');
    riverContainer.innerHTML = ''; // Clear current river

    river.forEach((card, index) => {
        const cardElement = document.createElement('button');
        cardElement.classList.add('card'); // Add the card class
        cardElement.innerHTML = ''; // Initially display as face down
        cardElement.onclick = () => handleCardClick(index);
        riverContainer.appendChild(cardElement);
    });
}

// Get card icon based on type
function getCardIcon(card) {
    let src;
    switch (card) {
        case 'Right Path':
            src = right;
            break;
        case 'Treasure':
            src = treasure;
            break;
        case 'Monster':
            src = monster;
            break;
        case 'Trap':
            src = trap;
            break;
        case 'Dead End':
            src = wrong;
            break;
        default:
            src = ''; // Provide a default image or leave empty if no fallback needed
            break;
    }
    return `<img src="${src}" alt="${card}">`; // Return HTML for an image element
}





const cardElement = document.createElement('div');
cardElement.className = 'card';
cardElement.innerHTML = getCardIcon(card); // Use innerHTML to render HTML content
riverElement.appendChild(cardElement);



// Handle card click in the river
function handleCardClick(cardIndex) {
    const cardElement = document.querySelectorAll('#river button')[cardIndex];
    const card = river[cardIndex];

    if (cardElement.classList.contains('flipped')) {
        // Card is already flipped, remove it from the river
        river.splice(cardIndex, 1);
        discardPile.push(card); // Add the removed card to the discard pile

        // Update right pile if the discarded card is "Right Path"
        if (card === 'Right Path') {
            rightPile.push(card); // Add to right pile
            document.getElementById('right-pile').innerHTML = `Right Path: ${rightPile.length} cards`;
        }

        // Deduct the number of discarded cards from the deck total
        if (deck.length === 0 && discardPile.length > 0) {
            // Refill the deck from the discard pile if it's empty
            deck = [...discardPile];
            discardPile = [];
            shuffleDeck();
        }

        // Update the deck count display
        updateDeckCount();

        // Check if the river is empty
        if (river.length === 0) {
            refillRiver(); // Refill the river with cards from the deck
        }

        // Re-render the river and discard pile
        renderRiver();
        renderDiscardPile();
    } else {
        // Flip the card to reveal its type
        cardElement.classList.add('flipped');
        cardElement.innerHTML = getCardIcon(card); // Set the card icon HTML
    }
}


// Function to refill the river with cards from the deck
function refillRiver() {
    // Draw 3 new cards to refill the river
    const newCards = drawCards(3);
    river.push(...newCards);
}

// Draw cards from the deck
function drawCards(num) {
    const drawnCards = [];
    for (let i = 0; i < num; i++) {
        if (deck.length === 0) {
            // Refill the deck from the discard pile if it's empty
            if (discardPile.length > 0) {
                deck = [...discardPile];
                discardPile = [];
                shuffleDeck();
            } else {
                // If both deck and discard pile are empty, stop drawing
                break;
            }
        }
        drawnCards.push(deck.pop());
    }
    updateDeckCount(); // Update the deck count after drawing
    return drawnCards;
}

// Shuffle deck helper function
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Render discard pile UI
function renderDiscardPile() {
    document.getElementById('discard-pile').innerHTML = `Discard Pile: ${discardPile.length} cards`;
}

// Update deck count display
function updateDeckCount() {
    document.getElementById('deck').innerHTML = `Deck: ${deck.length} cards`;
}

// Initialize the game (specific to the river)
function initRiver() {
    // Shuffle the deck at the start
    shuffleDeck();  
    // Draw initial cards for the river
    river.push(...drawCards(3));
    renderRiver();
    renderDiscardPile();
    updateDeckCount(); // Initialize deck count display
}

// Function to handle specific player actions
function forgePath() {
    // Increase the deck value by 2
    deck.push('Right Path', 'Right Path');
    updateDeckCount(); // Update deck count display
}

function carefulConsideration() {
    // Decrease the deck value by 2
    if (deck.length >= 2) {
        deck.splice(deck.length - 2, 2); // Remove last 2 cards from deck
        updateDeckCount(); // Update deck count display
    }
}

// Initialize the game on page load
window.onload = initRiver;
