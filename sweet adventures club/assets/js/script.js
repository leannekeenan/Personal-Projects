document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// Sticky navbar toggle on scroll
window.onscroll = function() {
    var navbar = document.querySelector('nav');
    var body = document.body;
    if (window.scrollY > 0) {
        navbar.classList.add('sticky');
        body.classList.add('sticky-nav-active');
    } else {
        navbar.classList.remove('sticky');
        body.classList.remove('sticky-nav-active');
    }
};
