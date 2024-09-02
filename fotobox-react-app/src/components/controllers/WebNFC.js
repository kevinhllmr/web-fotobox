export const handleScan = async (setAnswer) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", event => {
        const decoder = new TextDecoder();
        let isDataComplete = true; // flag to check if data is complete
        let data = "";

        for (const record of event.message.records) {
          const recordData = decoder.decode(record.data);
          if (!recordData) {
            isDataComplete = false;
            break;
          }
          data += recordData;
        }

        if (isDataComplete && data) {
          console.log("Data read from NFC:", data);
          setAnswer(data);
        } else {
          console.error("Incomplete data or failed to read from NFC.");
          alert("Failed to read the full data from NFC tag.");
        }
      });

    } else {
      alert("Your device does not support NFC Reader functionality");
    }
  } catch (error) {
    console.error("Failed to read NFC:", error);
  }
};


export const handleWrite = async (message) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();

      // Check if the message is valid and complete before writing
      let isDataComplete = message && typeof message === 'string' && message.trim().length > 0;

      if (isDataComplete) {
        await ndef.write(message);
        console.log("Data written to NFC:", message);
        alert("Successfully wrote data to NFC tag!");
      } else {
        console.error("Invalid or incomplete data. Writing aborted.");
        alert("Cannot write: Invalid or incomplete data.");
      }
    } else {
      alert("Your device does not support NFC Writer functionality!");
    }
  } catch (error) {
    console.error("Failed to write NFC:", error);
  }
};
