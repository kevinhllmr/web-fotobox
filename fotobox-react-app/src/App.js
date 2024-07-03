import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from './components/pages/MainPage';
import PhotoMode from './components/pages/PhotoMode';

const App = () => {

  return (
    <>
      <Router>
        <Routes>
          <Route path='' exact Component={MainPage} />
          <Route path='/home/' exact Component={MainPage} />
          <Route path='/photomode/' exact Component={PhotoMode} />
        </Routes>
      </Router>
    </>
  );
};

export default App;