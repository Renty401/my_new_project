import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonCard,
  IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
  IonLabel, IonProgressBar, IonIcon, IonButton, IonAvatar
} from '@ionic/react';
import { useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  lockClosed, lockOpen, refreshOutline, rocketOutline, compassOutline,
  leafOutline, flashOutline, cameraOutline
} from 'ionicons/icons';

const Home: React.FC = () => {
  const history = useHistory();
  const [gpsDone, setGpsDone] = useState<boolean>(false);
  const [battleDone, setBattleDone] = useState<boolean>(false);
  const [photoDone, setPhotoDone] = useState<boolean>(false);

  const handleGlobalReset = () => {
    localStorage.clear();
    // window.location.reload() n'est pas fiable dans la WebView native
    // d'Android/Capacitor — on remet directement l'état React à zéro à la place.
    setGpsDone(false);
    setBattleDone(false);
    setPhotoDone(false);
  };

  useIonViewWillEnter(() => {
    let anyGpsVerified = false;
    let anyBattleWon = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);

        if ((key.startsWith('quest_gps_') || key.includes('gps') || key.includes('zone_verified')) && value === 'true') {
          anyGpsVerified = true;
        }

        if (
          (key.startsWith('quest_battle_won') && value === 'true') ||
          (key.startsWith('reward_claimed_') && value === 'true') ||
          (key.startsWith('quest_hp_') && value === '0') ||
          (key.includes('monster_dead') && value === 'true')
        ) {
          anyBattleWon = true;
        }
      }
    }

    if (localStorage.getItem('current_quest_gps_verified') === 'true') anyGpsVerified = true;
    if (localStorage.getItem('current_quest_battle_won') === 'true') anyBattleWon = true;

    setGpsDone(anyGpsVerified);
    setBattleDone(anyBattleWon);
    setPhotoDone(localStorage.getItem('quest_photo_uploaded') === 'true');
  });

  const xpGained = (gpsDone ? 30 : 0) + (battleDone ? 40 : 0) + (photoDone ? 30 : 0);

  // Tampons de passeport — chaque mission accomplie débloque un stamp
  const stamps = [
    { done: gpsDone, icon: leafOutline, label: 'Eco-Zone' },
    { done: battleDone, icon: flashOutline, label: 'Challenge' },
    { done: photoDone, icon: cameraOutline, label: 'Photo Proof' }
  ];

  const nextFeat = stamps.find(s => !s.done);
  const missionOfDay = nextFeat ? nextFeat.label : 'Journal complete — explore a new trail';

  const goToTrails = () => {
    history.push('/trails');
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{
          '--background': 'var(--bg-deep)',
          padding: '4px 12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div slot="start" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}>
              FQ
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '16px',
              letterSpacing: '0.5px',
              color: 'var(--text-primary)'
            }}>
              FITQUEST
            </span>
          </div>

          <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IonButton
              fill="clear"
              onClick={handleGlobalReset}
              title="Reset Progress"
              style={{ margin: 0, '--color': 'var(--text-muted)' }}
            >
              <IonIcon icon={refreshOutline} slot="icon-only" style={{ fontSize: '20px' }} />
            </IonButton>

            <IonAvatar style={{
              width: '34px',
              height: '34px',
              border: '2px solid var(--neon-cyan)'
            }}>
              <img alt="User Profile" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
            </IonAvatar>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">

        {/* PROGRESS CIRCLE */}
        <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
          <IonLabel style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
            PROGRESS
          </IonLabel>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            border: `4px solid ${xpGained > 0 ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`, margin: '10px auto',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', background: 'var(--bg-surface)'
          }}>
            <span className="field-data" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {xpGained}%
            </span>
          </div>
        </div>

        {/* MISSION OF THE DAY */}
        <IonCard className="cyber-card" style={{ margin: '0 0 20px 0' }}>
          <IonCardHeader style={{ paddingBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={compassOutline} style={{ color: 'var(--neon-cyan)', fontSize: '18px' }} />
              <IonCardSubtitle style={{ color: 'var(--neon-cyan)', letterSpacing: '1px', fontSize: '11px', fontWeight: 'bold' }}>
                MISSION OF THE DAY
              </IonCardSubtitle>
            </div>
            <IonCardTitle style={{ fontSize: '16px', color: 'var(--text-primary)', marginTop: '6px' }}>
              {missionOfDay}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ paddingTop: '4px' }}>
            <IonButton
              expand="block"
              onClick={goToTrails}
              style={{
                '--background': 'var(--neon-magenta)',
                '--color': 'var(--text-primary)',
                fontWeight: 'bold'
              }}
            >
              <IonIcon icon={rocketOutline} slot="start" />
              Start Adventure
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* JOURNEY MAP */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
          {[
            { lvl: 1, name: 'Novice', req: 0 },
            { lvl: 2, name: 'Warrior', req: 50 },
            { lvl: 3, name: 'Guardian', req: 100 }
          ].map((item) => {
            const isUnlocked = xpGained >= item.req;
            return (
              <div
                key={item.lvl}
                style={{
                  flex: 1,
                  background: isUnlocked ? 'var(--bg-surface-alt)' : 'var(--bg-surface)',
                  border: isUnlocked ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '10px 6px',
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.5,
                  position: 'relative'
                }}
              >
                <IonIcon
                  icon={isUnlocked ? lockOpen : lockClosed}
                  style={{ position: 'absolute', top: '6px', right: '6px', color: isUnlocked ? 'var(--neon-cyan)' : 'var(--text-faint)', fontSize: '11px' }}
                />
                <div className="field-data" style={{ fontSize: '10px', color: isUnlocked ? 'var(--neon-cyan)' : 'var(--text-faint)' }}>
                  LVL 0{item.lvl}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '3px 0' }}>
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* PROGRESS BAR */}
        <IonCard className="cyber-card" style={{ margin: '0 0 25px 0' }}>
          <IonCardContent style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>XP</span>
              <span className="field-data" style={{ color: 'var(--neon-cyan)' }}>{xpGained} / 100</span>
            </div>
            <IonProgressBar
              value={xpGained / 100}
              style={{ height: '8px', borderRadius: '5px', '--progress-background': 'var(--neon-magenta)' }}
            />
          </IonCardContent>
        </IonCard>

        {/* STAMPS — remplace l'ancienne liste de texte */}
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 5px 12px 5px', letterSpacing: '0.5px' }}>
          Passport
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          {stamps.map((stamp, index) => (
            <div key={index} className={`trail-stamp ${stamp.done ? '' : 'locked'}`}>
              <IonIcon icon={stamp.icon} className="stamp-icon" />
              <div className="stamp-label">{stamp.label}</div>
            </div>
          ))}
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Home;
