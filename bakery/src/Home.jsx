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

const App = () => (
  <div>
    <header>
      <HeroSection />
    </header>

    <main>
      <PitchSection />
      <StorySection />
    </main>
  </div>
);

export default App;
