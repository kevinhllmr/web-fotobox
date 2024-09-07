import React, { useState, useEffect } from 'react';
import '../../App.css';
import './CloudAccess.css';
import { getAllImagesFromIndexedDB, downloadImage } from '../controllers/Controller.js'; // Importiere die Funktionen
import { useNavigate } from 'react-router-dom';

function CloudAccess() {
  const [galleryImages, setGalleryImages] = useState([]); // Zustand für die Galerie-Bilder
  const [currentPage, setCurrentPage] = useState(0); // Zustand für die aktuelle Seite
  const [selectedImage, setSelectedImage] = useState(null); // Zustand für das ausgewählte Bild
  const imagesPerPage = 6; // Anzahl der Bilder pro Seite
  const navigate = useNavigate();

  useEffect(() => {
    loadGallery(); // Lade die Galerie-Bilder bei der Komponentenerstellung
  }, []);

  // Funktion für den Zurück-Button
  const handleBackClick = () => {
    navigate('/home/');
  };

  // Funktion zum Laden der Bilder aus IndexedDB
  const loadGallery = async () => {
    const images = await getAllImagesFromIndexedDB();
    const numberedImages = images.map((image, index) => ({ ...image, number: index + 1 })); // Nummeriere die Bilder
    setGalleryImages(numberedImages.reverse()); // Bilder umkehren, sodass die neuesten zuerst sind
  };

  // Berechnung der angezeigten Bilder basierend auf der aktuellen Seite
  const displayedImages = galleryImages.slice(
    currentPage * imagesPerPage,
    (currentPage + 1) * imagesPerPage
  );

  // Funktion zum Wechseln der Seite nach links
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Funktion zum Wechseln der Seite nach rechts
  const handleNextPage = () => {
    if ((currentPage + 1) * imagesPerPage < galleryImages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Funktion zum Anzeigen des Modals mit dem ausgewählten Bild
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Funktion zum Schließen des Modals
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Funktion zum Senden des Fotos an ein Smartphone
  const sendFotoToSmartphone = (imageSrc) => {
    console.log('Sending photo to smartphone:', imageSrc);
    // Hier kannst du die Logik implementieren, um das Foto an ein Smartphone zu senden
  };

  return (
    <div className='main-container'>
      <img id="bg" src={process.env.PUBLIC_URL + '/images/home-bg.png'} alt="Background" />
      <div className="gallery-container">
        <h3>Cloud Access - Gallery</h3>
        {galleryImages.length > 0 ? (
          <div className="gallery-grid">
            {displayedImages.map((image, index) => (
              <div key={index} className="gallery-item" onClick={() => openImageModal(image)}>
                <img src={image.data} alt={image.name} className="gallery-image" />
                <p>{image.number}</p> {/* Bildnummer anzeigen */}
              </div>
            ))}
          </div>
        ) : (
          <p>No images available.</p>
        )}

        {/* Feste Knöpfe für Seitenwechsel */}
        <button className="scroll-button left" onClick={handlePreviousPage} disabled={currentPage === 0}>
          &lt; {/* Pfeil nach links */}
        </button>
        <button className="scroll-button right" onClick={handleNextPage} disabled={(currentPage + 1) * imagesPerPage >= galleryImages.length}>
          &gt; {/* Pfeil nach rechts */}
        </button>

        <div>
          <p id="return-button" onClick={handleBackClick}>zurück</p>
        </div>
      </div>

      {/* Modal für das ausgewählte Bild */}
      {selectedImage && (
        <div className="modal" onClick={closeImageModal}>
          <span className="close">&times;</span>
          <img className="modal-content" src={selectedImage.data} alt={selectedImage.name} />
          <div className="caption">{selectedImage.name}</div>
          {/* Knöpfe zum Herunterladen und Senden des Bildes an ein Smartphone */}
          <div className="modal-buttons">
            <button id= "downloadButton" onClick={() => downloadImage(selectedImage.data)}>Bild herunterladen</button>
            <button id = "sendFotoButton" onClick={() => sendFotoToSmartphone(selectedImage.data)}>Bild an Smartphone senden</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CloudAccess;
