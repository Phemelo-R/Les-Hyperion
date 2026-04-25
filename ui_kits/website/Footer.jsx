/* Footer.jsx */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">Les Hyperion</div>
      <div>Built by Phemelo-R · {new Date().getFullYear()}</div>
      <div>GIS · Remote Sensing · R · Python</div>
    </footer>
  );
}

window.Footer = Footer;
