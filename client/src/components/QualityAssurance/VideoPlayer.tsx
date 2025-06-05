import React from 'react';

const VideoPlayer: React.FC = () => {
        return (
                <div className="mb-3">
                        <video controls width="860">
                                <source src='' type="video/mp4" />
                                Your browser does not support the video tag
                        </video>
                </div>
        )
};

export default VideoPlayer;
