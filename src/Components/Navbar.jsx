import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="nav">
      <RouterLink to="/" className="site-title">
        TireTracks
      </RouterLink>

      <ul>
        <li>
          <ScrollLink to="homepage" smooth={true} offset={-80} duration={500}>
            Home
          </ScrollLink>
        </li>
        <li>
          <ScrollLink to="About" smooth={true} offset={-80} duration={500}>
            About
          </ScrollLink>
        </li>
        <li>
          <ScrollLink to="Services" smooth={true} offset={-80} duration={500}>
            Services
          </ScrollLink>
        </li>
      </ul>

      <RouterLink to="/SignIn">
        <button className="sign-in">Sign In</button>
      </RouterLink>
    </nav>
  );
}