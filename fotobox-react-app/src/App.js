import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from './components/pages/MainPage';
import PhotoMode from './components/pages/PhotoMode';
import ConnectPhone from './components/pages/ConnectPhone';
import RemoteControl from './components/pages/RemoteControl';
import AdminSettings from './components/pages/AdminSettings';
import CloudAccess from './components/pages/CloudAccess';
import AdminPage from './components/pages/Settings';  // Importiere die Seite, die nach dem Login angezeigt werden soll
import { ProtectedRoute }from './components/controllers/Controller';  // Importiere die geschützte Route

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Zustand für Authentifizierung

  return (
    <>
      <Router>
        <Routes>
          <Route path='' exact Component={MainPage} />
          <Route path='/home/' exact Component={MainPage} />
          <Route path='/photomode/' exact Component={PhotoMode} />
          <Route path='/connectphone/' exact Component={ConnectPhone} />
          <Route path='/remote/' exact Component={RemoteControl} />
          <Route path='/cloud/' exact Component={CloudAccess} />
          <Route path='/admin/' exact Component={() => <AdminSettings setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/admin/settings' exact Component={() => <ProtectedRoute isAuthenticated={isAuthenticated}><AdminPage /> </ProtectedRoute>
                 } 
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;
