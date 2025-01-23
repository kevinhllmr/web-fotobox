import React, { useEffect, useState, useRef } from "react";
import "../../App.css";
import "./PhotoMode.css";
import { saveImageToIndexedDB, deleteLastImageFromIndexedDB} from "../controllers/Controller.js";
import { useNavigate } from "react-router-dom";
import { Camera } from "../build/camera.js"; // Importiere die Camera-Klasse von web-gphoto2
import WebRTC from '../controllers/WebRTC';
import Peripherie from '../controllers/Peripherie.js';

function PhotoMode() {
  const navigate = useNavigate();
  const [camera, setCamera] = useState(null); // State to store the current camera instance
  const [cameraActive, setCameraActive] = useState(false); // Tracks if the camera is active
  const [imageSrc, setImageSrc] = useState(null); // Stores the captured image source
  const [photoTaken, setPhotoTaken] = useState(false); // Indicates if a photo has been taken
  const [showButtons, setButtonsShown] = useState(false); // Controls the visibility of action buttons
  const [timerValue, setTimerValue] = useState(3); // Sets the countdown timer value
  const [countdown, setCountdown] = useState(0); // Tracks the countdown value
  const [blobURL, setBlobURL] = useState(null); // Stores the blob URL for camera preview
  const [streamIntervalId, setStreamIntervalId] = useState(null); // Interval ID for managing video stream updates
  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element

  const [webrtcConnected, setWebrtcConnected] = useState(false); // Tracks WebRTC connection status
  const CHUNK_SIZE = 16000; // 16kB per chunk for WebRTC data

  useEffect(() => {
    // Handle cleanup when the page is reloaded
    const handleUnload = async () => {
      console.log("Page is reloading, disconnecting camera.");
      await cleanupResourcesGlobal(); // Clean up camera and stream resources
    };

    window.addEventListener("beforeunload", handleUnload); // Add event listener for page unload

    // Check the device used and hide buttons if on phone
    const deviceUsed = localStorage.getItem('deviceUsed');
    if (deviceUsed === 'phone') {
      setButtonsShown(false);
    }

    // Initialize the internal camera if no external camera is available
    const initializeCameraIntern = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true }); // Get video stream

        if (videoRef.current) {
          videoRef.current.pause(); // Stop the current video if it's playing
          videoRef.current.srcObject = null; // Remove the current video source
        }

        videoRef.current.srcObject = stream; // Set the video stream as the source
        await videoRef.current.play(); // Start playing the video stream
        setCameraActive(true); // Mark the camera as active
      } catch (error) {
        console.error("Error accessing the camera:", error); // Log any errors
      }
    };

    if (!Peripherie.hasExternCamera) {
      initializeCameraIntern(); // Initialize the internal camera if no external camera is available
    }

    // Check the WebRTC connection status and adjust button visibility
    const checkWebRTCConnection = () => {
      if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
        setButtonsShown(false); // Hide buttons if WebRTC is connected
      } else {
        setButtonsShown(true); // Show buttons if WebRTC is not connected
      }
    };

    checkWebRTCConnection();

    // Handle incoming data from WebRTC peer
    const peer = WebRTC.peer;
    if (peer) {
      peer.on('data', (data) => {
        handleIncomingData(data); // Process incoming data
      });
    }

    WebRTC.onData(handleIncomingData); // Set up a handler for WebRTC data events

    // Cleanup function for when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleUnload); // Remove the unload event listener
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all video tracks
      }
    };
  }, [camera, streamIntervalId]); // Dependencies to trigger the effect



