import {BrowserRouter as Router, Routes, Route, RouterContextProvider} from 'react-router-dom';
import Homepage from './Homepage.jsx';
import Navbar from './Navbar.jsx';

export default function App() {
    return (
    <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<Homepage />} />
        </Routes>
    </Router>
    )
}


