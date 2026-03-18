import {Link, Element} from 'react-scroll'

export default function Navbar() 
    { 
        return ( 
            <nav className= "nav"> 
                <a href="/" className= "site-title"> TireTracks </a> 
                    <ul> 
                        <li> 
                            <Link activeClass= 'active' to='homepage' spy={true} smooth={true} duration={500} >Home</Link> 
                        </li> 
                        <li> 
                            <Link activeClass= 'active' to='About' spy={true} smooth={true} duration={500}>About</Link> 
                        </li> 
                        <li> 
                            <Link activeClass= 'active' to='Services' spy={true} smooth={true} duration={500}>Services</Link> 
                        </li> 
                    </ul> 
                <button className="sign-in">Sign In</button> 
            </nav> 
        ) 
    }