import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonImg, IonSpinner, IonButton, IonIcon, IonBadge, IonCard, IonCardContent
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { trailSignOutline, timeOutline, alertCircleOutline, rocketOutline, shieldCheckmarkOutline, thermometerOutline, cloudOutline, rainyOutline } from 'ionicons/icons';
import { getTrail, getTrailWeather, Trail, TrailWeather } from '../services/api';

const FALLBACK_IMAGE = 'https://ionicframework.com/docs/img/demos/card-media.png';

const TrailDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [trail, setTrail] = useState<Trail | null>(null);
  const [weather, setWeather] = useState<TrailWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTrail(Number(id));
        setTrail(data);
      } catch (e: any) {
        setError(e.message || 'Unable to load this trail.');
      } finally {
        setLoading(false);
      }

      // La météo est optionnelle — si elle échoue, le reste de la page reste utilisable
      try {
        const weatherData = await getTrailWeather(Number(id));
        setWeather(weatherData);
      } catch (e) {
        console.warn('Weather unavailable for this trail', e);
      }
    })();
  }, [id]);

  const startAdventure = () => {
    if (!trail) return;
    // On passe le sentier choisi à l'écran Map via l'état de navigation
    // (MapZone.tsx peut le récupérer avec useLocation<{ trail: Trail }>().state)
    history.push('/map', { trail });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/trails" style={{ color: 'var(--neon-cyan)' }} />
          </IonButtons>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            TRAIL DETAILS
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }}>
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <IonSpinner name="crescent" style={{ '--color': 'var(--neon-cyan)', width: '40px', height: '40px' }} />
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '0 20px' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '40px', color: 'var(--danger)' }} />
            <div style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '12px 0' }}>{error}</div>
          </div>
        )}

        {!loading && !error && trail && (
          <>
            <IonImg src={trail.image_url || FALLBACK_IMAGE} style={{ height: '220px', objectFit: 'cover' }} />

            <div className="ion-padding">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                  {trail.trail_name}
                </h1>
                <IonBadge style={{ '--background': 'var(--neon-cyan)', '--color': 'var(--text-primary)', fontWeight: 'bold' }}>
                  {trail.difficulty}
                </IonBadge>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{trail.district}</div>

              <IonCard className="cyber-card" style={{ margin: '18px 0' }}>
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }} className="field-data">
                      <IonIcon icon={trailSignOutline} style={{ color: 'var(--neon-cyan)' }} />
                      {trail.distance_km} km
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }} className="field-data">
                      <IonIcon icon={timeOutline} style={{ color: 'var(--neon-cyan)' }} />
                      {trail.estimated_duration}
                    </span>
                  </div>
                  {trail.safety_note && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--warning)', fontSize: '12px' }}>
                      <IonIcon icon={shieldCheckmarkOutline} style={{ marginTop: '2px' }} />
                      <span>{trail.safety_note}</span>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>

              {weather && (
                <IonCard className="cyber-card" style={{ margin: '0 0 18px 0' }}>
                  <IonCardContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <IonIcon icon={cloudOutline} style={{ color: 'var(--neon-cyan)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Current Weather</span>
                    </div>
                    <div style={{ display: 'flex', gap: '18px', marginBottom: '12px' }} className="field-data">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <IonIcon icon={thermometerOutline} style={{ color: 'var(--neon-cyan)' }} />
                        {weather.weather.temperature}°C
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <IonIcon icon={rainyOutline} style={{ color: 'var(--neon-cyan)' }} />
                        {weather.weather.rain_probability}% rain
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {weather.weather.wind_speed} km/h wind
                      </span>
                    </div>

                    {weather.weather.rain_probability < 30 && weather.weather.wind_speed < 25 ? (
                      <div style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 'bold' }}>
                        ✓ Excellent conditions for hiking
                      </div>
                    ) : weather.weather.rain_probability < 60 ? (
                      <div style={{ color: 'var(--warning)', fontSize: '12px', fontWeight: 'bold' }}>
                        ⚠ Caution — some rain is possible
                      </div>
                    ) : (
                      <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 'bold' }}>
                        ⚠ Hiking not recommended due to weather conditions
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              )}

              <IonButton
                expand="block"
                onClick={startAdventure}
                style={{
                  '--background': 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
                  '--color': 'var(--text-primary)',
                  fontWeight: 'bold'
                }}
              >
                <IonIcon icon={rocketOutline} slot="start" />
                Start Hike
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TrailDetails;
