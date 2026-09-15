import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonIcon, IonProgressBar, useIonViewWillEnter } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { flashOutline, shieldOutline, flameOutline, trophyOutline, giftOutline, hardwareChipOutline, paperPlaneOutline, checkmarkCircleOutline, fitnessOutline, alertCircleOutline, skullOutline } from 'ionicons/icons';
import { getProtocol } from '../data/protocols';

const Battle: React.FC = () => {
  const [monsterHP, setMonsterHP] = useState<number>(100);
  const [motionLog, setMotionLog] = useState<string>("Awaiting telemetry...");
  const [battleOutput, setBattleOutput] = useState<string>("Execute movement protocols.");
  const [isDead, setIsDead] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [targetReps, setTargetReps] = useState<number>(15);
  const [outputIcon, setOutputIcon] = useState<string>(paperPlaneOutline);
  const [activeProtocol, setActiveProtocol] = useState<string>('quest_jump');
  const [monsterName, setMonsterName] = useState<string>('LEVEL 1: SMOG MONSTER');

  const isReadyToTrigger = useRef<boolean>(true);
  
  //   DeviceMotion to avoid closure problem
  const stateRef = useRef({ repCount, targetReps, monsterHP, isDead, activeProtocol });

  // every re-render for the EventListener to have true value
  useEffect(() => {
    stateRef.current = { repCount, targetReps, monsterHP, isDead, activeProtocol };
  }, [repCount, targetReps, monsterHP, isDead, activeProtocol]);

  useIonViewWillEnter(() => {
    const protocol = localStorage.getItem('active_motion_protocol') || 'quest_jump';
    setActiveProtocol(protocol);

    const protocolData = getProtocol(protocol);
    setMonsterName(protocolData.monsterName);
    const tReps = protocolData.targetReps;
    setTargetReps(tReps);

    const savedReps = parseInt(localStorage.getItem(`quest_reps_${protocol}`) || '0', 10);
    const hp = parseInt(localStorage.getItem(`quest_hp_${protocol}`) || '100', 10);
    
    setRepCount(savedReps);
    setMonsterHP(hp);
    setIsDead(hp <= 0);
    setRewardClaimed(localStorage.getItem(`reward_claimed_${protocol}`) === 'true');
    setOutputIcon(alertCircleOutline);

    // First load
    stateRef.current = { repCount: savedReps, targetReps: tReps, monsterHP: hp, isDead: hp <= 0, activeProtocol: protocol };
  });

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      // securised statement
      const { isDead: currentDead, activeProtocol: currentProtocol } = stateRef.current;

      const accel = event.accelerationIncludingGravity;
      if (!accel || currentDead || !isReadyToTrigger.current) return;
      
      const x = accel.x || 0; 
      const y = accel.y || 0; 
      const z = accel.z || 0;
      setMotionLog(`X: ${x.toFixed(1)} | Y: ${y.toFixed(1)} | Z: ${z.toFixed(1)}`);

      if (currentProtocol === 'quest_jump' && Math.abs(y) > 16) {
        processValidRepetition("JUMP VALIDATED", flashOutline);
      } else if (currentProtocol === 'quest_squat' && Math.abs(z) > 14) {
        processValidRepetition("SQUAT VALIDATED", shieldOutline);
      } else if (currentProtocol === 'quest_burpee' && (Math.abs(y) > 16 || Math.abs(z) > 14)) {
        processValidRepetition("BURPEE VALIDATED", flameOutline);
      } else if (currentProtocol === 'quest_dash' && Math.abs(x) > 15) {
        processValidRepetition("DASH VALIDATED", trophyOutline);
      } else if (currentProtocol === 'quest_cardio' && Math.abs(y) > 15) {
        processValidRepetition("JACK VALIDATED", fitnessOutline);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []); 

  const processValidRepetition = async (msg: string, icon: string) => {
    isReadyToTrigger.current = false;
    setTimeout(() => { isReadyToTrigger.current = true; }, 1200);
    
    setOutputIcon(icon);

    // Double security for the Haptic feature
    try {
      await Haptics.vibrate({ duration: 150 }); // Vibre during 150 ms
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      console.warn("Haptics failed to trigger", e);
    }

    // Return value
    const { repCount: currentReps, targetReps: currentTarget, activeProtocol: currentProto } = stateRef.current;

    const nextReps = currentReps + 1;
    setRepCount(nextReps);
    const damage = 100 / currentTarget;
    
    setMonsterHP((prev) => {
      const nextHP = Math.max(0, Math.round(prev - damage));
      localStorage.setItem(`quest_hp_${currentProto}`, nextHP.toString());
      localStorage.setItem(`quest_reps_${currentProto}`, nextReps.toString());
      
      // Validation of the home global state
      localStorage.setItem('current_quest_battle_won', nextReps >= currentTarget || nextHP === 0 ? 'true' : 'false');
      
      if (nextReps >= currentTarget || nextHP === 0) {
        setIsDead(true);
        setBattleOutput("TARGET NEUTRALIZED");
        return 0;
      }
      setBattleOutput(`${msg} (${nextReps}/${currentTarget})`);
      return nextHP;
    });
  };

  const handleManualClick = (type: string, icon: string) => {
    if (isDead) return;
    processValidRepetition(`Manual ${type} Simulation`, icon);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: '800' }}>Battle Matrix</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent style={{ '--background': 'var(--bg-deep)', 'background': 'var(--bg-deep)', 'opacity': '1' }} className="ion-padding" scrollY={true}>
        
        <div className="field-data" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)', fontSize: '11px', marginBottom: '10px' }}>
          <IonIcon icon={hardwareChipOutline} /> MATRIX: {motionLog}
        </div>

        <IonCard className="cyber-card" style={{ textAlign: 'center', padding: '20px', margin: '0 0 15px 0' }}>
          <IonIcon icon={skullOutline} style={{ fontSize: '70px', color: isDead ? 'var(--text-faint)' : 'var(--neon-magenta)' }} />
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginTop: '10px' }}>{isDead ? "ZONE PURIFIED" : monsterName}</h2>
          <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
            <IonIcon icon={fitnessOutline} /> {repCount} / {targetReps}
          </div>
          <div style={{ padding: '0 10px', marginTop: '15px' }}>
            <IonProgressBar color="danger" value={monsterHP / 100} style={{ height: '8px', borderRadius: '4px' }} />
          </div>
        </IonCard>

        <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
          <IonButton expand="block" fill="outline" onClick={() => handleManualClick("Motion", flashOutline)} disabled={isDead} style={{ flex: 1, '--color': 'var(--neon-cyan)', '--border-color': 'var(--neon-cyan)' }}>
            <IonIcon icon={flashOutline} slot="start" /> SIMULATE REP
          </IonButton>
        </div>

        <div className="cyber-card field-data" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <IonIcon icon={outputIcon} style={{ color: 'var(--neon-cyan)', fontSize: '16px' }} />
          <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>&gt; {battleOutput}</span>
        </div>

        {isDead && !rewardClaimed ? (
          <IonButton expand="block" onClick={() => {
            const protocolData = getProtocol(activeProtocol);
            localStorage.setItem(`reward_claimed_${activeProtocol}`, 'true');
            localStorage.setItem(`xp_earned_${activeProtocol}`, protocolData.xp.toString());
            localStorage.setItem(`kcal_earned_${activeProtocol}`, protocolData.kcalEstimate.toString());
            setRewardClaimed(true);
          }} style={{ '--background': 'var(--success)', '--color': 'var(--text-primary)', fontWeight: 'bold' }}>
            <IonIcon icon={giftOutline} slot="start" /> CLAIM REWARD
          </IonButton>
        ) : isDead && (
          <IonButton routerLink="/scan" expand="block" style={{ '--background': 'var(--neon-cyan)', '--color': 'var(--text-primary)', fontWeight: 'bold' }}>
            <IonIcon icon={trophyOutline} slot="start" /> SCAN CHECKPOINT
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Battle;
