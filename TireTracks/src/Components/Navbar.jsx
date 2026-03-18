import {Link as ScrollLink} from 'react-scroll'
import {Link as RouterLink} from 'react-router-dom'

export default function Navbar() 
    { 
        return ( 
            <nav className= "nav"> 
                <a href="/" className= "site-title"> TireTracks </a> 
                    <ul> 
                        <li> 
                            <ScrollLink activeClass= 'active' to='homepage' spy={true} smooth={true} duration={500} >Home</ScrollLink> 
                        </li> 
                        <li> 
                            <ScrollLink activeClass= 'active' to='About' spy={true} smooth={true} duration={500}>About</ScrollLink> 
                        </li> 
                        <li> 
                            <ScrollLink activeClass= 'active' to='Services' spy={true} smooth={true} duration={500}>Services</ScrollLink> 
                        </li> 
                    </ul> 
                <RouterLink to='/SignIn'>
                    <button className="sign-in">Sign In</button>
                </RouterLink> 
            </nav> 
        ) 
    }