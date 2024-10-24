import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './Connect.css';

const Connect = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [offer, setOffer] = useState('');
    const [answer, setAnswer] = useState('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);
    const isMobile = width <= 768;
    const navigate = useNavigate();

    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [showContent, setShowContent] = useState(true);

    useEffect(() => {
        const handleWindowSizeChange = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, []);

    const handleClick = () => {
        setShowContent(false);
    };

    const handleBackClick = () => {
        setShowContent(true);
    };

    const handleBackClick2 = () => {
        navigate('/home');
    };

    // Nur als Beispiel. Entfernen, wenn NFC implementiert ist.
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingPercentage(prev => {
                if (prev < 100) return prev + 20;
                clearInterval(interval);
                return prev;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (loadingPercentage === 100) {
            const timer = setTimeout(() => {
                navigate(isMobile ? '/remote' : '/photomode');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loadingPercentage, navigate]);
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleWriteOffer = () => {
        // write offer to phone

        setLoadingPercentage(25);
    };

    const handleReadOffer = () => {
        // read offer from tablet

        setLoadingPercentage(50);
    };

    const handleWriteAnswerFromNFC = async () => {
        // write answer to tablet

        setLoadingPercentage(75);
    };

    const handleReadAnswerFromNFC = async () => {
        // read answer from phone

        setLoadingPercentage(100);
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleSetRemoteDescription();
    };

    // Remote Description setzen und nach 1s weiterleiten
    const handleSetRemoteDescription = () => {
        if (answer) {
            WebRTC.setRemoteDescription(answer);
            setRemoteDescriptionSet(true);
            navigate(isMobile ? '/remote' : '/photomode');
        };
    }

    return (
        <div className={isMobile ? "mobile" : "desktop"}>
            <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />

            {isMobile && showContent && (
                <div className="mobile-text">
                    <h2>Hold your phone<br />against the tablet</h2>
                </div>
            )}

            {!isMobile && showContent && (
                <div className="qr-container">
                    <h2 className="qr-text">
                        1) Scan this QR Code<br />with your phone
                    </h2>
                    <img src={process.env.PUBLIC_URL + '/images/qr-code.svg'} alt="QR Code" id="qr-code" />
                </div>
            )}

            {!isMobile && showContent && (
                <div className="button-container">
                    <button className="done-button" onClick={handleClick}>
                        Done
                    </button>
                </div>
            )}

            {isMobile && showContent && (
                <div className="circular-loader">
                    <svg width={width * 0.6} height={width * 0.6}>
                        <circle
                            className="circular-loader-bg"
                            cx={(width * 0.6) / 2}
                            cy={(width * 0.6) / 2}
                            r={(width * 0.6) / 2 - 10}
                            style={{ stroke: 'transparent' }}
                        />
                        <circle
                            className="circular-loader-fg"
                            cx={(width * 0.6) / 2}
                            cy={(width * 0.6) / 2}
                            r={(width * 0.6) / 2 - 10}
                            transform={`rotate(-90 ${(width * 0.6) / 2} ${(width * 0.6) / 2})`}
                            style={{
                                strokeDasharray: Math.PI * ((width * 0.6) - 20),
                                strokeDashoffset: Math.PI * ((width * 0.6) - 20) - (loadingPercentage / 100) * (Math.PI * ((width * 0.6) - 20)),
                                transition: 'stroke-dashoffset 0.5s ease',
                                stroke: loadingPercentage === 0 ? 'transparent' : 'white',
                                strokeWidth: 15,
                                strokeLinecap: "round",
                                strokeLinejoin: "round"
                            }}
                        />
                    </svg>
                    <div className="percentage">
                        {loadingPercentage}%
                    </div>
                </div>
            )}

            {showContent && !isMobile && (
                <svg
                    width="60px"
                    height="80px"
                    viewBox="-20 -20 120 120"
                    style={{ position: 'absolute', top: '20px', left: '20px', cursor: 'pointer' }}
                    onClick={handleBackClick2}
                >
                    <path
                        d="M 60 0 L 0 50 L 60 100"
                        fill="none"
                        stroke="white"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}

            {!showContent && (
                <div className="nfc-container">
                    <h2 id="holdphone">2) Hold your<br />phone here</h2>
                    <svg viewBox="-10 -10 120 120" width="450px">
                        <path d="M25,2 L5,2 Q1,2 1,6 L1,25" fill="none" stroke="white" stroke-width="5" />
                        <path d="M1,75 L1,93 Q1,97 5,97 L25,97" fill="none" stroke="white" stroke-width="5" />
                        <path d="M75,97 L95,97 Q99,97 99,93 L99,75" fill="none" stroke="white" stroke-width="5" />
                        <path d="M97,25 L97,5 Q97,1 93,1 L75,1" fill="none" stroke="white" stroke-width="5" />
                    </svg>
                </div>
            )}

            {!showContent && (
                <svg
                    width="60px"
                    height="80px"
                    viewBox="-20 -20 120 120"
                    style={{ position: 'absolute', top: '20px', left: '20px', cursor: 'pointer' }}
                    onClick={handleBackClick}
                >
                    <path
                        d="M 60 0 L 0 50 L 60 100"
                        fill="none"
                        stroke="white"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );

};

export default Connect;
