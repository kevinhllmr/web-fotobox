import React, { useState, useEffect } from 'react';
import WebRTC from '../controllers/WebRTC';

function RemoteControl() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkDataChannel = () => {
            if (WebRTC.dataChannel) {
                console.log('Data channel is available:', WebRTC.dataChannel);
                setIsReady(true);
            } else {
                console.log('Data channel is not available');
                setIsReady(false);
            }
        };

        // Check data channel status initially and every time it changes
        checkDataChannel();
        const interval = setInterval(checkDataChannel, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleStartCountdown = () => {
        if (isReady) {
            console.log('Sending start countdown message');
            WebRTC.sendMessage(JSON.stringify({ type: 'startCountdown' }));
        } else {
            console.log('Data channel is not ready for countdown');
        }
    };

    const handleSavePicture = () => {
        if (isReady) {
            console.log('Sending save picture message');
            WebRTC.sendMessage(JSON.stringify({ type: 'savePhoto' }));
        } else {
            console.log('Data channel is not ready for saving picture');
        }
    };

    const handleRetryPhoto = () => {
        if (isReady) {
            console.log('Sending retry photo message');
            WebRTC.sendMessage(JSON.stringify({ type: 'retryPhoto' }));
        } else {
            console.log('Data channel is not ready for retrying photo');
        }
    };

    const refreshConnection = () => {
        const checkDataChannel = () => {
            if (WebRTC.dataChannel) {
                console.log('Refreshing connection: data channel is available');
                setIsReady(true);
            } else {
                console.log('Refreshing connection: data channel is not available');
                setIsReady(false);
            }
        };

        checkDataChannel();
    };

    const handlePhotoData = (imageSrc) => {
        if (imageSrc) {
            downloadImage(imageSrc);
        } else {
            console.log('No photo data received');
        }
    };

    function downloadImage(imageSrc) {
        if (imageSrc) {
            const link = document.createElement('a');
            link.href = imageSrc;
            
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
            const fileName = `${formattedDate}.png`;

            link.download = fileName;
            link.click();
        }
    }

    useEffect(() => {
        // Handle incoming photo data
        WebRTC.onData(handlePhotoData);
    }, []);

    return (
        <div className="RemoteControl">
            <button onClick={handleStartCountdown} disabled={!isReady}>Start Countdown</button>
            <button onClick={handleSavePicture} disabled={!isReady}>Save Picture</button>
            <button onClick={handleRetryPhoto} disabled={!isReady}>Retry Photo</button>
            <button onClick={refreshConnection}>Refresh</button>
        </div>
    );
}

export default RemoteControl;
