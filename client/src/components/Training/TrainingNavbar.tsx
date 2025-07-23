import React from 'react';
import { NavLink } from 'react-router-dom';

const TrainingNavbar: React.FC = () => {
        return (
                <nav className="flex justify-between bg-gray-800 p-4 text-white">
                        <div className="flex space-x-4">
                                {/* <NavLink to="/train/sdxl" className="hover:text-gray-400 transition duration-300">SDXL</NavLink> */}
                                <NavLink to="/train/flux" className="hover:text-gray-400 transition duration-300">Flux</NavLink>
                                {/*<NavLink to="/train/wan" className="hover:text-gray-400 transition duration-300">WAN2.1</NavLink>*/}
                        </div>
                </nav>
        );
};

export default TrainingNavbar;
