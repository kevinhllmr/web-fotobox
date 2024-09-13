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


export async function connectUSBDevice(setDevice, getCameraAccess) {
  try {
    console.log('Starte USB-Geräteverbindung...');

    const newDevice = await navigator.usb.requestDevice({ filters: [{ vendorId: Peripherie.vendorID }] });
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
    console.log('Versuche, Kamerazugriff zu erhalten...');

    if (newDevice && Peripherie.hasExternCamera) {
      console.log('Externe Kamera wird versucht zu verbinden:', newDevice.productName);

      // Nutze WebUSB spezifische Funktionen, um Zugriff auf die externe Kamera zu erhalten
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Verfügbare Geräte:', devices);
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Gefilterte Videogeräte:', videoDevices);

      // Debugging: Alle verfügbaren Geräte-Labels, IDs und Gruppen auflisten
      videoDevices.forEach((device, index) => {
        console.log(`Videogerät ${index}: Label - ${device.label}, DeviceID - ${device.deviceId}, GroupID - ${device.groupId}`);
      });

      // Versuche, das Gerät anhand der vendorID zu finden
      let selectedDeviceId = videoDevices.find(device => device.deviceId.includes(Peripherie.vendorID.toString(16)))?.deviceId;

      if (!selectedDeviceId) {
        console.warn('Exakte externe Kamera konnte nicht anhand der VendorID gefunden werden. Versuche, anhand der groupId zu suchen.');

        // Fallback auf Suche nach einer `groupId`, die sich von den typischen internen Kameras unterscheidet
        const uniqueGroupIds = [...new Set(videoDevices.map(device => device.groupId))];
        console.log('Eindeutige Gruppen-IDs gefunden:', uniqueGroupIds);

        if (uniqueGroupIds.length === 1) {
          // Wenn nur eine Gruppe vorhanden ist, ist das die externe Kamera
          selectedDeviceId = videoDevices.find(device => device.groupId === uniqueGroupIds[0])?.deviceId;
        } else {
          // Wenn mehrere Gruppen vorhanden sind, könnte eine davon die externe Kamera sein (Fallback auf die erste)
          selectedDeviceId = videoDevices.find(device => device.groupId !== "" && device.groupId !== "default")?.deviceId;
          console.warn('Fällt auf das erste verfügbare Gerät zurück, wenn keine eindeutige Zuordnung möglich ist:', selectedDeviceId);
        }
      }

      if (!selectedDeviceId) {
        console.error('Externe Kamera konnte nicht gefunden werden, obwohl sie angeschlossen ist.');
        console.log('Produktname der externen Kamera (newDevice.productName):', newDevice.productName);
        console.log('Video-Gerätelabels und Gruppen-IDs, die durchsucht wurden:', videoDevices.map(device => ({ label: device.label, groupId: device.groupId })));
        return;
      }

      console.log('Ausgewählte Gerät-ID für externe Kamera:', selectedDeviceId);

      // Zugriff auf die Kamera
      const constraints = { video: { deviceId: { exact: selectedDeviceId } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Erhaltener Stream von externer Kamera:', stream);
      videoRef.current.srcObject = stream;
      setVideoStreamActive(true);

    } else if (!newDevice) {
      console.log('Keine externe Kamera vorhanden, Fallback auf interne Kamera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Erhaltener Stream von interner Kamera:', stream);
      videoRef.current.srcObject = stream;
      setVideoStreamActive(true);
    } else {
      console.error('Keine Kamera gefunden.');
    }
  } catch (error) {
    console.error('Fehler beim Zugriff auf die Kamera:', error);
    if (error.name === "NotAllowedError") {
      alert('Kamerazugriff wurde verweigert. Bitte erlauben Sie den Zugriff und versuchen Sie es erneut.');
    }
  }
}


/*
export async function retryUSBDeviceConnection() {
  try {
    console.log('Versuche erneut, das USB-Gerät zu verbinden...');
    await connectUSBDevice((device) => {
      // Zeige den Einstellungsdialog erneut an
      alert('Bitte geben Sie erneut die USB-Vendor-ID ein.');
    }, getCameraAccess);
  } catch (error) {
    console.error('Fehler beim erneuten Versuch, das USB-Gerät zu verbinden:', error);
  }
}*/


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

  // Funktion zum Umschalten der externen Kamera
  toggleExternCamera() {
    Peripherie.hasExternCamera = !Peripherie.hasExternCamera;  // Umschalten des Werts
  }

  // Funktion zum Umschalten des Cloud Access
  toggleCloudAccess() {
    Peripherie.cloudAccess = !Peripherie.cloudAccess;  // Umschalten des Werts
  }

  // Funktion zum Aktualisieren der Vendor ID
  updateVendorID(newVendorID) {
    Peripherie.vendorID = newVendorID;  // Aktualisiere die Vendor ID
  }

}

export default AdminSettingsController;

// ProtectedRoute-Komponente
export function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/home" />;
}

