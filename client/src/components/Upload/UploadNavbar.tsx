import React from 'react';
import { NavLink } from 'react-router-dom';

const UploadNavbar: React.FC = () => {
	return (
		<nav className="flex justify-between bg-gray-800 p-4 text-white">
			<div className="flex space-x-4">
				<NavLink to="/upload/image" className="hover:text-gray-400 transition duration-300">Image</NavLink>
				<NavLink to="/upload/video" className="hover:text-gray-400 transition duration-300">Video</NavLink>
			</div>
		</nav>
	);
};

export default UploadNavbar;

