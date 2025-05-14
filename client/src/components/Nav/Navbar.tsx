import HealthIndicator from "./HealthIndicator";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-black p-4">
      <div className="flex gap-8">
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
          to="/qA"
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
        <HealthIndicator />
      </div>
    </nav>
  );
}

export default Navbar;