/*WEB RTC FUNCTIONS */
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

  const handleIncomingData = (data) => {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'startCountdown':
        startPhotoCountdownExtern();
        break;
      case 'savePhoto':
        uploadImageToCloud(imageSrc);
        break;
      case 'retryPhoto':
        handleRetakePictureExtern();
        break;
      case 'photoData':
        handleReceivedPhotoData(message.data);
        break;
      default:
        break;
    }
  };

  const sendPhotoData = (photoDataUrl) => {
    if (WebRTC.dataChannel && WebRTC.dataChannel.readyState === 'open') {
      const chunks = splitIntoChunks(photoDataUrl, CHUNK_SIZE);

      chunks.forEach((chunk, index) => {
        const message = JSON.stringify({
          type: 'photoData',
          data: chunk,
          index,
          totalChunks: chunks.length
        });

        console.log(`Sending chunk ${index + 1}/${chunks.length}:`, message);
        WebRTC.sendMessage(message);
      });
    } else {
      console.log('Data channel is not open. Unable to send photo data.');
    }
  };

  const splitIntoChunks = (data, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.substring(i, i + chunkSize));
    }
    return chunks;
  };

  const handleReceivedPhotoData = (photoData) => {
    const link = document.createElement('a');
    link.href = photoData;
    link.download = 'photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


/*Photomode FUNCTIONS EXTERN/INTERN */
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

  // Internal Functions
/*****************************************************************/

// Function to reset the internal camera and prepare for a new photo
const handleRetakeIntern = async () => {
  setImageSrc(null); // Clear the current image source
  setPhotoTaken(false); // Reset photo taken status
  setButtonsShown(true); // Ensure buttons are displayed
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true }); // Access the video stream

      if (videoRef.current) {
          videoRef.current.pause(); // Stop the current video if it's playing
          videoRef.current.srcObject = null; // Remove the current video source
      }

      videoRef.current.srcObject = stream; // Assign the new video stream
      await videoRef.current.play(); // Start playing the video stream
      setCameraActive(true); // Set the camera as active
  } catch (error) {
      console.error("Error accessing the camera:", error); // Log any errors during camera access
  }
};

// Function to save the currently captured photo to IndexedDB
const handleSavePhotoIntern = async () => {
  if (imageSrc) {
      const blob = await fetch(imageSrc).then((res) => res.blob()); // Convert the image source to a Blob
      saveImageToIndexedDB(blob); // Save the Blob to IndexedDB
      handleRetakeIntern(); // Reset the camera for the next photo
  }
};

// Function to initiate the countdown before taking a photo
const handleStartCountdownIntern = () => {
  startCountdownIntern(3, setCountdown, () => {
      takePictureIntern(videoRef, canvasRef, setImageSrc, setPhotoTaken); // Take a picture when the countdown ends
  });
};

// Function to manage a countdown timer
function startCountdownIntern(timerValue, setCountdown, takePicture) {
  setCountdown(timerValue); // Initialize the countdown value
  const interval = setInterval(() => {
      setCountdown(prevCountdown => {
          if (prevCountdown === 1) {
              clearInterval(interval); // Stop the interval when the countdown reaches 1
              takePicture(); // Trigger the picture-taking function
              return 0; // Reset the countdown
          } else {
              return prevCountdown - 1; // Decrement the countdown
          }
      });
  }, 1000); // Execute every second
}

// Function to capture a photo from the video stream
function takePictureIntern(videoRef, canvasRef, setImageSrc, setPhotoTaken) {
  if (videoRef.current) {
      const videoWidth = videoRef.current.videoWidth; // Get the video stream width
      const videoHeight = videoRef.current.videoHeight; // Get the video stream height
      const canvas = canvasRef.current;
      canvas.width = videoWidth; // Set the canvas width
      canvas.height = videoHeight; // Set the canvas height
      const context = canvas.getContext('2d'); // Get the 2D drawing context
      context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight); // Draw the video frame onto the canvas
      const imageData = canvas.toDataURL('image/png'); // Convert the canvas content to a PNG data URL
      setImageSrc(imageData); // Update the image source with the captured photo
      setPhotoTaken(true); // Indicate that a photo has been taken
  }
}

  // External Functions
/*****************************************************************/

