let hasScanned = false; // Flag to track if the tag has been scanned

export const handleScan = async (setAnswer) => {
  try {
    if ('NDEFReader' in window) {

      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", event => {
        if (hasScanned) {
          console.log("Tag has already been scanned. Ignoring subsequent scan.");
          return; // Ignore if tag has already been scanned
        }
        const decoder = new TextDecoder();
        let data = "";
        let serialNumber = event.serialNumber || "Unknown Serial Number";

        console.log(`NFC Tag Serial Number: ${serialNumber}`);

        for (const record of event.message.records) {
          console.log("Record Type:", record.recordType);
          console.log("MIME Type:", record.mediaType);
          console.log("Record ID:", record.id);
          alert( record.recordType);
          alert(record.mediaType);
          alert(record.id);
          alert(record.serialNumber);
          let recordData = decoder.decode(record.data);
          console.log("Record Data:", recordData);

          data += recordData;
        }

        if (data && data.length > 0) {
          const [messageData, checksumData] = data.split("|checksum:");

          if (messageData && checksumData && checksumData == messageData.length) {
            console.log("Data read from NFC is complete and valid:", messageData);
            setAnswer(messageData); 
            hasScanned = true;
          } else {
            console.error("Checksum validation failed. Data may be corrupted.");
            alert("Data validation failed. Please try scanning the NFC tag again.");
          }
        } else {
          console.error("Incomplete data read from NFC tag.");
          alert("Incomplete data read. Please try scanning the NFC tag again.");
        }
      });

    } else {
      alert("NFC is not supported on this device. Maybe your browser doesn't support Webnfc");
      console.error("NFC is not supported on this device.");
    }
  } catch (error) {
    console.error("Failed to read NFC:", error);
    alert("NFC read failed. Please try again or use a device with NFC support.");
  }
};


export const handleWrite = async (message) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();

      const checksum = message.length; 
      const messageWithChecksum = `${message}|checksum:${checksum}`;

      let isDataComplete = messageWithChecksum && typeof messageWithChecksum === 'string' && messageWithChecksum.trim().length > 0;

      if (isDataComplete) {

        await ndef.write(messageWithChecksum);
        console.log("Data written to NFC with checksum:", messageWithChecksum);

        await new Promise(resolve => setTimeout(resolve, 500)); 
        await ndef.scan();

        ndef.addEventListener("reading", event => {
          const decoder = new TextDecoder();
          let data = "";

          
          for (const record of event.message.records) {
            let recordData = decoder.decode(record.data);
            data += recordData;
          }

          const [messageData, checksumData] = data.split("|checksum:");

          if (messageData && checksumData && checksumData == messageData.length) {
            if (messageWithChecksum === data) {
              console.log("Data has been correctly written and verified:", messageData);
              alert("Data correctly written and verified on NFC tag!");
            } else {
              console.error("Data mismatch! Written data and read data do not match.");
              alert("Data mismatch! Please try writing again.");
            }
          } else {
            console.error("Checksum validation failed. Data may be corrupted.");
            alert("Data validation failed. Please try writing again.");
          }
        });
      } else {
        console.error("Invalid or incomplete data. Writing aborted.");
        alert("Cannot write: Invalid or incomplete data.");
      }
    } else {
      alert("Your device does not support NFC Writer functionality!");
    }
  } catch (error) {
    console.error("Failed to write NFC:", error);
    alert("Failed to write data to NFC tag. Please try again.");
  }
};


export const handlesurfwithNfc = ()=>{
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      ndef.scan();

      ndef.addEventListener("reading", event => {
        if (hasScanned) {
          console.log("Tag has already been scanned. Ignoring subsequent scan.");
          return; // Ignore if tag has already been scanned
        }
        const decoder = new TextDecoder();
        let data = "";
        let serialNumber = event.serialNumber || "Unknown Serial Number";

        console.log(`NFC Tag Serial Number: ${serialNumber}`);

        for (const record of event.message.records) {
          let recordData = decoder.decode(record.data);
          data += recordData;
        }

        if (data && data.length > 0) {
          const [messageData, checksumData] = data.split("|checksum:");

          if (messageData && checksumData && checksumData == messageData.length) {
            console.log("Data read from NFC is complete and valid:", messageData);
            hasScanned = true;

            // Assuming the NFC tag contains a valid URL
            if (isValidURL(messageData)) {
              window.location.href = messageData; // Redirects to the URL in the NFC tag
            } else {
              console.error("Invalid URL scanned from NFC tag.");
              alert("The scanned NFC tag does not contain a valid URL.");
            }

          } else {
            console.error("Checksum validation failed. Data may be corrupted.");
            alert("Data validation failed. Please try scanning the NFC tag again.");
          }
        } else {
          console.error("Incomplete data read from NFC tag.");
          alert("Incomplete data read. Please try scanning the NFC tag again.");
        }
      });
    } else {
      alert("NFC is not supported on this device. Maybe your browser doesn't support Webnfc");
      console.error("NFC is not supported on this device.");
    }
  } catch (error) {
    console.error("Failed to read NFC:", error);
    alert("NFC read failed. Please try again or use a device with NFC support.");
  }
};

// Helper function to check if a string is a valid URL
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

export const handleNfcLogin = async (setIsAuthenticated, navigate) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", event => {
        const decoder = new TextDecoder();
        let data = "";

        for (const record of event.message.records) {
          let recordData = decoder.decode(record.data);
          data += recordData;
        }

        if (data) {
          const [messageData] = data.split("|checksum:"); // Assume that messageData contains login information
          // Send the read NFC data to the server to verify identity
          handleLogin(messageData, setIsAuthenticated, navigate);
        } else {
          alert("Unable to read valid NFC data, please try again!");
        }
      });
    } else {
      alert("This device does not support NFC, or the browser does not support WebNFC");
    }
  } catch (error) {
    console.error("Failed to read NFC:", error);
    alert("NFC reading failed, please try again or use an NFC-enabled device.");
  }
};

const handleLogin = async (nfcData, setIsAuthenticated, navigate) => {
  // Login verification using NFC data
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nfcData })
  });

  const result = await response.json();
  if (result.success) {
    setIsAuthenticated(true); // successfully log in
    navigate('/dashboard'); // Navigate to the User Dashboard
  } else {
    alert('Fail to log  in: ' + result.message);
  }
};