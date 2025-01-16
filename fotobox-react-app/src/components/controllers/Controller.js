import Peripherie from "./Peripherie";  // Import der Peripherie-Daten
import WebRTC from './WebRTC'; 


/*Datenbanken Funktionen*/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

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

// Funktion zum Löschen eines bestimmten Bildes aus der IndexedDB
export async function deleteImageFromIndexedDB(identifier) { //identifier ist entweder ID oder Name
  try {
    const db = await openDatabase();
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');

    // Abrufen aller Bilder, um das gewünschte Bild zu finden
    const request = store.getAll();

    request.onsuccess = (event) => {
      const images = event.target.result;

      // Bild anhand von ID oder Name finden
      const imageToDelete = images.find(
        (image) => image.id === identifier || image.name === identifier
      );

      if (imageToDelete) {
        const deleteRequest = store.delete(imageToDelete.id);

        deleteRequest.onsuccess = () => {
          console.log(`Bild mit der ID/Name "${identifier}" erfolgreich gelöscht.`);
        };

        deleteRequest.onerror = (deleteEvent) => {
          console.error(
            'Fehler beim Löschen des Bildes:',
            deleteEvent.target.error
          );
        };
      } else {
        console.warn(
          `Kein Bild mit der ID/Name "${identifier}" in der Datenbank gefunden.`
        );
      }
    };

    request.onerror = (event) => {
      console.error(
        'Fehler beim Abrufen der Bilder aus IndexedDB:',
        event.target.errorCode
      );
    };
  } catch (error) {
    console.error('Fehler beim Löschen eines Bildes aus IndexedDB:', error);
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


/*Web-RTC Funktionen*/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/
/*****************************************************************/

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


/*
 * ==========================================
 * Kontext: Erklärung zu letzten Funktionen
 * ==========================================
 * Diese Funktionen wurde als Debugging - Settings erstellt - diese sind nun nicht mehr nötig
 * Modul existiert nur noch, weil wir es nicht löschen wollen 
 * PS: Wir wissen dass wir das Passwort hier nicht stehen haben 
 * sollten, aber es wurde noch nie öffentlich benutzt und jetzt
 * kann man sich ohne viel zu überlegen einfach einloggen falls 
 * man die Settings benutzen möchte
 *
 */
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