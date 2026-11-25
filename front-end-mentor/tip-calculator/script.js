const billAmount = document.getElementById('bill-amount');

const tipButtons = document.querySelectorAll('[data-tip]');

let selectedTip = 0;

const customTip = document.getElementById('custom-tip');

const numberOfPeople = document.getElementById('number-of-people');

const tipAmountPerPerson = document.getElementById('tip-per-person');

const totalAmountPerPerson = document.getElementById('total-per-person');

const resetButton = document.getElementById('reset-button');

const billError = document.getElementById('bill-error');
const peopleError = document.getElementById('error-message');


// Shows or clears the "Can't be zero" message and red outline for one input
function setError(input, messageEl, show) {
    messageEl.textContent = show ? "Can't be zero" : '';
    input.classList.toggle('error', show);
}

function calculate() {
    const bill = parseFloat(billAmount.value);
    const people = parseInt(numberOfPeople.value);

    const billEmpty = billAmount.value.trim() === '';
    const peopleEmpty = numberOfPeople.value.trim() === '';

    // A field shows an error if:
    // - something was typed in it and it isn't above 0, OR
    // - it's empty but a tip has already been chosen
    const billInvalid = (!billEmpty && !(bill > 0)) || (billEmpty && selectedTip > 0);
    const peopleInvalid = (!peopleEmpty && !(people > 0)) || (peopleEmpty && selectedTip > 0);

    setError(billAmount, billError, billInvalid);
    setError(numberOfPeople, peopleError, peopleInvalid);

    // If anything is missing or zero, show $0.00 and stop
    if (!bill || bill <= 0 || !people || people <= 0 || !selectedTip) {
        tipAmountPerPerson.textContent = '$0.00';
        totalAmountPerPerson.textContent = '$0.00';
        return;
    }

    // Tip per person = (bill * tip%) / number of people
    const tipPerPerson = (bill * (selectedTip / 100)) / people;
    // Total per person = bill split evenly + tip per person
    const totalPerPerson = bill / people + tipPerPerson;

    // Round both to 2 decimal places for display
    tipAmountPerPerson.textContent = `$${tipPerPerson.toFixed(2)}`;
    totalAmountPerPerson.textContent = `$${totalPerPerson.toFixed(2)}`;
}

tipButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Set selectedTip to the data-tip value of the clicked button
        selectedTip = parseInt(button.dataset.tip);
        customTip.value = ''; // Clear custom tip input when a button is clicked

        tipButtons.forEach(btn => btn.classList.remove('active')); // Remove active class from all buttons
        button.classList.add('active'); // Add active class to the clicked button
        calculate();
    });
});

customTip.addEventListener('input', () => {
    selectedTip = parseFloat(customTip.value) || 0; // Custom value, or 0 if empty
    tipButtons.forEach(btn => btn.classList.remove('active'));
    calculate();
});

billAmount.addEventListener('input', calculate);
numberOfPeople.addEventListener('input', calculate);

resetButton.addEventListener('click', () => {
    selectedTip = 0;
    billAmount.value = '';
    customTip.value = '';
    numberOfPeople.value = '';
    tipButtons.forEach(btn => btn.classList.remove('active'));
    calculate(); // also clears the error messages, since selectedTip is 0 and the fields are empty
});