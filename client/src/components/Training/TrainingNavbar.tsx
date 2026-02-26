import React from 'react';
import { NavLink } from 'react-router-dom';

const TrainingNavbar: React.FC = () => {
	return (
		<nav className="border-b border-slate-800 bg-slate-950">
			<div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-medium sm:px-6 lg:px-10">
                                <NavLink
                                        to="/train/sdxl"
                                        className={({ isActive }) =>
					`px-3 py-2 transition ${
						isActive
							? "text-white border-b border-slate-100"
							: "text-slate-400 hover:text-slate-100"
					}`
                                        }
                                >
                                        SDXL
                                </NavLink>
                                <NavLink
                                        to="/train/flux"
                                        className={({ isActive }) =>
					`px-3 py-2 transition ${
						isActive
							? "text-white border-b border-slate-100"
							: "text-slate-400 hover:text-slate-100"
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
