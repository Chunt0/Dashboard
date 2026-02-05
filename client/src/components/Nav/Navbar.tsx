import HealthIndicator from "./HealthIndicator";
import { NavLink } from "react-router-dom";
import { FaAccessibleIcon } from "react-icons/fa";

function Navbar() {
        const navLinkClass = ({ isActive }: { isActive: boolean }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
                }`;

        return (
                <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur">
                        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-10">
                                <NavLink to="/" className="flex items-center gap-3 text-slate-900">
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-700">
                                                <FaAccessibleIcon className="text-lg" />
                                        </span>
                                        <span className="text-lg font-semibold tracking-tight">Studio Dashboard</span>
                                </NavLink>
                                <div className="flex flex-1 items-center justify-center gap-2">
                                        <NavLink to="/upload" className={navLinkClass}>
                                                Upload
                                        </NavLink>
                                        <NavLink to="/qa" className={navLinkClass}>
                                                QA
                                        </NavLink>
                                        <NavLink to="/train" className={navLinkClass}>
                                                Train
                                        </NavLink>
                                        <NavLink to="/generate" className={navLinkClass}>
                                                Generate
                                        </NavLink>
                                </div>
                                <HealthIndicator />
                        </div>
                </nav>
        );
}

export default Navbar;
