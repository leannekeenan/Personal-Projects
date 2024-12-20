//image to video hover effect
document.addEventListener('DOMContentLoaded', () => {
    let collapse = document.getElementById('collapse');
    let hidden = document.getElementById('hidden');

    collapse.addEventListener('click', () => {
        hidden.classList.toggle('hidden');
    });

    // Function to change background on hover and make it a link
    function changeBackgroundOnHover(elements, videoUrl, linkUrl) {
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            
            // Store the current background image
            let originalBackground = element.style.backgroundImage;

            element.addEventListener('mouseenter', function() {
                // Create an anchor element
                let anchor = document.createElement('a');
                anchor.href = linkUrl;
                anchor.style.position = 'absolute';
                anchor.style.top = '0';
                anchor.style.left = '0';
                anchor.style.width = '100%';
                anchor.style.height = '100%';
                anchor.style.display = 'block';

                // Change background to video
                let videoElement = document.createElement('video');
                videoElement.src = videoUrl;
                videoElement.autoplay = true;
                videoElement.loop = true;
                videoElement.muted = true;
                videoElement.style.position = 'absolute';
                videoElement.style.top = '0';
                videoElement.style.left = '0';
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
                videoElement.style.objectFit = 'cover';
                videoElement.classList.add('video-background');

                anchor.appendChild(videoElement);

                element.style.position = 'relative';
                element.appendChild(anchor);
            });

            element.addEventListener('mouseleave', function() {
                // Revert background to original image
                element.style.backgroundImage = originalBackground;
                let anchor = element.querySelector('a');
                if (anchor) {
                    element.removeChild(anchor);
                }
            });
        }
    }

    // Get elements
    let salon = document.getElementsByClassName('salon');
    let coffee = document.getElementsByClassName('coffee');
    let pokemon = document.getElementsByClassName('pokemon');
    let dungeon = document.getElementsByClassName('dungeon');
    let mole = document.getElementsByClassName('mole');
    let speech = document.getElementsByClassName('speech');
    let todo = document.getElementsByClassName('todo');
    let rating = document.getElementsByClassName('rating');
    let news = document.getElementsByClassName('news');

    // URLs for the videos (you need to provide the actual video URLs)
    let salonVideo = '/portfolio/assets/video/salon.mp4'
    let coffeeVideo = '/portfolio/assets/video/coffee.mp4'
    let pokemonVideo = '/portfolio/assets/video/pokemon.mp4'
    let dungeonVideo = '/portfolio/assets/video/dungeon.mp4'
    let moleVideo = '/portfolio/assets/video/mole.mp4'
    let speechVideo = '/portfolio/assets/video/speech.mp4'
    let todoVideo = '/portfolio/assets/video/todo.mp4'
    let ratingVideo = '/portfolio/assets/video/rating.mp4'
    let newsVideo = '/portfolio/assets/video/newsletter.mp4'

    // URLs for the project links
    let projectLinks = {
        salon: 'https://beautesalon.netlify.app',
        coffee: 'https://urbanbrews.netlify.app',
        pokemon: 'https://classicpokedex.netlify.app',
        dungeon: 'https://dungeonforge.netlify.app/',
        mole: 'https://smackamole.netlify.app',
        speech: 'https://soundspeech.netlify.app',
        todo: 'https://kws-taskapp.netlify.app',
        rating: 'https://femproject-interactiveratingcomponent.netlify.app',
        news: 'https://femproject-newslettersignupform.netlify.app'
    };

    // Apply function to all elements
    changeBackgroundOnHover(salon, salonVideo, projectLinks.salon);
    changeBackgroundOnHover(coffee, coffeeVideo, projectLinks.coffee);
    changeBackgroundOnHover(pokemon, pokemonVideo, projectLinks.pokemon);
    changeBackgroundOnHover(dungeon, dungeonVideo, projectLinks.dungeon);
    changeBackgroundOnHover(mole, moleVideo, projectLinks.mole);
    changeBackgroundOnHover(speech, speechVideo, projectLinks.speech);
    changeBackgroundOnHover(todo, todoVideo, projectLinks.todo);
    changeBackgroundOnHover(rating, ratingVideo, projectLinks.rating);
    changeBackgroundOnHover(news, newsVideo, projectLinks.news);
});


//smooth page transition
document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.nav-links a, .home .action a');
    const navHeight = document.querySelector('nav').offsetHeight;

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                
            }
        });
    });
});



//email functionality
var TO_ADDRESS = "l_keenan@outlook.com";


//clear email form
document.addEventListener("DOMContentLoaded", function() {
    // Select the form
    const form = document.getElementById('form');
    // Select the clear button
    const clearButton = document.getElementById('clear');

    // Add click event listener to the clear button
    clearButton.addEventListener('click', function(event) {
        // Reset the form, which clears all input fields
        form.reset();
    });

    // Add submit event listener to the form
    form.addEventListener('submit', function(event) {
        // Select the message input field
        const messageInput = document.getElementById('message');
        // Check if the message input field is empty
        if (messageInput.value.trim() === '') {
            // Prevent the form from being submitted
            event.preventDefault();
            // Alert the user that the message field is required
            alert('Your message will be cleared once you click "OK"');
        }
    });
});



function doPost(e) {
  try{
    Logger.log(e);
    MailApp.sendEmail(TO_ADDRESS, "Contact Form Submitted", JSON.stringify(e.parameters));

    return contentService.createTextOutput(
      JSON.stringify({"result" : "success", "data" : JSON.stringift(e.parameters)})
    )
    .setMimeType(contentService.MimeType.JSON)
  }
  catch(error) {
    Logger.log(error);
    return contentService.createTextOutput(JSON.stringify({"result":"error", "error":e})).setMimeType(contentService.MimeType.JSON)
  }
}

//open resume on black page
document.getElementById('resumeLink').addEventListener('click', function(event) {
    event.preventDefault();
    window.open(this.href, '_blank');
});
