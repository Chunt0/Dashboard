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
                <div className="flex flex-col min-h-screen">
                        <Navbar />
                        {showUploadNavbar && <UploadNavbar />}
                        {showTrainingNavbar && <TrainingNavbar />}
                        <div className="flex-1">
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
                        </div>
                </div>
        );
}

export default Layout;

