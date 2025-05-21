import React from 'react';
import VidUpload from '../components/Upload/VidUpload';
import ImgUpload from '../components/Upload/ImgUpload';
import { BrowserRouter as Routes, Route } from "react-router-dom";

const Uploading: React.FC = () => {
	return (
		<div style={{ padding: "1rem" }}>
			<Routes>
				<Route path="/upload/image" element={<ImgUpload />} />
				<Route path="/upload/video" element={<VidUpload />} />
			</Routes>
		</div>
	);
};

export default Uploading;

