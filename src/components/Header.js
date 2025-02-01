import React from 'react';
import logo from '../assets/images/logo.png';  // Correct path

function Header() {
  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />
    </header>
  );
}

export default Header;
