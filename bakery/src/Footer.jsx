import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Sweet Adventures Club. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
// The Footer component is a simple functional component that returns a footer element with a paragraph element containing the copyright information. This component is used in the App component to display the footer on all pages of the website.
