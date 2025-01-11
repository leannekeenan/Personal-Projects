
  async function fetchUnavailableDatesAndTimes() {
    const response = await fetch('/api/orders'); // API endpoint for orders
    return response.json(); // Returns { date: ["08:00", "09:00"], ... }
  }

  // Update the calendar and time dropdown
  async function updateAvailability() {
    const unavailable = await fetchUnavailableDatesAndTimes();
    const dateInput = document.getElementById('order-date');
    const timeSelect = document.getElementById('order-time');
    
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      const unavailableTimes = unavailable[selectedDate] || [];
      
      // Reset time dropdown
      Array.from(timeSelect.options).forEach(option => {
        if (option.value && unavailableTimes.includes(option.value)) {
          option.disabled = true;
        } else {
          option.disabled = false;
        }
      });
    });
  }

  // Display a message if the selected time is unavailable
  document.getElementById('order-time').addEventListener('change', (e) => {
    const unavailableTimes = unavailable[document.getElementById('order-date').value] || [];
    const unavailableMsg = document.getElementById('unavailable-msg');
    
    if (unavailableTimes.includes(e.target.value)) {
      unavailableMsg.style.display = 'block';
    } else {
      unavailableMsg.style.display = 'none';
    }
  });

  // Initialize availability check
  updateAvailability();

