import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';

import Navbar from '../components/Nav/Navbar';
import UploadNavbar from '../components/Upload/UploadNavbar';

import Splash from '../pages/Splash';
import Uploading from '../pages/Uploading';
import QualityAssurance from '../pages/QualityAssurance';
import Training from '../pages/Training';
import VidUpload from '../components/Upload/VidUpload';
import ImgUpload from '../components/Upload/ImgUpload';
import TrainingNavbar from '../components/Training/TrainingNavbar';
import TrainSDXL from '../components/Training/TrainSDXL';
import TrainFlux from '../components/Training/TrainFlux';
import TrainWAN from '../components/Training/TrainWAN';
import Generate from '../pages/Generate';

const Layout: React.FC = () => {
        const location = useLocation();
        const showUploadNavbar: boolean = ['/upload', '/upload/video', '/upload/image'].includes(location.pathname);
        const showTrainingNavbar: boolean = ['/train', '/train/sdxl', '/train/flux', '/train/wan', '/train/hunyuan', '/train/ltx', '/train/cosmos', '/train/lumina', '/train/chroma', '/train/hidream'].includes(location.pathname)

		return (
			<div className="flex min-h-screen flex-col text-slate-100">
                        <Navbar />
                        {showUploadNavbar && <UploadNavbar />}
                        {showTrainingNavbar && <TrainingNavbar />}
                        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
                                <Routes>
                                        <Route path="/" element={<Splash />} />
                                        <Route path="/upload/*" element={<Uploading />} />
                                        <Route path="/upload/video" element={<VidUpload />} />
                                        <Route path="/upload/image" element={<ImgUpload />} />
                                        <Route path="/qa" element={<QualityAssurance />} />
                                        <Route path="/train" element={<Training />} />
                                        <Route path="/train/sdxl" element={<TrainSDXL />} />
                                        <Route path="/train/flux" element={<TrainFlux />} />
                                        <Route path="/train/wan" element={<TrainWAN />} />
                                        <Route path="/generate" element={<Generate />} />
                                </Routes>
                        </main>
                </div>
        );
}

export default Layout;
