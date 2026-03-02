import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import Navbar from './Components/Navbar.jsx';
import About from './Pages/About.jsx';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<><Navbar/><Home/></>} />
                <Route path="/About" element={<About />} />
            </Routes>
        </Router>
    )
}