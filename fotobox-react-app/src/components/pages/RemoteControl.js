import React, { useState, useEffect, useRef } from 'react';
import WebRTC from '../controllers/WebRTC';
import './RemoteControl.css';

function RemoteControl() {
    const [isReady, setIsReady] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [imageCreated, setImageCreated] = useState(false); 
    const [showImage, setShowImage] = useState(false);

    const canvasRef = useRef(null);

    useEffect(() => {
        const checkDataChannel = () => {
            if (WebRTC.dataChannel) {
                setIsReady(true);
            } else {
                console.log('Data channel is not available');
                setIsReady(false);
            }
        };

        checkDataChannel();
        const interval = setInterval(checkDataChannel, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleStartCountdown = () => {
        if (isReady && WebRTC.dataChannel.readyState === 'open') {
            const message = JSON.stringify({ type: 'startCountdown' });
            console.log('Sending countdown message:', message);
            WebRTC.sendMessage(message);
        }
    };    

    const handleSavePicture = () => {
        if (imageURL) {
            const link = document.createElement('a');
            link.href = imageURL;
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}.png`;
            link.download = formattedDate;
            link.click(); 
            URL.revokeObjectURL(link.href); 
        } else {
            console.log('No image URL available for download');
        }
    };

    const handleRetryPhoto = () => {
        if (isReady && WebRTC.dataChannel.readyState === 'open') {
            const message = JSON.stringify({ type: 'retryPhoto' });
            console.log('Sending retry photo message:', message);
            WebRTC.sendMessage(message);
            setImageCreated(false); 
            setImageURL(''); 
            setShowImage(false);
        } else {
            console.log('Data channel is not ready for retrying photo');
        }
    };
    
    let receivedChunks = [];

    const handleMessage = (data) => {
        const message = JSON.parse(data);
    
        switch (message.type) {
            case 'photoData':
                if (message.index === 0) {
                    receivedChunks = [];  
                    setShowImage(false);
                }
    
                receivedChunks.push(message.data);
    
                console.log(`Chunk ${message.index + 1}/${message.totalChunks} received.`);
    
                if (message.index + 1 === message.totalChunks) {
                    const completeImageData = receivedChunks.join(''); 
                    setImageURL(`data:image/png;base64,${completeImageData}`);
                    createImageBlob(completeImageData);  
                    setImageCreated(true); 
                    setShowImage(true);
                }
                break;
            default:
                break;
        }
    };
    
    const createImageBlob = (base64Data) => {
        try {
            const base64Content = base64Data.split(',')[1];
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
    
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
    
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            console.log('Blob created successfully:', blob);
            const blobUrl = URL.createObjectURL(blob);
            setImageURL(blobUrl);
        } catch (error) {
            console.error('Error creating Blob:', error);
        }
    };
    
    useEffect(() => {
        WebRTC.onData(handleMessage);
    }, []);

    return (
        <div className="RemoteControl">
            <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'}/>

            <div className="header">
                <img src={process.env.PUBLIC_URL + '/images/hsa-logo.png'} alt="HSA Logo" id="hsa-logo" />
                <img src={process.env.PUBLIC_URL + '/images/novotrend-logo.png'} alt="Novotrend Logo" id="novotrend-logo" />
            </div>

            {showImage && (
                <div className="image-container">
                    <img src={imageURL} alt="Received" className="received-image" />
                </div>
            )}
    
            <div className="button-container">
                {!imageCreated && (
                    <button onClick={handleStartCountdown} disabled={!isReady}>Start</button>
                )}
                {imageCreated && (
                    <button onClick={handleSavePicture} disabled={!isReady}>Save</button>
                )}
                {imageCreated && (
                    <button id="retry" onClick={handleRetryPhoto} disabled={!isReady}>Retry</button>
                )}
            </div>
        </div>
    );
}

export default RemoteControl;