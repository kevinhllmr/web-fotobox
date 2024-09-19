import SimplePeer from 'simple-peer';

class WebRTC {
    constructor() {
        this.peer = null;
        this.dataChannel = null;
        this.onDataCallback = null; // Store a callback to handle received data
    }

    createPeer(initiator, onSignal, onData, onConnect, onClose) {
        console.log('Creating peer instance:', initiator);
        this.peer = new SimplePeer({ initiator, trickle: false });

        this.peer.on('signal', data => {
            console.log('Peer signal data:', data);
            onSignal(data);
        });

        this.peer.on('data', data => {
            console.log('Data received from peer:', data.toString());
            onData(data);
        });

        this.peer.on('connect', () => {
            console.log('Peer connection established.');
            this.dataChannel = this.peer._channel;
            onConnect();
        });

        this.peer.on('close', () => {
            console.log('Peer connection closed.');
            this.dataChannel = null;
            onClose();
        });

        return this.peer;
    }

    createAnswer(offer, onAnswerReady, onData, onConnect, onClose) {
        console.log('Creating answer peer with offer:', offer);
        this.peer = new SimplePeer({ initiator: false, trickle: false });

        this.peer.on('signal', data => {
            console.log('Answer signal data:', data);
            onAnswerReady(JSON.stringify(data));
        });

        this.peer.on('data', data => {
            console.log('Data received from peer:', data.toString());
            onData(data);
        });

        this.peer.on('connect', () => {
            console.log('Answer peer connection established.');
            this.dataChannel = this.peer._channel;
            onConnect();
        });

        this.peer.on('close', () => {
            console.log('Answer peer connection closed.');
            this.dataChannel = null;
            onClose();
        });

        this.peer.signal(JSON.parse(offer));

        return this.peer;
    }

    setRemoteDescription(answer) {
        try {
            console.log('Setting remote description with answer:', answer);
            this.peer.signal(JSON.parse(answer));
        } catch (error) {
            console.error('Failed to set remote description:', error);
        }
    }

    sendMessage(message) {
        if (this.dataChannel && message.trim() !== '') {
            console.log('Sending message:', message);
            this.dataChannel.send(message);
        } else {
            console.log('No data channel or empty message.');
        }
    }

    onData(callback) {
        this.onDataCallback = callback;
        this.peer?.on('data', (data) => {
            if (this.onDataCallback) {
                this.onDataCallback(data.toString());
            }
        });
    }

    sendPhoto(photoData) {
        if (this.dataChannel && photoData) {
            console.log('Sending photo data:', photoData);
            this.dataChannel.send(photoData);
        } else if(!this.dataChannel) {
            console.log('No data channel');
        } else {
            console.log('No photo data.');
            console.log(photoData)
        }
    }

    // nur für Testzwecke
    copyToClipboard = (text) => {
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
}

export default new WebRTC();
