import React from 'react';
import { IonIcon, IonLabel } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { home, walk, leafOutline, person } from 'ionicons/icons';

// Navbar simple, réutilisable sur les écrans "hub" de l'histoire :
// Home, Hiking Trails, Eco Missions, Profile.
// Ne pas l'ajouter sur TrailDetails / Map / QRScanner : ces écrans font partie
// d'une étape précise du flow (l'utilisateur y arrive via une action, pas en
// navigation libre), donc ils gardent juste leur bouton retour.

const NAV_ITEMS = [
  { path: '/home', icon: home, label: 'Home' },
  { path: '/trails', icon: walk, label: 'Trails' },
  { path: '/missions', icon: leafOutline, label: 'Missions' },
  { path: '/profile', icon: person, label: 'Profile' },
];

const NavBar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom)) 0',
        zIndex: 20
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <div
            key={item.path}
            onClick={() => history.push(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <IonIcon
              icon={item.icon}
              style={{
                fontSize: '22px',
                color: active ? 'var(--neon-cyan)' : 'var(--text-faint)'
              }}
            />
            <IonLabel style={{ fontSize: '10px', color: active ? 'var(--text-primary)' : 'var(--text-faint)' }}>
              {item.label}
            </IonLabel>
          </div>
        );
      })}
    </div>
  );
};

export default NavBar;
