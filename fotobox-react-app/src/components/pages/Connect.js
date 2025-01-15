import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import WebRTC from '../controllers/WebRTC';
import './Connect.css';
import { handleScan, handleWrite } from '../controllers/WebNFC';
import { lang_de } from '../langs/lang_de.js';
import { lang_en } from '../langs/lang_en.js';
import pako from "pako";

const Connect = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [offer, setOffer] = useState('');
    const [answer, setAnswer] = useState('');
    const [step, setStep] = useState(1);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [peer, setPeer] = useState(null);
    const [showContent, setShowContent] = useState(true);
    const [setRemoteDescriptionSet] = useState(false);
    const isMobile = width <= 768;
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("lang") === "de") {
            lang_de();
        } else {
            lang_en();
        }

        if (!isMobile) {
            const newPeer = WebRTC.createPeer(
                true,
                (data) => {
                    setOffer(JSON.stringify(data));
                },
                (data) => {
                    setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]);
                },
                () => {
                    setDataChannel(newPeer);
                    setRemoteDescriptionSet(true);
                },
                () => {
                    alert("The other user has left the chat.");
                }
            );
            setPeer(newPeer);

        } else if (isMobile && offer) {
            handleGenerateAnswer();
        }

        // handleWriteOffer();
        const handleWindowSizeChange = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);

    }, [isMobile]);

    const handleClick = () => {
        setShowContent(false);

        if (isButtonDisabled) return;
        setIsButtonDisabled(true);
        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 3000)
    };

    const handleBackClick = () => {
        setShowContent(true);
    };

    const handleBackClick2 = () => {
        navigate('/home');
    };

    const handleNextStep = () => {
        if (isButtonDisabled) return;

        setIsButtonDisabled(true);

        if (step == 1) {
            console.log("Handle Write Offer");
            handleWriteOffer();
            setStep(step + 1);
            setLoadingPercentage(25);
        }

        if (step == 2) {
            console.log("Mobile: Handle Read Offer");
            setStep(step + 1);
            setLoadingPercentage(50);
        }

        if (step == 3) {
            console.log("Mobile: Handle Write Answer");
            setStep(step + 1);
            setLoadingPercentage(75);
        }

        if (step === 4) {
            console.log("Handle Read Answer");
            handleReadAnswerFromNFC();
            setTimeout(() => {
                handleSetRemoteDescription();
            }, 1000);
        }

        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 5000);
    };

    const handleWriteOffer = async () => {
        if (offer.trim() !== '') {
            if ('NDEFReader' in window) {
                handleWrite(offer)
                    .then(() => {
                        alert('Successfully wrote Offer JSON to the NFC tag!');
                    })
                    .catch(error => {
                        console.error('Failed to write data to NFC tag:', error);
                        alert(error);
                        alert('Failed to write data to NFC tag. Please try again.');
                    });
            } else {
                alert("Your device does not support NFC functionality! Or your browser does not support the webnfc function");
            }
        } else {
            alert('Offer JSON is empty, please input valid content before writing.');
        }
    };

    const handleReadOffer = async () => {
        if ('NDEFReader' in window) {
            await handleScan(setOffer);
        }
        else {
            alert("NFC read failed. Please try again or use a device with NFC support.");
            return;
        }
    };

    const handleWriteAnswerToNFC = async () => {
        if (offer.trim() !== '') {
            if ('NDEFReader' in window) {
                handleWrite(answer)
                    .then(() => {
                        alert('Successfully wrote Answer JSON to the NFC tag!');
                    })
                    .catch(error => {
                        console.error('Failed to write data to NFC tag:', error);
                        alert(error);
                        alert('Failed to write data to NFC tag. Please try again.');
                    });
            } else {
                alert("Your device does not support NFC functionality! Or your browser does not support the webnfc function");
            }
        } else {
            alert('Offer JSON is empty, please input valid content before writing.');
        }
    };

    const handleReadAnswerFromNFC = async () => {
        if ('NDEFReader' in window) {
            try {
                await handleScan(setAnswer);
                alert('Successfully read Answer from NFC tag!');
            } catch (error) {
                console.error('Failed to read Answer from NFC:', error);
            }
        } else {
            alert("NFC read failed. Please try again or use a device with NFC support.");
        }
    };

    const handleSetRemoteDescription = () => {
        if (answer) {
            WebRTC.setRemoteDescription(answer);
            navigate(isMobile ? '/remote' : '/photomode');
        }
    };

    const handleGenerateAnswer = () => {
        if (offer) {
            const newPeer = WebRTC.createAnswer(
                offer,
                (data) => {
                    setAnswer(data);
                },
                (data) => {
                    setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]);
                },
                () => {
                    setDataChannel(newPeer);
                },
                () => {
                    alert("The other user has left the chat.");
                }
            );
            setPeer(newPeer);
        } else {
        }
    };

    const testCompression = () => {
        const jsonString = JSON.stringify({ key: "value" });
        const compressed = pako.gzip(jsonString);
        const decompressed = pako.ungzip(compressed, { to: "string" });
    
        console.log("Original:", jsonString);
        console.log("Compressed:", compressed);
        console.log("Decompressed:", decompressed);
        };
    
        testCompression();

    return (
        <div className={isMobile ? "mobile" : "desktop"}>
            <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />

            {/* {isMobile && showContent && (
                <div className="mobile-text">
                    <h2>Hold your phone<br />against the tablet</h2>
                </div>
            )} */}

            {!isMobile && showContent && (
                <div className="qr-container">
                    <h2 id='qrcode' className="qr-text">
                        1) Scan this QR Code<br />with your phone
                    </h2>
                    <img src={process.env.PUBLIC_URL + '/images/qr-code.svg'} alt="QR Code" id="qr-code" />
                </div>
            )}

            {!isMobile && showContent && (
                <div className="button-container">
                    <button id='done' className="done-button" onClick={handleClick}>
                        Done
                    </button>
                </div>
            )}

            {isMobile && (
                <div className="button-container">
                    <button onClick={handleReadOffer}>Read Offer</button>
                    <button onClick={handleWriteAnswerToNFC}>Write Answer</button>
                </div>
            )}

            {/* {isMobile && showContent && (
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
            )} */}

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
                    <h2 id="step1" style={{ display: step === 1 ? 'block' : 'none' }}>
                        2) Hold the NFC tag here and press on "Next" to write the offer to it
                    </h2>
                    <h2 id="step2" style={{ display: step === 2 ? 'block' : 'none' }}>
                        3) Now hold it against your phone and press on "Read Offer"
                    </h2>
                    <h2 id="step3" style={{ display: step === 3 ? 'block' : 'none' }}>
                        4) Now press "Write Answer" on your phone while holding the NFC tag against it
                    </h2>
                    <h2 id="step4" style={{ display: step === 4 ? 'block' : 'none' }}>
                        5) Finally, hold the tag here and press "Finish" to read the answer
                    </h2>

                    {(step === 1 || step === 4) && (
                        <svg viewBox="-10 -10 120 120" width="450px">
                            <path d="M25,2 L5,2 Q1,2 1,6 L1,25" fill="none" stroke="white" strokeWidth="5" />
                            <path d="M1,75 L1,93 Q1,97 5,97 L25,97" fill="none" stroke="white" strokeWidth="5" />
                            <path d="M75,97 L95,97 Q99,97 99,93 L99,75" fill="none" stroke="white" strokeWidth="5" />
                            <path d="M97,25 L97,5 Q97,1 93,1 L75,1" fill="none" stroke="white" strokeWidth="5" />
                        </svg>
                    )}

                    <div className="button-container">
                        <button
                            id={`next`}
                            className="done-button"
                            onClick={handleNextStep}
                            disabled={isButtonDisabled}
                            style={{ display: step !== 4 ? 'block' : 'none' }}
                        >
                            Next
                        </button>
                        <button
                            id={`Done`}
                            className="done-button"
                            onClick={handleNextStep}
                            disabled={isButtonDisabled}
                            style={{ display: step === 4 ? 'block' : 'none' }}
                        >
                            Done
                        </button>
                    </div>
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

            <textarea
                value={offer}
                onChange={e => setOffer(e.target.value)}
                style={{
                    width: '375px',
                    height: '600px',
                    pointerEvents: 'none',
                    position: 'fixed',
                    left: '10px',
                    bottom: '10px',
                    zIndex: 1000,
                    opacity: 0,
                }}
            />

            <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                style={{
                    width: '375px',
                    height: '600px',
                    pointerEvents: 'none',
                    position: 'fixed',
                    left: '10px',
                    bottom: '10px',
                    zIndex: 1000,
                    opacity: 0,
                }}
            />
        </div>
    );
};

export default Connect;
