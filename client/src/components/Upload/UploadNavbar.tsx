import React from 'react';
import { NavLink } from 'react-router-dom';

const UploadNavbar: React.FC = () => {
	return (
		<nav className="border-b border-slate-800 bg-slate-950">
			<div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-medium sm:px-6 lg:px-10">
				<NavLink
					to="/upload/image"
					className={({ isActive }) =>
					`px-3 py-2 transition ${
						isActive
							? "text-white border-b border-slate-100"
							: "text-slate-400 hover:text-slate-100"
					}`
					}
				>
					Image
				</NavLink>
				<NavLink
					to="/upload/video"
					className={({ isActive }) =>
					`px-3 py-2 transition ${
						isActive
							? "text-white border-b border-slate-100"
							: "text-slate-400 hover:text-slate-100"
					}`
					}
				>
					Video
				</NavLink>
			</div>
		</nav>
	);
};

export default UploadNavbar;
