import HealthIndicator from "./HealthIndicator";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gray-900 p-4">
      <div className="flex gap-8">
        <NavLink
          to="/video"
          style={({ isActive }) => ({
            color: isActive ? "#fff" : "#aaa",
            marginRight: "2rem",
            textDecoration: "none",
            fontWeight: isActive ? "bold" : "normal"
          })}
        >
          Video
        </NavLink>
        <NavLink
          to="/image"
          style={({ isActive }) => ({
            color: isActive ? "#fff" : "#aaa",
            marginRight: "2rem",
            textDecoration: "none",
            fontWeight: isActive ? "bold" : "normal"
          })}
        >
          Image
        </NavLink>
        <NavLink
          to="/view"
          style={({ isActive }) => ({
            color: isActive ? "#fff" : "#aaa",
            marginRight: "2rem",
            textDecoration: "none",
            fontWeight: isActive ? "bold" : "normal"
          })}
        >
          View
        </NavLink>
      </div>
      <HealthIndicator />
    </nav>
  );
}

export default Navbar;
