import React, { useRef, useEffect, useState } from 'react';
import '../../App.css';
import './PhotoMode.css';
import { connectUSBDevice, getCameraAccess, startCountdown, takePicture, downloadImage, uploadImageToCloud, retryUSBDeviceConnection } from '../controllers/Controller.js';
import Peripherie from '../controllers/Peripherie.js';
import { useNavigate } from 'react-router-dom';
import WebRTC from '../controllers/WebRTC';

function PhotoMode() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);
    const [photoTaken, setPhotoTaken] = useState(false);
    const [webrtcConnected, setWebrtcConnected] = useState(false);
    const [showButtons, setButtonsShown] = useState(true);
    const [videoStreamActive, setVideoStreamActive] = useState(false);
    const [timerValue, setTimerValue] = useState(3);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const deviceUsed = localStorage.getItem('deviceUsed');
        if (deviceUsed === 'phone') {
            setButtonsShown(false);
        }

        const checkWebRTCConnection = () => {
            if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
                setButtonsShown(false);
            } else {
                setButtonsShown(true);
            }
        };

        checkWebRTCConnection();

        if (Peripherie.hasExternCamera) {
            connectUSBDevice(null, (device) => {
                getCameraAccess(device, videoRef, setVideoStreamActive)
                    .catch(() => retryUSBDeviceConnection());
            });
        } else {
            getCameraAccess(null, videoRef, setVideoStreamActive);
        }

        const peer = WebRTC.peer;
        if (peer) {
            peer.on('data', (data) => {
                handleIncomingData(data);
            });
        }

        WebRTC.onData(handleIncomingData);

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [cameraActive]);

    const handleIncomingData = (data) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'startCountdown':
                startPhotoCountdown();
                break;
            case 'savePhoto':
                handleSavePicture();
                break;
            case 'retryPhoto':
                handleRetakePicture();
                break;
            case 'photoData':
                handleReceivedPhotoData(message.data);
                break;
            default:
                break;
        }
    };

    const handleRetakePicture = () => {
        setImageSrc(null);
        setPhotoTaken(false);
        setCameraActive(false);
        setButtonsShown(true);
        setTimeout(() => {
            setCameraActive(true);
        }, 1);
    };

    const handleEndSession = () => {
        handleRetakePicture();
        navigate('/home/');
    };

    const startPhotoCountdown = () => {
        setButtonsShown(false);
        startCountdown(timerValue, setCountdown, capturePhoto);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken);
            sendPhotoData(canvasRef.current.toDataURL());
        }
    };

    const CHUNK_SIZE = 16000; // 16kB per chunk

    const sendPhotoData = (photoDataUrl) => {
        if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
            const chunks = splitIntoChunks(photoDataUrl, CHUNK_SIZE);
            
            chunks.forEach((chunk, index) => {
                const message = JSON.stringify({ 
                    type: 'photoData', 
                    data: chunk, 
                    index, 
                    totalChunks: chunks.length 
                });
    
                console.log(`Sending chunk ${index + 1}/${chunks.length}:`, message);
                WebRTC.sendMessage(message);
            });
        } else {
            console.log('Data channel is not open. Unable to send photo data.');
        }
    };    
    
    const splitIntoChunks = (data, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.substring(i, i + chunkSize));
        }
        return chunks;
    };
    

    const handleSavePicture = () => {
        if (Peripherie.cloudAccess) {
            uploadImageToCloud(imageSrc);
        } else {
            downloadImage(imageSrc);
        }
    };

    const handleReceivedPhotoData = (photoData) => {
        const link = document.createElement('a');
        link.href = photoData; 
        link.download = 'photo.png'; 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link); 
    };

    return (
        <div className="PhotoMode">
            <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
            <header className="App-header">
                {!photoTaken ? (
                    <>
                        {cameraActive && <video ref={videoRef} autoPlay playsInline />}
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        {videoStreamActive && showButtons && (
                            <div className="button-container">
                                <button className="start-button" onClick={startPhotoCountdown}>
                                    Start Countdown
                                </button>
                                <input
                                    type="range"
                                    min="3"
                                    max="10"
                                    value={timerValue}
                                    onChange={(e) => setTimerValue(e.target.value)}
                                />
                                <button className="end-button" onClick={handleEndSession}>
                                    End Session
                                </button>
                                <div className="footer-text">
                                    Timer: {timerValue} Sekunden
                                </div>
                            </div>
                        )}
                        {countdown > 0 && <div className="countdown">{countdown}</div>}
                    </>
                ) : (
                    <>
                        <img id="captured" src={imageSrc} alt="Captured" />
                        <div className="button-container">
                        {showButtons && (
                            <>
                                <button className="start-button" onClick={handleSavePicture}>Save Picture</button>
                                <button className="end-button" onClick={handleRetakePicture}>New Photo</button>
                            </>
                        )}
                        </div>
                    </>
                )}
            </header>
        </div>
    );
}

export default PhotoMode;
