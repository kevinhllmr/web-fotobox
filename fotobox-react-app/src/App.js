import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from './components/pages/MainPage';
import PhotoMode from './components/pages/PhotoMode';
import ConnectPhone from './components/pages/ConnectPhone';
import RemoteControl from './components/pages/RemoteControl';
import AdminSettings from './components/pages/AdminSettings';
import CloudAccess from './components/pages/CloudAccess'; 
import Settings from './components/pages/Settings';  
import { ProtectedRoute } from './components/controllers/Controller'; 

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Zustand für Authentifizierung

  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/home/' element={<MainPage />} />
        <Route path='/photomode/' element={<PhotoMode />} />
        <Route path='/connectphone/' element={<ConnectPhone />} />
        <Route path='/remote/' element={<RemoteControl />} />
        <Route path='/cloud/' element={<CloudAccess />} />
        <Route 
          path='/admin/' 
          element={<AdminSettings setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path='/admin/settings' 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Settings setIsAuthenticated={setIsAuthenticated} /> 
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
