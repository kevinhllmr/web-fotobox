import Peripherie from "./Peripherie";  // Import der Peripherie-Daten

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
export async function saveImageToIndexedDB(imageSrc) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const fileName = `${formattedDate}.png`;

    store.add({ name: fileName, data: imageSrc });

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

// Alle Bilder aus IndexedDB abrufen
export async function getAllImagesFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readonly');
    const store = transaction.objectStore('photos');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
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

// Funktion zur Verbindung mit dem USB-Gerät
export async function connectUSBDevice(setDevice, getCameraAccess) {
  try {
    console.log('Starte USB-Geräteverbindung...');

    const newDevice = await navigator.usb.requestDevice({ filters: [{ }] });
    console.log('USB-Gerät ausgewählt:', newDevice);

    await newDevice.open();
    console.log('USB-Gerät geöffnet.');

    if (newDevice.configuration === null) {
      await newDevice.selectConfiguration(1);
      console.log('Konfiguration für USB-Gerät ausgewählt.');
    }

    await newDevice.claimInterface(0);
    console.log('Interface für USB-Gerät beansprucht.');

    setDevice(newDevice);
    console.log('Gerät gespeichert:', newDevice);

    getCameraAccess(newDevice);
  } catch (error) {
    console.error('Error connecting USB device:', error);
    if (error.name === 'SecurityError') {
      alert('Zugriff auf USB-Gerät verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
    }
  }
}

export async function getCameraAccess(newDevice, videoRef, setVideoStreamActive) {
  try {
    await navigator.mediaDevices.getUserMedia({audio: false, video: true});
    console.log('Versuche, Kamerazugriff zu erhalten...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('Gefundene Geräte:', devices);

    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Videogeräte:', videoDevices);

    let selectedDeviceId;
    if (newDevice) {
      selectedDeviceId = videoDevices.find(device => device.label.includes(newDevice.productName))?.deviceId;
      console.log('Ausgewähltes Gerät:', selectedDeviceId);
    }

    if (!selectedDeviceId && videoDevices.length > 0) {
      selectedDeviceId = videoDevices[0].deviceId;
      console.log('Fallback-Gerät:', selectedDeviceId);
    }

    if (selectedDeviceId) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDeviceId } });
      console.log('Erhaltener Stream:', stream);
      videoRef.current.srcObject = stream;
      setVideoStreamActive(true);
    } else {
      throw new Error('Keine Kamera gefunden.');
    }
  } catch (error) {
    console.error('Fehler beim Zugriff auf die Kamera:', error);
    if (error.name === "NotAllowedError") {
      alert('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
    } else {
      retryUSBDeviceConnection();
    }
  }
}


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