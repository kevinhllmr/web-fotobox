export const handleScan = async (setAnswer) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      await ndef.scan();
      ndef.onreading = (event) => {
        const decoder = new TextDecoder();
        let message = '';
        for (const record of event.message.records) {
          message += decoder.decode(record.data);
        }
        setAnswer(message); 
      };
    } else {
      alert("Your device does not support NFC functionality");
    }
  } catch (error) {
    console.error("Failed to read NFC：", error);
  }
};

export const handleWrite = async (message) => {
  try {
    if ('NDEFWriter' in window) {
      const ndef = new NDEFWriter(); 
      await ndef.write(message);
      alert("Successfully wrote data to NFC tag!");
    } else {
      alert("Your device does not support NFC functionality!");
    }
  } catch (error) {
    console.error("Failed to write NFC:", error);
  }
};
