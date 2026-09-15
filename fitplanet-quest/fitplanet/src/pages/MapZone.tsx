import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonCard, 
  IonCardContent, IonIcon, IonAvatar, IonButton, IonSearchbar,
  IonList, IonItem, IonLabel, IonSpinner,
  useIonViewWillLeave
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { locationOutline, walkOutline, flameOutline, locateOutline, trendingUpOutline, removeOutline, searchOutline, navigateOutline } from 'ionicons/icons';
import { Trail } from '../services/api';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

//   DYNAMIQUE CONFIGURATION OF ECO-ZONES  (utilisé pour le flow Eco Missions / Battle)
const ECO_QUESTS = [
  { id: 'sodnac', name: 'Sodnac Wellness Matrix', monster: 'Smog Monster', lat: -20.2625, lng: 57.4872 },
  { id: 'portlouis', name: 'Port Louis Harbour Clean-zone', monster: 'Carbon Slime', lat: -20.1606, lng: 57.5012 },
  { id: 'cybercity', name: 'Cybercity Green Node', monster: 'E-Waste Golem', lat: -20.2415, lng: 57.4810 }
];

// ⚠️ Les coordonnées viennent maintenant directement de l'API (colonnes
// latitude/longitude ajoutées à la table trails). Si un sentier plus ancien
// n'a pas encore de coordonnées renseignées (nullable), on retombe sur ce
// centre approximatif de Maurice pour ne pas planter la carte.
const DEFAULT_TRAIL_COORDS = { lat: -20.2, lng: 57.5 };

// Estimation du profil de terrain — ton API n'a pas de dénivelé, donc on
// déduit une indication approximative à partir de la difficulté.
const getTerrainEstimate = (difficulty?: string) => {
  const d = difficulty?.toLowerCase() || '';
  if (d.includes('hard') || d.includes('difficile')) {
    return { label: 'Steep climb', icon: trendingUpOutline };
  }
  if (d.includes('moderate') || d.includes('modéré') || d.includes('medium')) {
    return { label: 'Rolling terrain', icon: trendingUpOutline };
  }
  return { label: 'Flat trail', icon: removeOutline };
};

// ⚠️ FIX : Quest.tsx enregistre la zone choisie par l'utilisateur dans
// localStorage ('target_zone_name' / 'target_zone_lat' / 'target_zone_lng'),
// mais cet écran ignorait cette info et retombait toujours sur ECO_QUESTS[0].
// On lit maintenant cette zone en priorité au chargement.
const getInitialTarget = () => {
  const storedLat = parseFloat(localStorage.getItem('target_zone_lat') || '');
  const storedLng = parseFloat(localStorage.getItem('target_zone_lng') || '');
  const storedName = localStorage.getItem('target_zone_name');

  if (!isNaN(storedLat) && !isNaN(storedLng) && storedName) {
    const matchingQuest = ECO_QUESTS.find((q) => q.name === storedName);
    return {
      id: matchingQuest?.id || 'custom',
      name: storedName,
      lat: storedLat,
      lng: storedLng
    };
  }
  return ECO_QUESTS[0];
};

