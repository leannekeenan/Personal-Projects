import React from 'react';
import './App.css';
import './index.css';

// Hero Section Component
const HeroSection = () => (
  <section className="hero">
    <div className='logo-container'>
      <img className='logo' src="../images/Sweet Adventures Club Logo V1.png" alt="Sweet Adventures Club Logo" />
    </div>

    <div>
      <h1 className="title">Sweet Adventures Club</h1>
      <p className="tagline">A Journey of Flavor</p>
    </div>
  </section>
);

// Pitch Section Component
const PitchSection = () => (
  <section className="pitch" id="pitch">
    <div>
      <p>
        At Sweet Adventures Club, we specialize in handcrafted, small-batch
        cheesecakes that are perfectly portioned for any occasion. Our cheesecakes,
        the size of a cupcake, are made with the finest ingredients to ensure every
        bite is a creamy, indulgent experience. Whether you're treating yourself,
        celebrating with loved ones, or searching for the perfect gift, our
        single-serve cheesecakes offer a delightful twist on a classic favorite. It's
        cheesecake, reimagined—just the right size to enjoy and savor.
      </p>
    </div>

  </section>
);

//Process Section
const ProcessSection = () => (
  <section className="process" id="process">
    <h2>How It Works</h2>
    <div className="process-step">
      <img src="../images/Step 1.png" alt="Step 1" />
      <p>Choose your favorite flavors and toppings from our rotating selection of cheesecakes.</p>
    </div>

    <div className="process-step">
      <img src="../images/Step 2.png" alt="Step 2" />
      <p>Place your order online and select a delivery date that works for you.</p>
    </div>

    <div className="process-step">
      <img src="../images/Step 3.png" alt="Step 3" />
      <p>Enjoy your cheesecake! Each order comes with a set of four delicious flavors.</p>
    </div>
  </section>
);


// Story Section Component
const StorySection = () => (
  <section className="story" id="story">
    <h2>Baking Dreams into Reality: Our Story</h2>
    <p>
      Sweet Adventures was born during the pandemic, when the simple act of
      baking cheesecakes for friends and family turned into something much more.
      What started as a fun hobby quickly caught the attention of loved ones, who
      couldn't get enough of the creamy, indulgent cheesecakes. Encouraged by their
      praise, the idea of sharing these treats with the world began to take shape.
      The concept of individual-sized cheesecakes, perfectly portioned for a personal
      experience, was created to offer a unique twist on a classic favorite. Made in
      small batches with the finest ingredients, each cheesecake is designed to bring
      joy in every bite. What began as a passion for baking has now grown into Sweet
      Adventures—a place where every cheesecake is crafted with care and made to be
      savored.
    </p>
  </section>
);

const SocialSection = () => (
  <section className="social" id="social">
  <h2>Follow Our Journey</h2>
  <ul className="social-links">
    <li>
      <a href="https://www.instagram.com/sweetadventuresclub/" target="_blank" rel="noreferrer">
        <img src="../images/instagram-icon.png" alt="Follow us on Instagram" />
      </a>
    </li>
    <li>
      <a href="https://twitter
      .com/SweetAdventures" target="_blank" rel="noreferrer">
        <img src="../images/twitter-icon.png" alt="Follow us on Twitter" /> 
      </a>
    </li>
    <li>
      <a href="https://www.facebook.com/SweetAdventuresClub" target="_blank" rel="noreferrer">
        <img src="../images/facebook-icon.png" alt="Follow us on Facebook" /> 
      </a>
    </li>
    
  </ul>

  <div className="discord">
    <h2>Or Join Our Sweet Community on Discord!</h2>
    <p>
      Chat with fellow cheesecake lovers, get sneak peeks at new flavors, and share your own creations!  
    </p>
    <p>
      We&rsquo;d love to see where and how you enjoy your cheesecakes—snap a pic and tell us your story in the community!
    </p>
    <a href="YOUR_DISCORD_LINK" target="_blank" rel="noopener noreferrer" className="discord-button">
      Join Now
    </a>
  </div>
</section>

);

const App = () => (
  <div>
    <header>
      <HeroSection />
    </header>

    <main>
      <PitchSection />
      <ProcessSection />
      <StorySection />
      <SocialSection />
    </main>
  </div>
);

export default App;
