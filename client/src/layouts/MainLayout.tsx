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

const Layout: React.FC = () => {
  const location = useLocation();
  const showUploadNavbar: boolean = ['/upload', '/upload/video', '/upload/image'].includes(location.pathname);

  return (
    <div>
      <Navbar />
      {showUploadNavbar && <UploadNavbar />}
      <div style={{ paddingTop: '100px' }}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/upload/*" element={<Uploading />} />
          <Route path="/upload/video" element={<VidUpload />} />
          <Route path="/upload/image" element={<ImgUpload />} />
          <Route path="/qa" element={<QualityAssurance />} />
          <Route path="/train" element={<Training />} />
        </Routes>
      </div>
    </div>
  );
}

export default Layout;
