import Peripherie from "./Peripherie";  // Import der Peripherie-Daten
import { Camera } from '../build/camera';
import WebRTC from './WebRTC'; 

// IndexedDB öffnen oder erstellen
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PhotoGalleryDB', 1);
    
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject('Fehler beim Öffnen der Datenbank: ' + event.target.errorCode);
    };
  });
}


// Bild in IndexedDB speichern
export async function saveImageToIndexedDB(file) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');

    // Sicherstellen, dass der Input ein Blob ist
    let fileBlob;
    if (file instanceof File || file instanceof Blob) {
      fileBlob = file;
    } else {
      throw new Error("Die Datei muss ein Blob oder ein File sein.");
    }

    // Aktuelles Datum und Uhrzeit für den Dateinamen
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const fileName = `${formattedDate}.jpg`;

    // Daten speichern
    store.add({ name: fileName, data: fileBlob });

    transaction.oncomplete = () => {
      console.log('Bild erfolgreich in IndexedDB gespeichert: ' + fileName);
    };

    transaction.onerror = (event) => {
      console.error('Fehler beim Speichern des Bildes in IndexedDB:', event.target.error);
    };
  } catch (error) {
    console.error('Fehler beim Speichern in IndexedDB:', error);
  }
}

// Alle Bilder aus IndexedDB abrufen und in URL umwandeln
export async function getAllImagesFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readonly');
    const store = transaction.objectStore('photos');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = (event) => {
        const images = event.target.result;

        // Blob in eine URL umwandeln
        const formattedImages = images.map(image => ({
          ...image,
          data: URL.createObjectURL(image.data)
        }));

        resolve(formattedImages);
      };

      request.onerror = (event) => {
        reject('Fehler beim Abrufen der Bilder aus IndexedDB: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Bilder aus IndexedDB:', error);
    return [];
  }
}



// Funktion zum Löschen des letzten Fotos in der IndexedDB
export async function deleteLastImageFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');

    const request = store.getAll();

    request.onsuccess = (event) => {
      const images = event.target.result;

      if (images.length > 0) {
        const lastImageId = images[images.length - 1].id; // ID des letzten Bildes
        const deleteRequest = store.delete(lastImageId);

        deleteRequest.onsuccess = () => {
          console.log('Letztes Foto erfolgreich gelöscht.');
        };

        deleteRequest.onerror = (deleteEvent) => {
          console.error(
            'Fehler beim Löschen des letzten Fotos:',
            deleteEvent.target.error
          );
        };
      } else {
        console.warn('Keine Bilder zum Löschen vorhanden.');
      }
    };

    request.onerror = (event) => {
      console.error(
        'Fehler beim Abrufen der Bilder aus IndexedDB:',
        event.target.errorCode
      );
    };
  } catch (error) {
    console.error('Fehler beim Löschen des letzten Fotos aus IndexedDB:', error);
  }
}



// Funktion zum Löschen aller Daten aus IndexedDB
export async function deleteDataFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');

    // Anfrage, um alle Daten zu löschen
    const request = store.clear();

    request.onsuccess = () => {
      console.log('Alle Daten wurden erfolgreich aus IndexedDB gelöscht.');
    };

    request.onerror = (event) => {
      console.error('Fehler beim Löschen der Daten aus IndexedDB:', event.target.error);
    };
  } catch (error) {
    console.error('Fehler beim Löschen der Daten aus IndexedDB:', error);
  }
}


// Funktion, um verfügbare USB-Geräte anzuzeigen und auszuwählen
export async function showAvailableUSBDevices(setDevice) {
  try {
    console.log("Zeige verfügbare USB-Geräte an...");
    const device = await navigator.usb.requestDevice({
      filters: [{ classCode: 6, subclassCode: 1 }] // PTP/MTP Filter
    });

    if (device) {
      console.log("Gerät ausgewählt:", device);
      const camera = new Camera();
      await camera.connect();
      console.log("Kamera verbunden:", camera);

      // Das ausgewählte Gerät speichern
      setDevice(camera);
    } else {
      console.warn("Kein Gerät ausgewählt.");
    }
  } catch (error) {
    console.error("Fehler bei der Geräteauswahl:", error);
    if (error.name === "NotAllowedError") {
      alert(
        "Zugriff auf USB-Geräte wurde verweigert. Bitte erlauben Sie den Zugriff."
      );
    }
  }
}