// Function to reset the external camera and prepare for a new photo
const handleRetakePictureExtern = () => {
  setImageSrc(null); // Clear the current image source
  setPhotoTaken(false); // Reset photo taken status
  setCameraActive(false); // Deactivate the camera temporarily
  setButtonsShown(true); // Show the buttons again
  setTimeout(() => {
      setCameraActive(true); // Reactivate the camera after a short delay
  }, 1);
};

// Function to delete the last photo from IndexedDB
const handleDeleteLastPhotoExtern = async () => {
  console.log("Discarding photo...");
  await deleteLastImageFromIndexedDB(); // Remove the last photo from the database
  setImageSrc(null); // Reset the image source
  setPhotoTaken(false); // Reset photo taken status
  setButtonsShown(true); // Show the buttons again
};

// Function to start the countdown for taking a photo
const startPhotoCountdownExtern = () => {
  console.log("Starting photo countdown...");
  setButtonsShown(false); // Hide the buttons during the countdown
  startCountdownIntern(timerValue, setCountdown, capturePictureExtern); // Start the countdown and trigger photo capture
};

// Function to capture a picture using the external camera
const capturePictureExtern = async () => {
  if (!camera) {
      console.error("Camera is not connected.");
      return;
  }

  try {
      console.log("Taking picture...");
      const file = await camera.captureImageAsFile(); // Capture the image as a file
      saveImageToIndexedDB(file); // Save the captured image to IndexedDB
      const imgURL = URL.createObjectURL(file); // Generate a URL for the captured image
      setImageSrc(imgURL); // Set the captured image as the source

      setBlobURL(null); // Clear the preview URL
      setPhotoTaken(true); // Update the photo taken status
  } catch (error) {
      console.error("Error capturing the picture:", error); // Log any errors during photo capture
  }
};

// Function to start the external camera application
const handleStartAppExtern = () => {
  console.log("Starting camera app...");
  initializeCameraExtern(); // Initialize the camera
};

// Function to initialize the external camera
const initializeCameraExtern = async () => {
  try {
      console.log("Initializing camera...");
      const newCamera = new Camera(); // Create a new camera instance
      await Camera.showPicker(); // Show the camera picker
      await newCamera.connect(); // Connect to the selected camera
      setCamera(newCamera); // Save the connected camera instance

      console.log("Operations supported by the camera:", await newCamera.getSupportedOps()); // Log supported operations
      console.log("Current configuration tree:", await newCamera.getConfig()); // Log the current configuration

      // Start the preview
      setTimeout(async () => {
          try {
              const blob = await newCamera.capturePreviewAsBlob(); // Capture the preview as a Blob
              const imgURL = URL.createObjectURL(blob); // Generate a URL for the preview
              setBlobURL(imgURL); // Set the preview URL
              setCameraActive(true); // Activate the camera
              setButtonsShown(true); // Show the buttons
              startVideoStreamExtern(newCamera); // Start the live video stream
          } catch (error) {
              console.error("Error retrieving the camera preview:", error); // Log any errors during preview
          }
      }, 1000);
  } catch (error) {
      console.error("Error initializing the camera:", error); // Log any errors during initialization
  }
};

// Function to start the live video stream from the external camera
const startVideoStreamExtern = (camera) => {
  const intervalId = setInterval(async () => {
      try {
          const blob = await camera.capturePreviewAsBlob(); // Capture the preview as a Blob
          const imgURL = URL.createObjectURL(blob); // Generate a URL for the preview
          setBlobURL(imgURL); // Update the preview URL
      } catch (error) {
          console.error("Error retrieving the camera stream:", error); // Log any errors during the video stream
          clearInterval(intervalId); // Stop the interval if an error occurs
          setStreamIntervalId(null); // Reset the stream interval ID
      }
  }, 50); // Update the preview every 50ms
  setStreamIntervalId(intervalId); // Save the interval ID for later clearing
};

  // Global Functions
/*****************************************************************/

