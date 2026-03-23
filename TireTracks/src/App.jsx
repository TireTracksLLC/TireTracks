import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home.jsx';
import Navbar from './Components/Navbar.jsx';
import About from './Components/About.jsx';
import Services from './Components/Services.jsx';
import SignIn from './Pages/SignIn.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import LookupInventory from './LookupInventory.jsx';
import ManageInventory from './ManageInventory.jsx';
import Inventory from "./Pages/Inventory.jsx";



export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<><Navbar/><Home/><About/><Services/></>} />
                <Route path='/SignIn' element={<SignIn />} />
                <Route path='/Dashboard' element={<Dashboard/>} />
                <Route path="/Lookup" element={<LookupInventory/>}/>
                <Route path="/Manage" element={<ManageInventory/>}/>
                <Route path="/inventory" element={<Inventory />} />
            </Routes>
        </Router>
    )
}