export async function connectUSBDevice(setDevice, getCameraAccess) {
  try {
    console.log("Starte USB-Geräteverbindung...");

    if (!navigator.usb) {
      alert("Ihr Browser unterstützt keine WebUSB-API.");
      return;
    }

    const camera = new Camera();
    await camera.connect(); // Verbindung mit der Kamera herstellen
    console.log("USB-Gerät erfolgreich verbunden:", camera);

    setDevice(camera);
    getCameraAccess(camera);
  } catch (error) {
    console.error("Error connecting USB device:", error);

    // Fehlerbehandlung: Bei Fehler erneut verfügbare Geräte anzeigen
    if (error.name === "NotFoundError") {
      console.warn("Kein USB-Gerät gefunden. Starte Geräteauswahl...");
      await showAvailableUSBDevices(setDevice);
    } else if (error.name === "SecurityError") {
      alert(
        "Zugriff auf USB-Gerät verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut."
      );
    }
  }
}

export async function selectUSBDevice(setDevice) {
  try {
    console.log("Zeige verfügbares USB-Gerät an...");
    const device = await navigator.usb.requestDevice({
      filters: [{ classCode: 6, subclassCode: 1 }], // PTP/MTP Filter
    });

    if (device) {
      console.log("Gerät ausgewählt:", device);
      const camera = new Camera();
      await camera.connect();
      console.log("Kamera verbunden:", camera);

      setDevice(camera); // Kamera speichern
      return camera;
    } else {
      console.warn("Kein Gerät ausgewählt.");
      return null;
    }
  } catch (error) {
    console.error("Fehler bei der Geräteauswahl:", error);
    return null;
  }
}



export async function getCameraAccess(device, videoRef, setVideoStreamActive) {
  try {
      console.log('Versuche, auf die Kamera zuzugreifen...', device);
      
      // Überprüfen, ob `device` und die Methode `getSupportedOps` existieren
      if (device && typeof device.getSupportedOps === "function") {
          const supportedOps = await device.getSupportedOps();
          console.log("Unterstützte Operationen:", supportedOps);

          // Wenn `capturePreview` unterstützt wird, benutze die Vorschau
          if (supportedOps.capturePreview) {
              const blob = await device.capturePreviewAsBlob();
              videoRef.current.srcObject = URL.createObjectURL(blob);
              setVideoStreamActive(true);
          } else {
              // Fallback, wenn `capturePreview` nicht unterstützt wird
              console.warn("Vorschau wird nicht unterstützt. Fallback auf interne Kamera.");
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              videoRef.current.srcObject = stream;
              setVideoStreamActive(true);
          }
      } else {
          // Fallback auf interne Kamera, falls `device` nicht existiert
          console.warn('Keine gültige Kamera gefunden. Fallback auf interne Kamera.');
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          setVideoStreamActive(true);
      }
  } catch (error) {
      console.error('Fehler beim Zugriff auf die Kamera:', error);
      throw error;
  }
}

export function handleSavePhotoRequest(videoRef, canvasRef) {
  if (WebRTC.dataChannel) {
      if (videoRef.current) {
          // Capture the image
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          const canvas = canvasRef.current;
          canvas.width = videoWidth;
          canvas.height = videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
          const imageData = canvas.toDataURL('image/png'); // Capture the image in base64

          // Ensure we have image data before sending
          if (imageData) {
              console.log('Sending photo data:', imageData);
              WebRTC.sendPhoto(imageData); // Send the captured photo over WebRTC
          } else {
              console.log('No image data captured');
          }
      } else {
          console.log('Video element is not ready');
      }
  } else {
      console.log('Data channel is not ready');
  }
}

