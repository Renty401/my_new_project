import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAvatar,
  IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonProgressBar,
  IonBadge, IonIcon, IonButton, useIonViewWillEnter
} from '@ionic/react';
import { 
  trophyOutline, flameOutline, walkOutline, shieldCheckmarkOutline, 
  lockClosedOutline, medalOutline, cameraOutline, gridOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PROTOCOLS } from '../data/protocols';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

const Profile: React.FC = () => {
  // DYNAMIC DASHBOARD
  const [username, setUsername] = useState<string>('Renty_CyberQuest');
  const [level, setLevel] = useState<number>(1);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [nextLevelXp] = useState<number>(100); // Aligné sur le total de 100 XP de la Home
  
  const [totalQuests, setTotalQuests] = useState<number>(0);
  const [totalKcal, setTotalKcal] = useState<number>(0);

  // GALERIE PHOTO
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);

  //  SUCCESS
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  
  useEffect(() => {
    const saved = localStorage.getItem('saved_evidence_photos');
    if (saved) {
      try {
        setEvidencePhotos(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur lors du parse des photos", e);
      }
    }
  }, []);

 
  useIonViewWillEnter(() => {
    
    const gpsDone = localStorage.getItem('current_quest_gps_verified') === 'true';
    const photoDone = localStorage.getItem('quest_photo_uploaded') === 'true';
    
    // Somme le XP/kcal RÉEL de chaque protocole physique effectivement complété
    // (au lieu d'une valeur fixe +40/+180 peu importe la mission choisie)
    let battleDone = false;
    let battleXp = 0;
    let battleKcal = 0;
    PROTOCOLS.forEach((protocol) => {
      if (localStorage.getItem(`reward_claimed_${protocol.id}`) === 'true') {
        battleDone = true;
        battleXp += Number(localStorage.getItem(`xp_earned_${protocol.id}`) || protocol.xp);
        battleKcal += Number(localStorage.getItem(`kcal_earned_${protocol.id}`) || protocol.kcalEstimate);
      }
    });
    // Repli sur l'ancien indicateur générique, au cas où une session précédente
    // aurait été complétée avant l'ajout de ce suivi détaillé par protocole
    if (!battleDone && localStorage.getItem('current_quest_battle_won') === 'true') {
      battleDone = true;
    }

    //  XP calculation — basé sur ce qui a réellement été accompli
    const calculatedXp = Math.min(
      (gpsDone ? 30 : 0) + battleXp + (photoDone ? 30 : 0),
      100
    );
    setCurrentXp(calculatedXp);

    
    if (calculatedXp >= 100) {
      setLevel(3); // Guardian Rank
    } else if (calculatedXp >= 30) {
      setLevel(2); // Warrior Rank
    } else {
      setLevel(1); // Novice Rank
    }

    // Quests count completed
    let completedCount = 0;
    if (gpsDone) completedCount++;
    if (battleDone) completedCount++;
    if (photoDone) completedCount++;
    setTotalQuests(completedCount);

    // Kcal calculation — vraies kcal de la marche (MapZone) + vraies kcal du défi physique (Battle)
    const hikeKcal = Number(localStorage.getItem('hike_calories_burned') || 0);
    setTotalKcal(parseFloat((battleKcal + hikeKcal).toFixed(1)));

    
    setAchievements([
      {
        id: 'first_step',
        title: 'First Matrix Step',
        description: 'Synchronized your GPS in an eco-zone for the first time.',
        icon: walkOutline,
        unlocked: gpsDone,
        color: '#2f9e44'
      },
      {
        id: 'calorie_burner',
        title: 'Fat Burner I',
        description: 'Engaged the battle matrix and burned tactical calories.',
        icon: flameOutline,
        unlocked: battleDone,
        color: '#ff6f59'
      },
      {
        id: 'guardian',
        title: 'Eco Guardian',
        description: 'Submitted physical photo evidence to safeguard the botanical matrix.',
        icon: shieldCheckmarkOutline,
        unlocked: photoDone,
        color: '#17a398'
      }
    ]);
  });

  // Camera activation
  const takeMissionPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        const updatedPhotos = [image.webPath!, ...evidencePhotos];
        setEvidencePhotos(updatedPhotos);
        
        localStorage.setItem('quest_photo_uploaded', 'true');
        localStorage.setItem('saved_evidence_photos', JSON.stringify(updatedPhotos));

        
        window.dispatchEvent(new Event('resize')); 
        
        setTotalQuests((prev) => prev + 1);
        setCurrentXp((prev) => Math.min(prev + 30, 100));
      }
    } catch (error) {
      console.log("Camera access dismissed or failed", error);
    }
  };

  const xpProgress = currentXp / nextLevelXp;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', padding: '4px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div slot="start" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '14px' }}>FQ</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>FITQUEST</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
        
        {/* SECTION PROFILE CARD & LEVEL STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px', marginBottom: '20px' }}>
          <IonAvatar style={{ 
            width: '90px', 
            height: '90px', 
            border: '3px solid var(--neon-cyan)', 
            marginBottom: '10px'
          }}>
            <img alt="User Avatar" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
          </IonAvatar>

          <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', margin: '0', letterSpacing: '0.5px' }}>{username}</h2>
          
          <IonBadge style={{ 
            marginTop: '6px', 
            '--background': 'linear-gradient(135deg, var(--success), var(--neon-cyan))', 
            color: 'var(--text-primary)', 
            fontWeight: 'bold',
            padding: '5px 12px',
            borderRadius: '12px'
          }}>
            LEVEL {level} UNLOCKED
          </IonBadge>
        </div>

        {/* METRIC EXPERIENCE (PROGRESS BAR INTERCONNECTÉE) */}
        <IonCard className="cyber-card" style={{ margin: '0 0 20px 0' }}>
          <IonCardContent style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>METRIC EXPERIENCE (XP)</span>
              <span className="field-data" style={{ color: 'var(--text-primary)' }}>{currentXp} / {nextLevelXp} XP</span>
            </div>
            <IonProgressBar 
              value={xpProgress} 
              style={{ 
                '--progress-background': 'var(--neon-cyan)', 
                '--background': 'var(--border-subtle)',
                height: '8px',
                borderRadius: '4px'
              }} 
            />
          </IonCardContent>
        </IonCard>

        {/* QUICK STATISTICS CONTROLLER DYNAMIQUE */}
        <IonGrid style={{ padding: '0', marginBottom: '20px' }}>
          <IonRow>
            <IonCol size="6" style={{ padding: '0 6px 0 0' }}>
              <div className="cyber-card" style={{ padding: '12px', textAlign: 'center' }}>
                <IonIcon icon={medalOutline} style={{ color: 'var(--neon-magenta)', fontSize: '20px' }} />
                <div className="field-data" style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '4px' }}>{totalQuests}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TASKS CLEARED</div>
              </div>
            </IonCol>
            <IonCol size="6" style={{ padding: '0 0 0 6px' }}>
              <div className="cyber-card" style={{ padding: '12px', textAlign: 'center' }}>
                <IonIcon icon={flameOutline} style={{ color: 'var(--neon-magenta)', fontSize: '20px' }} />
                <div className="field-data" style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '4px' }}>{totalKcal}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TOTAL KCAL</div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* ACHIEVEMENTS & BADGES SYSTEM DYNAMIQUE */}
        <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px' }}>
          OPERATOR ACHIEVEMENTS ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </h3>

        {achievements.map((ach) => (
          <IonCard 
            key={ach.id} 
            className="cyber-card" 
            style={{ 
              margin: '0 0 10px 0', 
              opacity: ach.unlocked ? 1 : 0.5, 
              borderLeft: ach.unlocked ? `4px solid ${ach.color}` : '4px solid var(--text-faint)'
            }}
          >
            <IonCardContent style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: ach.unlocked ? `${ach.color}22` : 'var(--bg-surface-alt)',
                border: ach.unlocked ? `2px solid ${ach.color}` : '2px solid var(--text-faint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IonIcon 
                  icon={ach.unlocked ? ach.icon : lockClosedOutline} 
                  style={{ color: ach.unlocked ? ach.color : 'var(--text-faint)', fontSize: '22px' }} 
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{ach.title}</span>
                  {ach.unlocked ? (
                    <span style={{ fontSize: '9px', color: ach.color, fontWeight: 'bold', letterSpacing: '0.5px' }}>UNLOCKED</span>
                  ) : (
                    <span style={{ fontSize: '9px', color: 'var(--text-faint)', fontWeight: 'bold' }}>PENDING</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '14px' }}>
                  {ach.description}
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        ))}

        {/* ECO-MISSION PHOTO EVIDENCE GALERIE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={gridOutline} style={{ color: 'var(--neon-cyan)', fontSize: '18px' }} />
            <span className="field-data" style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>ECO-EVIDENCE LOGS</span>
          </div>
          <IonButton size="small" fill="outline" onClick={takeMissionPhoto} style={{ '--color': 'var(--success)', '--border-color': 'var(--success)', fontSize: '11px', margin: '0' }} className="field-data">
            <IonIcon icon={cameraOutline} slot="start" /> LOG PROOF
          </IonButton>
        </div>

        {evidencePhotos.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: '12px', padding: '25px 15px', textAlign: 'center', color: 'var(--text-faint)' }}>
            <IonIcon icon={cameraOutline} style={{ fontSize: '32px', color: 'var(--text-faint)', marginBottom: '6px' }} />
            <div className="field-data" style={{ fontSize: '11px' }}>NO MISSION DATA LOGGED</div>
          </div>
        ) : (
          <IonGrid style={{ padding: '0', marginBottom: '15px' }}>
            <IonRow style={{ margin: '0 -4px' }}>
              {evidencePhotos.map((photo, idx) => (
                <IonCol size="4" key={idx} style={{ padding: '4px' }}>
                  <div style={{ 
                    position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden',
                    border: '1px solid var(--neon-cyan)'
                  }}>
                    <img src={photo} alt={`Evidence ${idx}`} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Profile;
