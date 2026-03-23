import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../Services/auth";
import {Link as RouterLink} from 'react-router-dom'
import { signOut } from "../Services/auth";



export default function DashNav(){
    const [user,setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            const currentUser = await getUser();

            if(!currentUser){
                navigate("/signin")
            }
            setUser(currentUser);
        }

        fetchUser();
    }, []);
    return(
        <aside className="sidebar">
        <h2>TireTracks</h2>

        <nav>
            <RouterLink to='/Dashboard'>
                <button>Dashboard</button>
            </RouterLink>
          <button>Inventory</button>
        </nav>

        <div className="profile">
          {user ? (
            <div className="dropdown">
              <button
                className="dropdown-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.email}
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => alert("Settings clicked")}>Settings</button>
                  <button onClick={signOut}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </div>
      </aside>
    )
}