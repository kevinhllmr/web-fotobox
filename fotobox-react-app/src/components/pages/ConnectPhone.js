import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPeer, createAnswer, setRemoteDescription, sendMessage, copyToClipboard } from '../controllers/WebRTC'; // Adjust the import path
import '../../App.css';
import './ConnectPhone.css';
import { FaCopy, FaWifi } from 'react-icons/fa';
import { handleScan, handleWrite } from '../controllers/WebNFC';
import pako from "pako";


const ConnectPhone = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [offer, setOffer] = useState('');
    const [answer, setAnswer] = useState('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [peer, setPeer] = useState(null);
    const [dataChannel, setDataChannel] = useState(null);
    const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

    const isMobile = width <= 768;

    useEffect(() => {
        function handleWindowSizeChange() {
            setWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, [width]);

    // Tablet: Write the offer JSON to the NFC tag
    const handleWriteOfferToNFC = () => {
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
    


    // Mobile: Scan NFC and copy the content into the offer JSON text box
    const handleScanOfferFromNFC = async () => {
        if ('NDEFReader' in window){
            await handleScan(setOffer);
        }
        else{
            alert("NFC read failed. Please try again or use a device with NFC support.");
            return;
        }
        
    };

    // Tablet: Scan NFC and copy the content to the answer JSON text box
    const handleScanAnswerFromNFC = async () => {
        if (!isMobile) {
            if ('NDEFReader' in window)
            {
                    try {
                    await handleScan(setAnswer);
                    alert('Successfully read Answer from NFC tag!');
                    if (answer) {
                        //handleSetRemoteDescription();
                    }
                } catch (error) {
                    console.error('Failed to read Answer from NFC:', error);
                }   
            }else{
                alert("NFC read failed. Please try again or use a device with NFC support.");
            }

        }
    };

    // Mobile: Write the answer JSON to the NFC tag
    const handleWriteAnswerToNFC = () => {
        if (offer.trim() !== '') {
            if ('NDEFReader' in window) {
                handleWrite(answer)
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


    useEffect(() => {
        if (!isMobile) {
            const newPeer = createPeer(
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
        } else {
            console.log('Mobile device detected.')
        }
    }, [isMobile]);

    useEffect(() => {
        if (isMobile && offer) {
            handleGenerateAnswer();
        }
    }, [isMobile, offer]);
    const handleGenerateAnswer = () => {
        if (offer) {
            const newPeer = createAnswer(
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
            // console.log('No offer available to generate an answer.');
        }
    };

    const handleSetRemoteDescription = () => {
        if (peer && answer) {
            setRemoteDescription(peer, answer);
            setRemoteDescriptionSet(true);
            alert('Data channel should be established.');
        } else {
            // console.log('No peer or answer available to set remote description.');
        }
    };

    const handleSendMessage = () => {
        if (dataChannel && input.trim() !== '') {
            sendMessage(dataChannel, input);
            setMessages(prevMessages => [...prevMessages, { text: input, sender: 'You' }]);
            setInput('');
        } else {
            // console.log('No data channel or empty message.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
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
            <h1>{isMobile ? "Mobile App" : "Desktop App"}</h1>
            <div className="offer-answer">
                <div className="offer">
                    <label>Offer JSON:</label>
                    <textarea
                        value={offer}
                        onChange={e => setOffer(e.target.value)}
                        placeholder="Paste offer JSON here"
                    />
                    <button className="copy-icon" onClick={() => copyToClipboard(offer)}>
                        <FaCopy />
                    </button>
                    <button
                    className="nfc-button"
                    onClick={isMobile ? handleScanOfferFromNFC : handleWriteOfferToNFC}
                >
                    {isMobile ? 'Scanning NFCTag to Offer Json' : 'Write Offer to NFC Tag'}
                    <FaWifi />
                </button>
                </div>
                <div className="answer">
                    <label>Answer JSON:</label>
                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Paste answer JSON here"
                        rows={4}
                        cols={50}
                    />
                    <button className="copy-icon" onClick={() => copyToClipboard(answer)}>
                        <FaCopy />
                    </button>
                    <button
                    className="nfc-button"
                    onClick={isMobile ? handleWriteAnswerToNFC : handleScanAnswerFromNFC}
                >
                    {isMobile ? 'Write Answer to NFC Tag' : 'Scanning NFCTag to Answer Json'}
                    <FaWifi />
                </button>
                </div>
                {!isMobile && (
                    <button onClick={handleSetRemoteDescription} disabled={remoteDescriptionSet}>
                        Set Remote Description
                    </button>
                )}
            </div>
            <div className="message-input">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message"
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div className="chat">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'You' ? 'message you' : 'message remote'}>
                        {msg.text}
                    </div>
                ))}
            </div>
            {isMobile && (
                <div className="action-buttons">
                    <button onClick={handleGenerateAnswer}>Generate Answer</button>
                </div>
            )}
        </div>
    );
};

export default ConnectPhone;