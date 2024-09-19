import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import WebRTC from '../controllers/WebRTC';
import '../../App.css';
import './ConnectPhone.css';
import { FaCopy, FaWifi } from 'react-icons/fa';
import { handleScan, handleWrite } from '../controllers/WebNFC';

const ConnectPhone = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const [offer, setOffer] = useState('');
    const [answer, setAnswer] = useState('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

    const navigate = useNavigate();
    const isMobile = width <= 768;

    // Handle window size changes
    useEffect(() => {
        const handleWindowSizeChange = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, []);

    // Initialize WebRTC and NFC
    useEffect(() => {
        // Check for NFC availability
        const initializeNFC = () => {
            if ('NDEFReader' in window) {
                try {
                    const nfc = new NDEFReader();
                    console.log('NFC is available');
                } catch (error) {
                    console.warn('NFC Initialization failed:', error);
                }
            } else {
                alert('NFC is unavailable');
            }
        };

        initializeNFC();

        if (!isMobile) {
            // Initialize WebRTC peer connection
            WebRTC.createPeer(
                true,
                (data) => setOffer(JSON.stringify(data)),
                (data) => setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]),
                () => {
                    setRemoteDescriptionSet(true);
                    navigate('/photomode');
                },
                () => alert("The other user has left the chat.")
            );
        }
    }, [isMobile, navigate]);

    // Generate answer based on the offer
    const handleGenerateAnswer = () => {
        if (offer) {
            WebRTC.createAnswer(
                offer,
                (data) => setAnswer(data),
                (data) => setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]),
                () => navigate('/remote'),
                () => alert("The other user has left the chat.")
            );
        } else {
            alert('No offer available. Please make sure the offer is generated.');
        }
    };

    // Set the remote description from the answer
    const handleSetRemoteDescription = () => {
        if (answer) {
            WebRTC.setRemoteDescription(answer);
            setRemoteDescriptionSet(true);
            alert('Remote description set. Data channel should be established.');
            navigate(isMobile ? '/remote' : '/photomode');
        } else {
            alert('No answer provided. Please make sure the answer is generated.');
        }
    };

    // Handle message sending
    const handleSendMessage = () => {
        if (input.trim()) {
            WebRTC.sendMessage(input);
            setMessages(prevMessages => [...prevMessages, { text: input, sender: 'You' }]);
            setInput('');
        } else {
            alert('Message cannot be empty.');
        }
    };

    // Handle sending message via Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // Write offer to NFC tag
    const handleWriteOfferToNFC = () => {
        if (offer.trim()) {
            handleWrite(offer)
                .then(() => alert('Successfully wrote offer to NFC tag!'))
                .catch(error => console.error('Failed to write offer to NFC:', error));
        } else {
            alert('Offer is empty. Please generate an offer first.');
        }
    };

    // Scan answer from NFC tag
    const handleScanAnswerFromNFC = async () => {
        await handleScan(setAnswer);
    };

    return (
        <div className={isMobile ? "mobile" : "desktop"}>
            <h1>{isMobile ? "Mobile App" : "Desktop App"}</h1>
            <div className="offer-answer">
                {/* Offer Section */}
                <div className="offer">
                    <label>Offer JSON:</label>
                    <textarea
                        value={offer}
                        onChange={e => setOffer(e.target.value)}
                        placeholder="Paste offer JSON here"
                        rows={4}
                    />
                    <button className="copy-icon" onClick={() => WebRTC.copyToClipboard(offer)}>
                        <FaCopy />
                    </button>
                    <button className="copy-icon" onClick={handleWriteOfferToNFC}>
                        <FaWifi />
                    </button>
                </div>

                {/* Answer Section */}
                <div className="answer">
                    <label>Answer JSON:</label>
                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Paste answer JSON here"
                        rows={4}
                    />
                    <button className="copy-icon" onClick={() => WebRTC.copyToClipboard(answer)}>
                        <FaCopy />
                    </button>
                    <button className="copy-icon" onClick={handleScanAnswerFromNFC}>
                        <FaWifi />
                    </button>
                </div>

                {/* Remote description for desktop only */}
                {!isMobile && (
                    <button onClick={handleSetRemoteDescription} disabled={remoteDescriptionSet}>
                        Set Remote Description
                    </button>
                )}
            </div>

            {/* Message Input Section */}
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

            {/* Chat Section */}
            <div className="chat">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'You' ? 'message you' : 'message remote'}>
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Action Buttons for Mobile */}
            {isMobile && (
                <div className="action-buttons">
                    <button onClick={handleGenerateAnswer}>Generate Answer</button>
                </div>
            )}
        </div>
    );
};

export default ConnectPhone;
