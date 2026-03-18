import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home.jsx';
import Navbar from './Components/Navbar.jsx';
import About from './Components/About.jsx';
import Services from './Components/Services.jsx';
import SignIn from './Pages/SignIn.jsx';
import Dashboard from './Pages/Dashboard.jsx';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<><Navbar/><Home/><About/><Services/></>} />
                <Route path="/About" element={<About />} />
                {/*<Route path='/SignIn' element={<SignIn />} />
                <Route path='/Dashboard' element={<Dashboard/>}  />*/}
            </Routes>
        </Router>
    )
}