import SimplePeer from 'simple-peer';

class WebRTC {
    constructor() {
        this.peer = null;
        this.dataChannel = null;
        this.onDataCallback = null;
        this.buffer = '';
        this.binarySender = null;
        this.binaryReceiver = null;
    }

    createPeer(initiator, onSignal, onData, onConnect, onClose) {
        console.log('Creating peer instance:', initiator);
        this.peer = new SimplePeer({ initiator, trickle: false });

        this.peer.on('signal', data => {
            console.log('Peer signal data:', data);
            onSignal(data);
        });

        this.peer.on('data', data => {
            console.log('Data received from peer:', data);
            this.handleIncomingData(data);
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
            console.log('Data received from peer:', data);
            this.handleIncomingData(data);
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
        } else if (!this.dataChannel) {
            console.log('No data channel available.');
        } else if (message.trim() === '') {
            console.log('Attempted to send empty message.');
        }
    }

    sendPhoto(photoData) {
        if (this.dataChannel) {
            if (this.dataChannel.readyState === 'open') {
                try {
                    console.log('Sending photo data...');
                    this.sendInChunks(photoData);
                } catch (error) {
                    console.error('Failed to send photo data:', error);
                }
            } else {
                console.error('Data channel is not open. Cannot send photo.');
            }
        } else {
            console.error('Data channel is not defined.');
        }
    }

    sendInChunks(data) {
        const chunkSize = 16384; // Size of each chunk
        let offset = 0;

        while (offset < data.length) {
            const end = Math.min(offset + chunkSize, data.length);
            const chunk = data.slice(offset, end);
            this.dataChannel.send(chunk);
            offset = end;
        }
    }

    handleIncomingData(data) {
        console.log('Raw data received:', data);
    
        if (typeof data === 'string') {
            console.log('Received string data:', data);
            this.buffer += data;
    
            let endIndex;
            while ((endIndex = this.buffer.indexOf('}')) !== -1) {
                const jsonString = this.buffer.substring(0, endIndex + 1);
                try {
                    const parsedData = JSON.parse(jsonString);
                    if (this.onDataCallback) {
                        this.onDataCallback(parsedData);
                    }
                } catch (error) {
                    console.error('Failed to parse JSON:', error);
                    console.error('Invalid JSON string:', jsonString);
                }
                this.buffer = this.buffer.substring(endIndex + 1);
            }
        } else if (data instanceof Uint8Array) {
            console.log('Received binary data of length:', data.length);
            console.log('Received binary data:', Array.from(data)); // Log as a regular array
    
            // Call the callback with the binary data
            this.onDataCallback && this.onDataCallback(data);
        } else {
            console.error('Received unsupported data type:', data);
        }
    }
    
    
    onData(callback) {
        this.onDataCallback = callback;
    }

    // For test purposes
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