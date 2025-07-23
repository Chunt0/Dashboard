import HealthIndicator from "./HealthIndicator";
import { NavLink } from "react-router-dom";
import { FaAccessibleIcon } from 'react-icons/fa'; // Importing an icon

function Navbar() {
        return (
                <nav className="flex items-center justify-between bg-black p-4">
                        <div className="flex gap-8">

                                <NavLink
                                        to="/"
                                        style={({ isActive }) => ({
                                                color: isActive ? "#fff" : "#aaa",
                                                marginRight: "2rem",
                                                textDecoration: "none",
                                                fontWeight: isActive ? "bold" : "normal"
                                        })}
                                >
                                        <FaAccessibleIcon /> {/* Using an icon instead of text */}
                                </NavLink>
                                <NavLink
                                        to="/upload"
                                        style={({ isActive }) => ({
                                                color: isActive ? "#fff" : "#aaa",
                                                marginRight: "2rem",
                                                textDecoration: "none",
                                                fontWeight: isActive ? "bold" : "normal"
                                        })}
                                >
                                        Upload
                                </NavLink>
                                <NavLink
                                        to="/qa"
                                        style={({ isActive }) => ({
                                                color: isActive ? "#fff" : "#aaa",
                                                marginRight: "2rem",
                                                textDecoration: "none",
                                                fontWeight: isActive ? "bold" : "normal"
                                        })}
                                >
                                        QA
                                </NavLink>
                                <NavLink
                                        to="/train"
                                        style={({ isActive }) => ({
                                                color: isActive ? "#fff" : "#aaa",
                                                marginRight: "2rem",
                                                textDecoration: "none",
                                                fontWeight: isActive ? "bold" : "normal"
                                        })}
                                >
                                        Train
                                </NavLink>
                                {/*<NavLink
          to="/generate"
          style={({ isActive }) => ({
            color: isActive ? "#fff" : "#aaa",
            marginRight: "2rem",
            textDecoration: "none",
            fontWeight: isActive ? "bold" : "normal"
          })}
        >
          Generate
        </NavLink>*/}
                                <HealthIndicator />
                        </div>
                </nav>
        );
}

export default Navbar;
