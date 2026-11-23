const billAmount = document.getElementById('bill-amount');

const tipButtons = document.querySelectorAll('[data-tip]');

let selectedTip = 0;

const customTip = document.getElementById('custom-tip');

const numberOfPeople = document.getElementById('number-of-people');

const tipAmountPerPerson = document.getElementById('tip-per-person');

const totalAmountPerPerson = document.getElementById('total-per-person');

const resetButton = document.getElementById('reset-button');

let errorMessage = document.getElementById('error-message');



function calculate() {
  const bill = parseFloat(billAmount.value);
  const people = parseInt(numberOfPeople.value);

  //if there is no bill or bill is less than 0 or there are no people or people is less than zero or no tip is selected...
    if(!bill || bill <=0 || !people || people <= 0 || !selectedTip) {
        //...the tip amount per person and the total ampunt per person shows $0.00
        tipAmountPerPerson.textContent = '$0.00';
        totalAmountPerPerson.textContent = '$0.00';
        return;
    }
    //the value of tipPerPerson equates to the value of the bill times the selected tip value which is divided by 100 to get the percentage. This value is then divided by the number of people to get the tip amount per person
    const tipPerPerson = (bill * (selectedTip / 100)) / people;
    //The totalPerPerson value is calculated by dividing the bill by the value of the number of people plus the tipPerPerson.
    const totalPerPerson = bill / people + tipPerPerson;

    //tipAmountPerPerson and totalAmountPerPerson will both be rounded to the second decimal place.
    tipAmountPerPerson.textContent = `$${tipPerPerson.toFixed(2)}`;
    totalAmountPerPerson.textContent = `$${totalPerPerson.toFixed(2)}`;

}

tipButtons.forEach(button => {
    button.addEventListener('click', () => {
        //when a tip button is clicked, the selectedTip value is set to the value of the data-tip attribute of the button that was clicked.
        selectedTip = parseInt(button.dataset.tip);
        customTip.value = ''; // Clear custom tip input when a button is clicked

        tipButtons.forEach(btn => btn.classList.remove('active')); // Remove active class from all buttons
        button.classList.add('active'); // Add active class to the clicked button
        calculate();
    });
});

customTip.addEventListener('input', () => {
    selectedTip = parseFloat(customTip.value) || 0; // Set selectedTip to the custom tip value or 0 if empty
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
    calculate();
});

if(!bill || !numberOfPeople || !selectedTip || bill <= 0 || numberOfPeople <= 0 || selectedTip <= 0) {
    errorMessage.textContent = 'Please enter valid values for all fields.';
} else {
    errorMessage.textContent = '';
}