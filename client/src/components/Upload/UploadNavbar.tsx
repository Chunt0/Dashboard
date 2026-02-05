import React from 'react';
import { NavLink } from 'react-router-dom';

const UploadNavbar: React.FC = () => {
	return (
		<nav className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm font-semibold sm:px-6 lg:px-10">
				<NavLink
					to="/upload/image"
					className={({ isActive }) =>
						`rounded-full px-4 py-2 transition ${
							isActive
								? "bg-amber-500/15 text-amber-800"
								: "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
						}`
					}
				>
					Image
				</NavLink>
				<NavLink
					to="/upload/video"
					className={({ isActive }) =>
						`rounded-full px-4 py-2 transition ${
							isActive
								? "bg-amber-500/15 text-amber-800"
								: "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
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
