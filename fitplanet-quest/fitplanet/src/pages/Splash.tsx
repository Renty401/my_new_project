import React from 'react';
import { IonContent, IonPage, IonButton, IonText, useIonRouter } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Splash: React.FC = () => {
  const router = useIonRouter();

  const handleStart = async () => {
    try { 
      
      await Haptics.impact({ style: ImpactStyle.Light }); 
    } catch (e) {}
    
    
    router.push('/home', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonContent 
        style={{ '--background': 'var(--bg-deep)' }}
        scrollY={false}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          padding: '60px 24px',
          boxSizing: 'border-box'
        }}>
          
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1 style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '34px', 
              fontWeight: '700', 
              letterSpacing: '1px', 
              color: 'var(--text-primary)', 
              margin: '0 0 4px 0'
            }}>
              FitPlanet
            </h1>
            <h1 style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '34px', 
              fontWeight: '700', 
              letterSpacing: '1px', 
              color: 'var(--neon-cyan)', 
              margin: '0'
            }}>
              Quest
            </h1>
          </div>

          
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '68px'
          }}>
            🌍
          </div>

          
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
            <IonText>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '15px', 
                fontWeight: '500',
                marginBottom: '26px'
              }}>
                Save the Planet, Save Yourself
              </p>
            </IonText>
            
            <IonButton 
              onClick={handleStart} 
              style={{ 
                width: '100%', 
                '--height': '52px',
                '--background': 'var(--neon-magenta)',
                '--color': 'var(--text-primary)',
                '--border-radius': '14px',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              Let's Get Started
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;
