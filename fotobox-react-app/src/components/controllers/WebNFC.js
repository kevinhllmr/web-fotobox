export const handleScan = async (setAnswer) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.addEventListener("reading", event => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          const data = decoder.decode(record.data);
          console.log("Data read from NFC:", data);
          setAnswer(data);
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
      console.log(message)
      await ndef.write(message);
      alert("Successfully wrote data to NFC tag!");
    } else {
      alert("Your device does not support NFC Writer functionality!");
    }
  } catch (error) {
    console.error("Failed to write NFC:", error);
  }
};
