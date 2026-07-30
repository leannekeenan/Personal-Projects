document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    var successMessage = document.getElementById('contact-success');

    if (!form) return;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
            .then(function () {
                form.style.display = 'none';
                successMessage.style.display = 'block';
            })
            .catch(function (error) {
                alert('Something went wrong. Please try again or email us directly.');
                console.error(error);
            });
    });
});