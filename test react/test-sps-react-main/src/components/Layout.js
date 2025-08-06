import React from 'react';
import Navbar from './Navbar';
import '../styles/Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-container">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} SPS Group. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;