// Function to end the current session and navigate to the home page
const handleEndSessionGlobal = async () => {
  console.log("Leaving the page and disconnecting the camera.");
  await cleanupResourcesGlobal(); // Clean up resources before navigating
  navigate("/home/"); // Navigate to the home page
  window.location.reload(); // Reload the page to reset the application state
};

// Function to clean up global resources, including stopping the video stream and disconnecting the camera
const cleanupResourcesGlobal = async () => {
  if (streamIntervalId) {
      clearInterval(streamIntervalId); // Stop the video stream interval
      setStreamIntervalId(null); // Reset the interval ID
      console.log("Video stream stopped.");
  }
  if (camera) {
      try {
          await camera.disconnect(); // Disconnect the camera
          console.log("Camera successfully disconnected.");
          setCamera(null); // Reset the camera instance
      } catch (error) {
          console.error("Error while disconnecting the camera:", error); // Log any errors during disconnection
      }
  }
};


// Main PhotoMode Component
return (
  <div className="PhotoMode">
    {/* Background image for the PhotoMode screen */}
    <img
      id="bg"
      src={process.env.PUBLIC_URL + "/images/home-bg.png"}
      alt="Background"
    />
    <header className="App-header">
      {/* Check if an external camera is available */}
      {Peripherie.hasExternCamera ? (
        !cameraActive ? (
          <>
            {/* Show start button and instructions if the camera is not active */}
            <button className="start-button" onClick={handleStartAppExtern}>
              Start
            </button>
            <div className="instructions">
              <ol>
                <li>Press Start</li>
                <li>Select the camera (only option available)</li>
                <li>Press Connect.</li>
              </ol>
            </div>
            <div className="footer">
              {/* End session and go back */}
              <p id="back-button" onClick={handleEndSessionGlobal}>Back</p>
            </div>
          </>
        ) : (
          <>
            {/* Display camera preview if the camera is active but no photo has been taken */}
            {!photoTaken ? (
              <>
                <img src={blobURL} alt="Camera Preview" className="camera-preview" />
                {showButtons && (
                  <div className="button-container">
                    <button className="start-button" onClick={startPhotoCountdownExtern}>
                      Start Countdown
                    </button>
                    <button className="end-button" onClick={handleEndSessionGlobal}>
                      End Session
                    </button>
                  </div>
                )}
                {/* Show countdown timer if active */}
                {countdown > 0 && <div className="countdown">{countdown}</div>}
              </>
            ) : (
              <>
                {/* Display the captured image and provide options to save or discard */}
                <img className="camera-preview" src={imageSrc} alt="Captured" />
                <div className="button-container">
                  <button className="start-button" onClick={handleRetakePictureExtern}>
                    Save Photo
                  </button>
                  <button className="end-button" onClick={handleDeleteLastPhotoExtern}>
                    Discard Photo
                  </button>
                </div>
              </>
            )}
          </>
        )
      ) : (
        <>
          {/* Logic for the internal camera (no external camera available) */}
          {!photoTaken ? (
            <>
              {/* Display video feed for the camera preview */}
              <video ref={videoRef} className="camera-preview" playsInline />
              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {/* Show countdown timer if active */}
              {countdown > 0 && <div className="countdown">{countdown}</div>}
              <div className="button-container">
                <button className="start-button" onClick={handleStartCountdownIntern}>
                  Start Countdown
                </button>
                <button className="end-button" onClick={handleEndSessionGlobal}>
                  End Session
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Display the captured image and provide options to save or retake */}
              <img className="camera-preview" src={imageSrc} alt="Captured" />
              <div className="button-container">
                <button className="start-button" onClick={handleSavePhotoIntern}>
                  Save Photo
                </button>
                <button
                  className="end-button"
                  onClick={() => {
                    handleRetakeIntern();
                  }}
                >
                  Discard Photo
                </button>
              </div>
            </>
          )}
        </>
      )}
    </header>
  </div>
);

}
export default PhotoMode;

