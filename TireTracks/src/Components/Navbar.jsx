export default function Navbar() 
    { 
        return ( 
            <nav className= "Nav"> 
                <a href="/" className= "site-title"> TireTracks </a> 
                    <ul> 
                        <li> 
                            <a href="/">Home</a> 
                        </li> 
                        <li> 
                            <a href="/About">About</a> 
                        </li> 
                        <li> 
                            <a href="/Contact">Contact</a> 
                        </li> 
                        <li> 
                            <a href="/Services">Services</a> 
                        </li> 
                    </ul> 
                <button className="sign-in">Sign In</button> 
            </nav> 
        ) 
    }