const MapZone: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ trail?: Trail }>();
  const passedTrail = location.state?.trail;

  const initialTarget = getInitialTarget();

  const [zoneName, setZoneName] = useState<string>(initialTarget.name);
  const [targetLat, setTargetLat] = useState<number>(initialTarget.lat); 
  const [targetLng, setTargetLng] = useState<number>(initialTarget.lng);
  const [activeQuestId, setActiveQuestId] = useState<string>(initialTarget.id);

  // Mode "vrai sentier" : activé quand on arrive depuis TrailDetails avec un
  // sentier de l'API. Dans ce mode on cache le sélecteur de zones fitness et
  // on affiche plutôt les infos du sentier + une estimation de terrain.
  const [activeTrail, setActiveTrail] = useState<Trail | null>(passedTrail || null);
  
  const [distance, setDistance] = useState<string>('Calibrating...');
  const [estimatedSteps, setEstimatedSteps] = useState<number>(0); 
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0); 

  // Recherche d'un point de départ simulé (pratique pour la démo, quand tu
  // n'es pas physiquement sur le sentier). Une fois un lieu choisi, le suivi
  // GPS en direct est coupé pour ne pas écraser la position simulée.
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const targetMarker = useRef<L.Marker | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null); 
  const watchIdRef = useRef<string | null>(null);
  const hasCenteredInitially = useRef<boolean>(false);

  // Si on arrive avec un sentier réel (depuis TrailDetails), on prend le
  // dessus sur la zone fitness par défaut.
  useEffect(() => {
    if (passedTrail) {
      const hasRealCoords = passedTrail.latitude != null && passedTrail.longitude != null;
      const coords = hasRealCoords
        ? { lat: Number(passedTrail.latitude), lng: Number(passedTrail.longitude) }
        : DEFAULT_TRAIL_COORDS;

      setActiveTrail(passedTrail);
      setZoneName(passedTrail.trail_name);
      setTargetLat(coords.lat);
      setTargetLng(coords.lng);
      setActiveQuestId('trail');

      localStorage.setItem('target_zone_name', passedTrail.trail_name);
      localStorage.setItem('target_zone_lat', coords.lat.toString());
      localStorage.setItem('target_zone_lng', coords.lng.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  DYNAMIQUE  QUEST SELECTION (flow Eco Missions / Battle)
  const selectQuest = (quest: any) => {
    setActiveTrail(null);
    setZoneName(quest.name);
    setTargetLat(quest.lat);
    setTargetLng(quest.lng);
    setActiveQuestId(quest.id);

    // Active quest
    localStorage.setItem('current_quest_id', quest.id);
    localStorage.setItem('current_quest_name', quest.name);
    localStorage.setItem('current_quest_monster', quest.monster);
    localStorage.setItem('target_zone_name', quest.name);
    localStorage.setItem('target_zone_lat', quest.lat.toString());
    localStorage.setItem('target_zone_lng', quest.lng.toString());
    
   
    localStorage.setItem('current_quest_gps_verified', 'true'); 

    // Change the marker place when available
    if (leafletMap.current && targetMarker.current) {
      targetMarker.current.setLatLng([quest.lat, quest.lng]);
      
      // Calculate the position
      if (userMarker.current) {
        const userPos = userMarker.current.getLatLng();
        updateRouteAlongRoads(userPos.lat, userPos.lng, quest.lat, quest.lng);
        
        const bounds = L.latLngBounds([[userPos.lat, userPos.lng], [quest.lat, quest.lng]]);
        leafletMap.current.fitBounds(bounds, { padding: [45, 45] });
      } else {
        leafletMap.current.setView([quest.lat, quest.lng], 14);
      }
    }
  };

  const calculateStraightLineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const processDistanceMetrics = (meters: number) => {
    setDistance(`${meters.toFixed(0)} meters`);
    const steps = Math.round(meters / 0.75);
    const kcal = parseFloat((steps * 0.045).toFixed(1));
    setEstimatedSteps(steps);
    setCaloriesBurned(kcal);

    // Persisté pour que Profile.tsx affiche les vraies kcal/pas de cette marche
    localStorage.setItem('hike_steps_estimated', steps.toString());
    localStorage.setItem('hike_calories_burned', kcal.toString());
  };

  // Longitude and Latitude
  const updateRouteAlongRoads = async (userLat: number, userLng: number, tLat = targetLat, tLng = targetLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${userLng},${userLat};${tLng},${tLat}?overview=full&geometries=geojson`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        const leafletCoords: [number, number][] = coordinates.map((coord: number[]) => [coord[1], coord[0]]);

        if (routeLine.current) {
          routeLine.current.setLatLngs(leafletCoords);
        } else {
          routeLine.current = L.polyline(leafletCoords, {
            color: 'var(--neon-cyan)',
            weight: 5,
            opacity: 0.8,
            dashArray: '5, 10'
          }).addTo(leafletMap.current!);
        }

        const roadDistance = data.routes[0].distance; 
        processDistanceMetrics(roadDistance);
      } else {
        throw new Error("No route found");
      }
    } catch (error) {
      console.warn("Routing API failure, falling back to straight line.");
      const straightMeters = calculateStraightLineDistance(userLat, userLng, tLat, tLng);
      processDistanceMetrics(straightMeters);

      const straightCoords: [number, number][] = [[userLat, userLng], [tLat, tLng]];
      if (routeLine.current) {
        routeLine.current.setLatLngs(straightCoords);
      } else if (leafletMap.current) {
        routeLine.current = L.polyline(straightCoords, {
          color: 'var(--neon-magenta)',
          weight: 4,
          opacity: 0.6,
          dashArray: '5, 5'
        }).addTo(leafletMap.current);
      }
    }
  };

  const forceRecenter = async () => {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const myLat = pos.coords.latitude;
      const myLng = pos.coords.longitude;
      setIsSimulated(false);

      if (leafletMap.current) {
        leafletMap.current.setView([myLat, myLng], 16);
        leafletMap.current.invalidateSize();

        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `<div style="background: var(--neon-cyan); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px var(--neon-cyan);"></div>`,
          iconSize: [20, 20]
        });

        if (userMarker.current) {
          userMarker.current.setLatLng([myLat, myLng]);
        } else {
          userMarker.current = L.marker([myLat, myLng], { icon: userIcon }).addTo(leafletMap.current);
        }

        updateRouteAlongRoads(myLat, myLng);
      }
    } catch (e) {
      alert("Unable to access GPS.");
    }
  };

  // Recherche un lieu via Nominatim (OpenStreetMap) — gratuit, sans clé API
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=mu`;
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.warn('Location search failed', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Place le point de départ simulé choisi par la recherche, et coupe le
  // suivi GPS en direct pour qu'il n'écrase pas cette position.
  const selectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const myLat = parseFloat(result.lat);
    const myLng = parseFloat(result.lon);

    if (watchIdRef.current) {
      Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }

    setIsSimulated(true);
    setSearchResults([]);
    setSearchTerm('');

    if (leafletMap.current) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div style="background: var(--neon-cyan); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px var(--neon-cyan);"></div>`,
        iconSize: [20, 20]
      });

      if (userMarker.current) {
        userMarker.current.setLatLng([myLat, myLng]);
      } else {
        userMarker.current = L.marker([myLat, myLng], { icon: userIcon }).addTo(leafletMap.current);
      }

      updateRouteAlongRoads(myLat, myLng);

      const bounds = L.latLngBounds([[myLat, myLng], [targetLat, targetLng]]);
      leafletMap.current.fitBounds(bounds, { padding: [45, 45] });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initTimeout = setTimeout(() => {
      if (mapRef.current && !leafletMap.current && isMounted) {
        leafletMap.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([targetLat, targetLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);

        const customIcon = L.divIcon({
          className: 'cyber-marker',
          html: `<div style="background: var(--neon-magenta); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px var(--neon-magenta); cursor: pointer;"></div>`,
          iconSize: [20, 20]
        });

        targetMarker.current = L.marker([targetLat, targetLng], { icon: customIcon })
          .addTo(leafletMap.current)
          .on('click', () => {
            history.push('/battle');
          });

        setTimeout(() => {
          if (leafletMap.current && isMounted) {
            leafletMap.current.invalidateSize();
          }
        }, 250);
      }
    }, 100);

    const startTracking = async () => {
      try {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') return;

        const initialPos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        if (initialPos && leafletMap.current && isMounted) {
          const initLat = initialPos.coords.latitude;
          const initLng = initialPos.coords.longitude;
          
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<div style="background: var(--neon-cyan); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px var(--neon-cyan);"></div>`,
            iconSize: [20, 20]
          });

          userMarker.current = L.marker([initLat, initLng], { icon: userIcon }).addTo(leafletMap.current);
          updateRouteAlongRoads(initLat, initLng);

          const bounds = L.latLngBounds([[initLat, initLng], [targetLat, targetLng]]);
          leafletMap.current.fitBounds(bounds, { padding: [45, 45] });
          hasCenteredInitially.current = true;
        }

        watchIdRef.current = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 8000
        }, (position, err) => {
          if (err || !position || !isMounted) return;

          const myLat = position.coords.latitude;
          const myLng = position.coords.longitude;

          if (leafletMap.current) {
            if (userMarker.current) {
              userMarker.current.setLatLng([myLat, myLng]);
            } else {
              const userIcon = L.divIcon({
                className: 'user-marker',
                html: `<div style="background: var(--neon-cyan); width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px var(--neon-cyan);"></div>`,
                iconSize: [20, 20]
              });
              userMarker.current = L.marker([myLat, myLng], { icon: userIcon }).addTo(leafletMap.current);
            }

            updateRouteAlongRoads(myLat, myLng);

            if (!hasCenteredInitially.current) {
              const bounds = L.latLngBounds([[myLat, myLng], [targetLat, targetLng]]);
              leafletMap.current.fitBounds(bounds, { padding: [45, 45] });
              hasCenteredInitially.current = true;
            }
          }
        });
      } catch (e) {
        console.error("Error setting up tracking loop", e);
      }
    };

    startTracking();

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
      }
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [targetLat, targetLng, history]);

  useIonViewWillLeave(() => {
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }
  });

  const terrain = activeTrail ? getTerrainEstimate(activeTrail.difficulty) : null;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', padding: '4px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div slot="start" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '14px' }}>FQ</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>FITQUEST</span>
          </div>
          <IonAvatar slot="end" style={{ width: '36px', height: '36px', border: '2px solid var(--neon-cyan)' }}>
            <img alt="User" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
          </IonAvatar>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding" scrollY={true}>
        {/*  METRICS SECTOR CARD */}
        <IonCard className="cyber-card" style={{ borderLeft: '4px solid var(--neon-cyan)', margin: '0px 0 12px 0' }}>
          <IonCardContent style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IonIcon icon={locationOutline} style={{ color: 'var(--neon-cyan)', fontSize: '24px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                {activeTrail ? 'SELECTED TRAIL' : 'TARGET SECTOR LOCK'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{zoneName}</div>
              {activeTrail && (activeTrail.latitude == null || activeTrail.longitude == null) && (
                <div style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '2px' }}>
                  ⚠️ No coordinates set for this trail — showing an approximate position
                </div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Road Dist: <span style={{ color: 'var(--neon-magenta)', fontWeight: 'bold' }}>{distance}</span>
              </div>
            </div>
            
            {estimatedSteps > 0 && (
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px', minWidth: '65px' }}>
                <IonIcon icon={walkOutline} style={{ color: 'var(--success)', fontSize: '18px' }} />
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{estimatedSteps}</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>STEPS</div>
              </div>
            )}

            {caloriesBurned > 0 && (
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px', minWidth: '65px' }}>
                <IonIcon icon={flameOutline} style={{ color: 'var(--neon-magenta)', fontSize: '18px' }} />
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{caloriesBurned}</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>KCAL</div>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* PROFIL DE TERRAIN — visible uniquement quand on arrive depuis un vrai sentier */}
        {activeTrail && terrain && (
          <IonCard className="cyber-card" style={{ borderLeft: '4px solid var(--warning)', margin: '0 0 12px 0' }}>
            <IonCardContent style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IonIcon icon={terrain.icon} style={{ color: 'var(--warning)', fontSize: '22px' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 'bold' }}>TERRAIN PROFILE (estimate)</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{terrain.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Based on difficulty "{activeTrail.difficulty}" — actual elevation not provided by the API
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* SÉLECTEUR DE ZONES FITNESS — masqué quand on arrive depuis un vrai sentier */}
        {!activeTrail && (
          <>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 'bold', margin: '10px 5px' }}>CHOOSE ECO-ZONE MATRIX</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              {ECO_QUESTS.map((quest) => (
                <div 
                  key={quest.id} 
                  onClick={() => selectQuest(quest)}
                  style={{ 
                    background: 'var(--bg-surface)', 
                    border: activeQuestId === quest.id ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 'bold' }}>{quest.name}</div>
                    <div style={{ color: 'var(--neon-magenta)', fontSize: '11px', marginTop: '2px' }}>Anomaly: {quest.monster}</div>
                  </div>
                  {activeQuestId === quest.id && <span style={{ color: 'var(--neon-cyan)', fontSize: '10px', fontWeight: 'bold' }}>ACTIVE</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* RECHERCHE D'UN POINT DE DÉPART (utile pour simuler la démo) */}
        <IonCard className="cyber-card" style={{ margin: '0 0 12px 0' }}>
          <IonCardContent style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <IonIcon icon={searchOutline} style={{ color: 'var(--neon-cyan)', fontSize: '16px' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Search a starting point
              </span>
              {isSimulated && (
                <span style={{ fontSize: '10px', color: 'var(--warning)', marginLeft: 'auto' }}>SIMULATED</span>
              )}
            </div>
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value || '')}
              onIonChange={(e) => handleSearch(e.detail.value || '')}
              placeholder="e.g. Quatre Bornes, Curepipe..."
              debounce={500}
              style={{ '--background': 'var(--bg-surface-alt)', '--color': 'var(--text-primary)', padding: '0' }}
            />
            {isSearching && (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <IonSpinner name="dots" style={{ '--color': 'var(--neon-cyan)' }} />
              </div>
            )}
            {searchResults.length > 0 && (
              <IonList style={{ background: 'transparent' }}>
                {searchResults.map((result, idx) => (
                  <IonItem
                    key={idx}
                    button
                    onClick={() => selectSearchResult(result)}
                    style={{ '--background': 'var(--bg-surface)', '--border-color': 'var(--border-subtle)', borderRadius: '10px', margin: '4px 0' }}
                    lines="none"
                  >
                    <IonIcon icon={navigateOutline} slot="start" style={{ color: 'var(--neon-cyan)', fontSize: '16px' }} />
                    <IonLabel style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      {result.display_name}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        {/* CONTENEUR CARTE MAP */}
        <div style={{ width: '100%', height: '380px', position: 'relative' }}>
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '16px', 
              border: '1px solid var(--border-subtle)', 
              backgroundColor: 'var(--bg-surface)',
              position: 'relative',
              display: 'block'
            }} 
          />

          <IonButton
            onClick={forceRecenter}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1000,
              '--background': 'rgba(255, 255, 255, 0.85)',
              '--border-color': 'var(--neon-cyan)',
              '--border-style': 'solid',
              '--border-width': '1px',
              '--color': 'var(--neon-cyan)',
              '--padding-start': '0',
              '--padding-end': '0',
              width: '40px',
              height: '40px'
            }}
            fill="clear"
          >
            <IonIcon icon={locateOutline} style={{ fontSize: '20px' }} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapZone;
