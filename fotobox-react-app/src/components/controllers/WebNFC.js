import pako from "pako";

export const handleScan = async (setJsonData) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();

      console.log("Starting NFC tag scan...");
      await ndef.scan();

      // webnfc write function
      ndef.onreading = (event) => {
        const { message } = event;

        console.log("NFC tag detected. Processing records...");
        for (const record of message.records) {
          if (record.recordType === "mime" && record.mediaType === "application/json") {
            const decoder = new TextDecoder();
            const compressedData = decoder.decode(record.data);
             // 解压缩数据
             const jsonString = decompressJson(compressedData);
             const jsonData = JSON.parse(jsonString);

            // 调用回调函数设置 JSON 数据
            setJsonData(jsonData);

            alert("Successfully read JSON data from NFC tag!");
          } else {
            console.warn("Unsupported record type or media type:", record.recordType, record.mediaType);
          }
        }
      };
    } else {
      alert("Your device or browser does not support WebNFC.");
    }
  } catch (error) {
    alert("Failed to scan NFC tag. Please try again.");
  }
};



export const handleWrite = async (jsonData) => {
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();

    // 将 JSON 数据序列化为字符串
      const jsonString = JSON.stringify(jsonData);
      const originalLength = jsonString.length;

      // 使用 TextEncoder 将字符串转换为 ArrayBuffer
      const encoder = new TextEncoder();
      // 压缩 JSON 数据
      const compressedData = compressJson(jsonString);
      const compressedLength = compressedData.length;

      alert(`Original JSON size: ${originalLength} characters\nCompressed size: ${compressedLength} characters`);

          // 转换压缩数据为 ArrayBuffer
      const arrayBufferData = new TextEncoder().encode(compressedData);
      // 写入 JSON 数据到 NFC 标签
      await ndef.write({
        records: [
          {
            recordType: "mime", // MIME 类型记录
            mediaType: "application/json", // JSON 的 MIME 类型
            data: arrayBufferData, // 压缩数据
          },
        ],
      });

      console.log("JSON data successfully written to NFC tag:", jsonString);
      alert("JSON data successfully written to NFC tag!");
    } else {
      alert("Your device or browser does not support WebNFC.");
      console.error("WebNFC is not supported on this browser or device.");
    }
  } catch (error) {
    console.error("Failed to write JSON data to NFC tag:", error);

    if (error.name === "NetworkError") {
      alert("Failed to write due to an IO error. Ensure the NFC tag is writable and try again.");
    } else {
      alert(error);
    }
  }
};

export const compressJson = (jsonString) => {
  try {
    const compressed = pako.gzip(jsonString); // Gzip 压缩
    const base64Compressed = btoa(String.fromCharCode(...compressed)); // 转为 Base64
    return base64Compressed;
  } catch (error) {
    console.error("Compression error:", error);
    throw error;
  }
};

// 解压缩 JSON 数据
export const decompressJson = (compressedString) => {
  try {
    const binaryString = atob(compressedString); // Base64 转回二进制字符串
    const compressed = Uint8Array.from(binaryString, (c) => c.charCodeAt(0)); // 转为 Uint8Array
    const jsonString = pako.ungzip(compressed, { to: "string" }); // 解压为字符串
    return jsonString;
  } catch (error) {
    console.error("Decompression error:", error);
    throw error;
  }
};



export const handlesurfwithNfc = ()=>{
  try {
    if ('NDEFReader' in window) {
      const ndef = new NDEFReader();
      ndef.scan();

      ndef.addEventListener("reading", event => {
        const decoder = new TextDecoder();
        let data = "";

        for (const record of event.message.records) {
          let recordData = decoder.decode(record.data);
          data += recordData;
        }

        if (data && data.length > 0) {

          if (messageData ) {
            console.log("Data read from NFC is complete and valid:", messageData);
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