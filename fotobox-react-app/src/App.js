import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from './components/pages/MainPage';
import PhotoMode from './components/pages/PhotoMode';
import AdminSettings from './components/pages/AdminSettings';
import CloudAccess from './components/pages/CloudAccess';

const App = () => {

  return (
    <>
      <Router>
        <Routes>
          <Route path='' exact Component={MainPage} />
          <Route path='/home/' exact Component={MainPage} />
          <Route path='/photomode/' exact Component={PhotoMode} />
          <Route path='/cloud/' exact Component={CloudAccess} />
          <Route path='/admin/' exact Component={AdminSettings} />
        </Routes>
      </Router>
    </>
  );
};

export default App;