// WebRTC onData handler to listen for commands from the phone
WebRTC.onData((message) => {
  const parsedMessage = JSON.parse(message);
  if (parsedMessage.type === 'savePhoto') {
      handleSavePhotoRequest(videoRef, canvasRef); // Trigger the photo capture and send process
  }
});



//TODO VIELLEICHT FÜR ZUKUNFT NÖTIG
// Funktion zum Abrufen von Bildern von der Kamera und zur Anzeige auf einer Leinwand
export async function startImageCapture(device, canvasRef, setImageSrc) {
  if (!device) return;

  try {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Simuliere einen Timer, der alle 2 Sekunden ein Bild von der Kamera abruft
    setInterval(async () => {
      // Abruf eines Bildes von der Kamera (hier müsstest du abhängig vom PTP-Protokoll oder dem spezifischen USB-Befehl handeln)
      const photo = await captureImage(device);

      // Das Bild auf das Canvas zeichnen
      const img = new Image();
      img.src = URL.createObjectURL(new Blob([photo], { type: 'image/jpeg' }));
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
      };

      // Bildquelle setzen (kann auch für den Download verwendet werden)
      setImageSrc(img.src);
    }, 2000); // Alle 2 Sekunden ein neues Bild abrufen
  } catch (error) {
    console.error('Fehler beim Abrufen des Bildes:', error);
  }
}

// Beispiel einer Funktion, um ein Bild von der Kamera aufzunehmen (diese ist abhängig von der Kamera und dem Protokoll)
async function captureImage(device) {
  // Hier sendest du USB-Steuerbefehle an die Kamera, um ein Bild zu erfassen und es dann zurückzuholen
  const result = await device.controlTransferIn({
    requestType: 'class', // oder 'vendor', abhängig von der Kamera
    recipient: 'interface',
    request: 0x01, // Beispiel für einen USB-Befehl
    value: 0x0100,
    index: 0x00
  }, 1024 * 64); // Empfangsgröße (angepasst auf die Größe des Bildes)

  return result.data.buffer;
}



// Funktion zum Umschalten der Kamera
export function handleCameraToggle(setCameraActive) {
  setCameraActive(prev => !prev);
}

// Funktion zum Starten des Countdowns
export function startCountdown(timerValue, setCountdown, takePicture) {
  setCountdown(timerValue);
  const interval = setInterval(() => {
    setCountdown(prevCountdown => {
      if (prevCountdown === 1) {
        clearInterval(interval);
        takePicture();
        return 0;
      } else {
        return prevCountdown - 1;
      }
    });
  }, 1000);
}

// Funktion zum Aufnehmen eines Fotos
export function takePicture(videoRef, canvasRef, setImageSrc, setPhotoTaken) {
  if (videoRef.current) {
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const canvas = canvasRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const imageData = canvas.toDataURL('image/png');
    setImageSrc(imageData);
    setPhotoTaken(true);
  }
}

// Funktion zum Herunterladen des Bildes
export function downloadImage(imageSrc) {
  if (imageSrc) {
    const link = document.createElement('a');
    link.href = imageSrc;
    
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const fileName = `${formattedDate}.png`;

    link.download = fileName;
    link.click();
  }
}

class AdminSettingsController {
  constructor() {
    this.validUsername = "Novotrend Nöthen";
    this.validPassword = "ASDjkl159";
  }

  validateLogin(username, password) {
    return username === this.validUsername && password === this.validPassword;
  }

  toggleExternCamera() {
    Peripherie.hasExternCamera = !Peripherie.hasExternCamera;
  }

  toggleCloudAccess() {
    Peripherie.cloudAccess = !Peripherie.cloudAccess;
  }

  updateVendorID(newVendorID) {
    Peripherie.vendorID = newVendorID;
  }
}

export default AdminSettingsController;

// ProtectedRoute-Komponente
export function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/home" />;
}