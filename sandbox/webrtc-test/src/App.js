import React, { useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { FaCopy } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [offer, setOffer] = useState('');
  const [answer, setAnswer] = useState('');
  const [peer, setPeer] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [input, setInput] = useState('');
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

  useEffect(() => {
    const newPeer = new SimplePeer({ initiator: true, trickle: false });

    newPeer.on('signal', data => {
      setOffer(JSON.stringify(data));
    });

    newPeer.on('data', data => {
      setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]);
    });

    newPeer.on('connect', () => {
      setDataChannel(newPeer);
      setRemoteDescriptionSet(true);
    });

    newPeer.on('close', () => {
      alert("The other user has left the chat.");
    });

    setPeer(newPeer);
  }, []);

  const createAnswer = () => {
    const newPeer = new SimplePeer({ initiator: false, trickle: false });

    newPeer.on('signal', data => {
      setAnswer(JSON.stringify(data));
    });

    newPeer.on('data', data => {
      setMessages(prevMessages => [...prevMessages, { text: data.toString(), sender: 'Remote' }]);
    });

    newPeer.on('connect', () => {
      setDataChannel(newPeer);
      setRemoteDescriptionSet(true);
    });

    newPeer.on('close', () => {
      alert("The other user has left the chat.");
    });

    newPeer.signal(JSON.parse(offer));
    setPeer(newPeer);
  };

  const setRemoteDescription = () => {
    try {
      peer.signal(JSON.parse(answer));
    } catch (error) {
      alert("Failed to set remote description. Please ensure the offer is provided correctly.");
    }
  };

  const sendMessage = () => {
    if (dataChannel && input.trim() !== '') {
      dataChannel.send(input);
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'You' }]);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="App">
      <h1>WebRTC Chat</h1>
      <div className="offer-answer">
        <div className="offer">
          <label>Offer:</label>
          <textarea value={offer} onChange={e => setOffer(e.target.value)} placeholder="Offer" />
          <button className="copy-icon" onClick={() => copyToClipboard(offer)}>
            <FaCopy />
          </button>
        </div>
        <div className="answer">
          <label>Answer:</label>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Answer" />
          <button className="copy-icon" onClick={() => copyToClipboard(answer)}>
            <FaCopy />
          </button>
        </div>
      </div>
      <div className="message-input">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" onKeyPress={handleKeyPress} />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="chat">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'You' ? 'message you' : 'message remote'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="action-buttons">
        <button onClick={createAnswer}>Create Answer</button>
        <button onClick={setRemoteDescription} disabled={remoteDescriptionSet}>Set Remote Description</button>
      </div>
    </div>
  );
};

export default App;
