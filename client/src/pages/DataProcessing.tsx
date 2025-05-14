import React from 'react';
import VideoUpload from '../components/Upload/VidUpload';
import ImageUpload from '../components/Upload/ImgUpload';

const DataProcessing: React.FC = () => {
	return (
		<div>
			<h1>Data Processing</h1>
			<h2>Uploading</h2>
			<h3>Videos</h3>
			<VideoUpload />
			<h3>Images</h3>
			<ImageUpload />
		</div>
	);
};

export default DataProcessing;

