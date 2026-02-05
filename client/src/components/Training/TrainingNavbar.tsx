import React from 'react';
import { NavLink } from 'react-router-dom';

const TrainingNavbar: React.FC = () => {
        return (
                <nav className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
                        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-semibold sm:px-6 lg:px-10">
                                <NavLink
                                        to="/train/sdxl"
                                        className={({ isActive }) =>
                                                `rounded-full px-4 py-2 transition ${
                                                        isActive
                                                                ? "bg-teal-500/15 text-teal-800"
                                                                : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
                                                }`
                                        }
                                >
                                        SDXL
                                </NavLink>
                                <NavLink
                                        to="/train/flux"
                                        className={({ isActive }) =>
                                                `rounded-full px-4 py-2 transition ${
                                                        isActive
                                                                ? "bg-teal-500/15 text-teal-800"
                                                                : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
                                                }`
                                        }
                                >
                                        Flux
                                </NavLink>
                                {/*<NavLink to="/train/wan" className="hover:text-gray-400 transition duration-300">WAN2.1</NavLink>*/}
                        </div>
                </nav>
        );
};

export default TrainingNavbar;
