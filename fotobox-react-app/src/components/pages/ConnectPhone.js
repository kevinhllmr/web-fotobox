import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPeer, createAnswer, setRemoteDescription, sendMessage, copyToClipboard } from '../controllers/WebRTC'; // Adjust the import path
import '../../App.css';
import './ConnectPhone.css'
import { FaCopy } from 'react-icons/fa';

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

    // nur als Beispiel, um Datenkanal zwischen Tablet und Smartphone aufzubauen
    // anstatt JSON-Text hin- und herzukopieren, Offer und Answer per WebNFC übertragen
   
    // let navigate = useNavigate();
    // wenn Datenkanal aufgebaut wurde, Nutzer auf
    // navigate(`/photomode/`);
    // weiterleiten

    useEffect(() => {

        function handleWindowSizeChange() {
            setWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, [width]);

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
        } 
    }, [isMobile]);

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
