import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* 1. Brand/Logo Section */}
        <div className="footer-brand">
          <h3>The Rally Zone sports Management</h3>
          <p>
            The premier destination for tennis excellence in Jaipur.
          </p>
        </div>

        {/* 2. Navigation Links Section */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><a href="#">Latest News</a></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        {/* 3. Contact Info Section */}
        <div className="footer-contact">
          <h4>Get in Touch</h4>
          <p>
            Jaipur, Rajasthan, India
          </p>
          <p>
            Email: <a href="mailto:asheeshmalpani@yahoo.com">asheeshmalpani@yahoo.com</a>, <a href="mailto:ramanaharnoor@gmail.com">ramanaharnoor@gmail.com</a>
          </p>
          <p>
            Phone: +91 99017 99022, +91 85294 10802
          </p>
        </div>
      </div>

      {/* 4. Copyright Bar */}
      <div className="footer-bottom">
        <p>
          &copy; {currentYear} The Rally Zone sports Management. All Rights Reserved.
        </p>
        <div className="social-links">
          {/* Use placeholders for social media icons */}
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;