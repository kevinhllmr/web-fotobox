import React, { useState, useEffect } from 'react';

const NFCComponent = () => {
  const [logs, setLogs] = useState([]);
  const [isNFCEnabled, setIsNFCEnabled] = useState(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsNFCEnabled(true);
      addLog('NDEFReader is supported in this browser.');
    } else {
      addLog('NDEFReader is not supported in this browser.');
    }
  }, []);

  const addLog = (log) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  const handleScan = async () => {
    addLog('User clicked scan button');

    if (!isNFCEnabled) {
      addLog('Web NFC is not supported on this device or browser.');
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      addLog('> Scan started');

      ndef.addEventListener('readingerror', () => {
        addLog('Argh! Cannot read data from the NFC tag. Try another one?');
      });

      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        addLog(`> Serial Number: ${serialNumber}`);
        addLog(`> Records: (${message.records.length})`);
        const decoder = new TextDecoder();
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const text = decoder.decode(record.data);
            addLog(`> Record text: ${text}`);
          }
        }
      });
    } catch (error) {
      addLog('Argh! ' + error);
    }
  };

  const handleWrite = async () => {
    addLog('User clicked write button');

    if (!isNFCEnabled) {
      addLog('Web NFC is not supported on this device or browser.');
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.write('Hello world!');
      addLog('> Message written');
    } catch (error) {
      addLog('Argh! ' + error);
    }
  };

  const handleMakeReadOnly = async () => {
    addLog('User clicked make read-only button');

    if (!isNFCEnabled) {
      addLog('Web NFC is not supported on this device or browser.');
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.makeReadOnly();
      addLog('> NFC tag has been made permanently read-only');
    } catch (error) {
      addLog('Argh! ' + error);
    }
  };

  return (
    <div>
      <h1>Web NFC Demo</h1>
      <button onClick={handleScan}>Scan</button>
      <button onClick={handleWrite}>Write</button>
      <button onClick={handleMakeReadOnly}>Make Read-Only</button>
      <div>
        <h2>Logs</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NFCComponent;
