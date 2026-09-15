import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton, IonIcon, useIonRouter } from '@ionic/react';
import { flashOutline, shieldOutline, flameOutline, trophyOutline, mapOutline, fitnessOutline, statsChartOutline, listOutline } from 'ionicons/icons';
import { PROTOCOLS } from '../data/protocols';

const PROTOCOL_ICONS: Record<string, string> = {
  quest_jump: flashOutline,
  quest_squat: shieldOutline,
  quest_burpee: flameOutline,
  quest_dash: trophyOutline,
  quest_cardio: fitnessOutline
};

const Quest: React.FC = () => {
  const router = useIonRouter();

  const handleSelectMission = (missionId: string) => {
    localStorage.setItem('active_motion_protocol', missionId);
    
    if (missionId === 'quest_jump') {
      localStorage.setItem('target_zone_name', 'Balfour Garden Eco-Zone');
      localStorage.setItem('target_zone_lat', '-20.2435');
      localStorage.setItem('target_zone_lng', '57.4764');
    } else if (missionId === 'quest_squat') {
      localStorage.setItem('target_zone_name', 'Sodnac Wellness Matrix');
      localStorage.setItem('target_zone_lat', '-20.2625');
      localStorage.setItem('target_zone_lng', '57.4872');
    } else if (missionId === 'quest_burpee') {
      localStorage.setItem('target_zone_name', 'Trou aux Cerfs Crater Core');
      localStorage.setItem('target_zone_lat', '-20.3186');
      localStorage.setItem('target_zone_lng', '57.5144');
    } else if (missionId === 'quest_dash') {
      localStorage.setItem('target_zone_name', 'Ebene Cyber-Hub Sector');
      localStorage.setItem('target_zone_lat', '-20.2419');
      localStorage.setItem('target_zone_lng', '57.4889');
    } else {
      localStorage.setItem('target_zone_name', 'Port Louis Waterfront Grid');
      localStorage.setItem('target_zone_lat', '-20.1607');
      localStorage.setItem('target_zone_lng', '57.4983');
    }
    
    router.push('/map', 'forward');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Physical Protocols</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <IonIcon icon={statsChartOutline} />
          <span style={{ fontSize: '13px' }}>Select an operational protocol</span>
        </div>

        {/* Access to the custom missions CRUD */}
        <IonButton
          expand="block"
          fill="outline"
          onClick={() => router.push('/my-missions', 'forward')}
          style={{ '--color': 'var(--neon-magenta)', '--border-color': 'var(--neon-magenta)', marginBottom: '20px' }}
        >
          <IonIcon icon={listOutline} slot="start" />
          My Custom Missions
        </IonButton>

        {PROTOCOLS.map((mission) => (
          <IonCard key={mission.id} className="cyber-card" style={{ margin: '0 0 20px 0', borderLeft: `4px solid ${mission.color}`, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img src={mission.image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} alt="" />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '6px', border: `1px solid ${mission.color}`, fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <IonIcon icon={fitnessOutline} /> {mission.xp} XP
              </div>
            </div>

            <IonCardHeader style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IonIcon icon={PROTOCOL_ICONS[mission.id]} style={{ color: mission.color }} />
                <IonCardSubtitle style={{ color: mission.color, fontWeight: 'bold' }}>{mission.type}</IonCardSubtitle>
              </div>
              <IonCardTitle style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{mission.title}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent style={{ padding: '0 14px 14px 14px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
                Approx. {mission.kcalEstimate} kcal · {mission.targetReps} reps target
              </p>
              <IonButton expand="block" onClick={() => handleSelectMission(mission.id)} style={{ '--background': 'transparent', '--border-color': mission.color, '--border-style': 'solid', '--border-width': '1px', '--color': 'var(--text-primary)' }}>
                <IonIcon icon={mapOutline} slot="start" /> LOCK COORDINATES
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Quest;
