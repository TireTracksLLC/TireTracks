import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./Components/Home.jsx";
import About from "./Components/About.jsx";
import Services from "./Components/Services.jsx";
import SignIn from "./Pages/SignIn.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Inventory from "./Pages/Inventory.jsx";
import FitmentLookup from "./Pages/FitmentLookup.jsx";

function HomePage() {
  return (
    <>
      <Navbar />
      <Home />
      <About />
      <Services />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Inventory" element={<Inventory />} />
        <Route path="/Fitment" element={<FitmentLookup />} />
      </Routes>
    </Router>
  );
}
