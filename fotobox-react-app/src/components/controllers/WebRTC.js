import SimplePeer from 'simple-peer';

export const createPeer = (initiator, onSignal, onData, onConnect, onClose) => {
    console.log('Creating peer instance:', initiator);
    const peer = new SimplePeer({ initiator, trickle: false });

    peer.on('signal', data => {
        console.log('Peer signal data:', data);
        onSignal(data);
    });

    peer.on('data', data => {
        console.log('Data received from peer:', data.toString());
        onData(data);
    });

    peer.on('connect', () => {
        console.log('Peer connection established.');
        onConnect();
    });

    peer.on('close', () => {
        console.log('Peer connection closed.');
        onClose();
    });

    return peer;
};

export const createAnswer = (offer, onAnswerReady, onData, onConnect, onClose) => {
    console.log('Creating answer peer with offer:', offer);
    const peer = new SimplePeer({ initiator: false, trickle: false });

    peer.on('signal', data => {
        console.log('Answer signal data:', data);
        onAnswerReady(JSON.stringify(data));
    });

    peer.on('data', data => {
        console.log('Data received from peer:', data.toString());
        onData(data);
    });

    peer.on('connect', () => {
        console.log('Answer peer connection established.');
        onConnect();
    });

    peer.on('close', () => {
        console.log('Answer peer connection closed.');
        onClose();
    });

    peer.signal(JSON.parse(offer));

    return peer;
};

export const setRemoteDescription = (peer, answer) => {
    try {
        console.log('Setting remote description with answer:', answer);
        peer.signal(JSON.parse(answer));
    } catch (error) {
        console.error("Failed to set remote description:", error);
        alert("Failed to set remote description. Please ensure the offer is provided correctly.");
    }
};

export const sendMessage = (dataChannel, message) => {
    if (dataChannel && message.trim() !== '') {
        console.log('Sending message:', message);
        dataChannel.send(message);
    } else {
        console.log('No data channel or empty message.');
    }
};

// nur für Testzwecke
export const copyToClipboard = (text) => {
    console.log('Copying text to clipboard:', text);
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
