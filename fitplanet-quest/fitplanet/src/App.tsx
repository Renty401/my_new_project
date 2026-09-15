import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';

import { IonReactRouter } from '@ionic/react-router';

import Splash from './pages/Splash';
import Home from './pages/Home';
import Quest from './pages/Quest';
import MapZone from './pages/MapZone';
import Battle from './pages/Battle';
import Trail from './pages/Trail';
import TrailDetails from './pages/TrailDetail';
import QRScanner from './pages/QRScanner';
import MyMissions from './pages/MyMissions';
import Profile from './pages/Profile';
import NavBar from './pages/NavBar';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import './theme/variables.css';

setupIonicReact();

// Petit composant interne : nécessaire pour que NavBar puisse utiliser
// useLocation (il faut être à l'intérieur de IonReactRouter pour ça).
const AppContent: React.FC = () => {
  const location = useLocation();
  const hideNavBar = location.pathname === '/splash' || location.pathname === '/';

  return (
    <>
      <IonRouterOutlet>

        {/* SPLASH */}
        <Route exact path="/splash" component={Splash} />

        {/* HOME (dashboard) */}
        <Route exact path="/home" component={Home} />

        {/* 🥾 HIKING TRAILS (liste depuis l'API Laravel) */}
        <Route exact path="/trails" component={Trail} />

        {/* 📄 TRAIL DETAILS */}
        <Route exact path="/trails/:id" component={TrailDetails} />

        {/* 🗺️ MAP */}
        <Route exact path="/map" component={MapZone} />

        {/* 🌱 ECO MISSIONS */}
        <Route exact path="/missions" component={Quest} />

        {/* MES MISSIONS PERSONNALISÉES (CRUD local) */}
        <Route exact path="/my-missions" component={MyMissions} />

        {/* 🔳 QR SCANNER */}
        <Route exact path="/scan" component={QRScanner} />

        {/* 👤 PROFILE */}
        <Route exact path="/profile" component={Profile} />

        {/* Combat (mécanisme interne, atteint depuis Eco Missions) */}
        <Route exact path="/battle" component={Battle} />

        {/* REDIRECTION AU DÉMARRAGE */}
        <Route exact path="/">
          <Redirect to="/splash" />
        </Route>

      </IonRouterOutlet>

      {/* Navbar fixe, toujours accessible sauf sur le splash screen */}
      {!hideNavBar && <NavBar />}
    </>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  </IonApp>
);

export default App;
