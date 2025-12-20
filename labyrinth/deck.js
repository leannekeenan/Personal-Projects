// Define the deck
let deck = ['Right Path', 'Right Path', 'Right Path', 'Right Path', 'Right Path', 
    'Dead End', 'Dead End', 'Dead End', 'Dead End', 'Dead End', 
    'Monster', 'Monster', 'Trap', 'Trap', 'Trap', 'Treasure'];

let discardPile = [];
let rightPile = [];
let river = [];
let playerActions = {
'Forge A Path': { available: true },
'Scout Ahead': { available: true },
'It\'s Elementary!': { available: true },
'Careful Consideration': { available: true },
'Boost Moral': { available: true }
};
let usedActions = [];

// Shuffle deck helper function
function shuffleDeck() {
for (let i = deck.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
}
console.log("Shuffled Deck:", deck); // Log the deck after shuffling
}

// Draw cards from the deck
function drawCards(num) {
    const drawnCards = [];
    for (let i = 0; i < num; i++) {
        if (deck.length === 0) {
            if (discardPile.length > 0) {
                deck = [...discardPile];
                discardPile = [];
                shuffleDeck();
            } else {
                break;
            }
        }
        drawnCards.push(deck.pop());
    }
    updateDeckCount(); // Update the deck count after drawing
    return drawnCards;
}


// Render discard pile UI
function renderDiscardPile() {
document.getElementById('discard-pile').innerHTML = `Discard Pile: ${discardPile.length} cards`;
}

// Render right pile UI
function renderRightPile() {
document.getElementById('right-pile').innerHTML = `Right Path: ${rightPile.length} cards`;
}

// Render river UI
function renderRiver() {
document.getElementById('river').innerHTML = `River: ${river.join(', ')}`;
}

// Render actions UI
function renderActions() {
document.getElementById('actions').innerHTML = `
<button onclick="performAction('Forge A Path')" ${playerActions['Forge A Path'].available ? '' : 'disabled'}>Forge A Path</button>
<button onclick="performAction('Scout Ahead')" ${playerActions['Scout Ahead'].available ? '' : 'disabled'}>Scout Ahead</button>
<button onclick="performAction('It\\'s Elementary!')" ${playerActions['It\'s Elementary!'].available ? '' : 'disabled'}>It's Elementary!</button>
<button onclick="performAction('Careful Consideration')" ${playerActions['Careful Consideration'].available ? '' : 'disabled'}>Careful Consideration</button>
<button onclick="performAction('Boost Moral')" ${playerActions['Boost Moral'].available ? '' : 'disabled'}>Boost Moral</button>
`;
}

// Render deck size UI
function renderDeck() {
document.getElementById('deck').innerHTML = `Deck: ${deck.length} cards`;
}

let actionsUsed = 0; // Track the number of actions used

// Update the performAction function to track actions used
function performAction(action) {
    if (!playerActions[action].available) {
        alert("This action has already been used this round.");
        return;
    }

    switch (action) {
        case "Forge A Path":
            handleForgeAPath();
            break;
        case "Scout Ahead":
            handleScoutAhead();
            break;
        case "It's Elementary!":
            handleElementary();
            break;
        case "Careful Consideration":
            handleCarefulConsideration();
            break;
        case "Boost Moral":
            handleBoostMoral();
            break;
        default:
            console.log("Unknown action.");
    }

    // Mark action as used
    playerActions[action].available = false;
    actionsUsed++;
    renderActions();

    // Check if all actions have been used
    if (actionsUsed === 5) {
        setTimeout(resetActions, 100); // Delay reset to allow UI updates
    }
}

// Reset actions to be used again
function resetActions() {
    for (let action in playerActions) {
        playerActions[action].available = true;
    }
    actionsUsed = 0; // Reset the count of used actions
    renderActions();
}

// Initialize game on page load
window.onload = initGame;


// Handle "Forge A Path" action
function handleForgeAPath() {
console.log("Forge A Path action triggered!");
// Add 2 Right Path cards to the deck
for (let i = 0; i < 2; i++) {
deck.push('Right Path');
}
// Shuffle deck to maintain randomness
shuffleDeck();
// Render the updated deck size and discard pile
renderDeck();
renderDiscardPile();
}

// Handle "Scout Ahead" action
function handleScoutAhead() {
console.log("Scout Ahead action triggered!");
const [card] = drawCards(1);
river.push(card);
renderRiver();
}

// Handle "It's Elementary!" action
function handleElementary() {
console.log("It's Elementary! action triggered!");
const [card1, card2, card3] = drawCards(3);
const chosenCard = prompt("Choose a card to place on the bottom of the deck:", "1, 2, or 3");
if (chosenCard >= 1 && chosenCard <= 3) {
const selectedCard = [card1, card2, card3][chosenCard - 1];
deck.unshift(selectedCard);
deck = [...deck, ...[card1, card2, card3].filter(card => card !== selectedCard)];
}
renderRiver();
}

// Handle "Careful Consideration" action
function handleCarefulConsideration() {
console.log("Careful Consideration action triggered!");
const [card1, card2] = drawCards(2);
river.push(card1, card2);
renderRiver();
}

// Handle "Boost Moral" action
function handleBoostMoral() {
console.log("Boost Moral action triggered!");
const deadEndIndex = river.indexOf('Dead End');
if (deadEndIndex > -1) {
river.splice(deadEndIndex, 1); // Remove the Dead End
const newCard = drawCards(1)[0];
river.push(newCard);
}

// Move Right Path cards from discard pile to right pile
rightPile.push(...discardPile.filter(card => card === 'Right Path'));
discardPile = discardPile.filter(card => card !== 'Right Path');

// Render the updated right pile
renderRightPile();
renderRiver();
}

// Initialize the game
function initGame() {
    shuffleDeck();  // Shuffle the deck at the start
    drawCards(3).forEach(card => river.push(card));
    renderRiver();
    renderDiscardPile();
    renderDeck();
    renderActions();
    renderRightPile(); // Initialize right pile display
}

// Initialize game on page load
window.onload = initGame;
