import React, { useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonButton, IonIcon, IonInput, IonItem, IonLabel, IonCard, IonCardContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { qrCodeOutline, checkmarkCircleOutline, cameraOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

// Scan caméra natif branché avec @capacitor-mlkit/barcode-scanning.
// Fonctionne sur émulateur/téléphone Android et iOS ; sur le web (ionic serve),
// la caméra native n'est pas disponible, donc on retombe sur la saisie manuelle.

const QRScanner: React.FC = () => {
  const history = useHistory();
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateCheckpoint = (scannedCode: string) => {
    // Logique de validation — adapte selon le format réel de tes QR codes
    // (ex: un ID de checkpoint encodé, à vérifier contre l'API ou juste
    // marquer la mission en cours comme complétée en local)
    if (!scannedCode.trim()) {
      setStatus('error');
      return;
    }

    localStorage.setItem('current_quest_gps_verified', 'true');
    localStorage.setItem(`quest_gps_${scannedCode}`, 'true');
    localStorage.setItem('reward_claimed_' + scannedCode, 'true');

    setStatus('success');
    setTimeout(() => {
      history.push('/profile');
    }, 1200);
  };

  const handleManualSubmit = () => {
    validateCheckpoint(code);
  };

  const handleCameraScan = async () => {
    if (Capacitor.getPlatform() === 'web') {
      setStatus('error');
      return;
    }

    try {
      // Vérifie la permission caméra, la demande si nécessaire
      const { camera } = await BarcodeScanner.checkPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        const requested = await BarcodeScanner.requestPermissions();
        if (requested.camera !== 'granted' && requested.camera !== 'limited') {
          setStatus('error');
          return;
        }
      }

      // Lance le scan natif (ouvre la caméra plein écran, se ferme au scan)
      const { barcodes } = await BarcodeScanner.scan();

      if (barcodes.length > 0 && barcodes[0].rawValue) {
        validateCheckpoint(barcodes[0].rawValue);
      } else {
        setStatus('error');
      }
    } catch (e) {
      console.error('QR scan failed', e);
      setStatus('error');
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/battle" style={{ color: 'var(--neon-cyan)' }} />
          </IonButtons>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            SCAN QR CODE
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
        <div style={{ textAlign: 'center', margin: '20px 0 30px 0' }}>
          <IonIcon icon={qrCodeOutline} style={{ fontSize: '80px', color: 'var(--neon-cyan)' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px' }}>
            Scan the QR code at the checkpoint to validate your mission
          </div>
        </div>

        <IonButton
          expand="block"
          onClick={handleCameraScan}
          style={{ '--background': 'var(--neon-cyan)', '--color': 'var(--text-primary)', fontWeight: 'bold', marginBottom: '20px' }}
        >
          <IonIcon icon={cameraOutline} slot="start" />
          Scan with Camera
        </IonButton>

        <IonCard className="cyber-card">
          <IonCardContent>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
              Input manually :
            </div>
            <IonItem style={{ '--background': 'transparent' }}>
              <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Checkpoint code</IonLabel>
              <IonInput
                value={code}
                onIonInput={(e) => setCode(e.detail.value || '')}
                placeholder="ex: checkpoint_01"
                style={{ color: 'var(--text-primary)' }}
              />
            </IonItem>
            <IonButton expand="block" onClick={handleManualSubmit} style={{ marginTop: '14px' }}>
              <IonIcon icon={checkmarkCircleOutline} slot="start" />
              Validate
            </IonButton>
          </IonCardContent>
        </IonCard>

        {status === 'success' && (
          <div style={{ textAlign: 'center', color: 'var(--success)', marginTop: '20px', fontWeight: 'bold' }}>
            ✅ Checkpoint validated — XP awarded!
          </div>
        )}
        {status === 'error' && (
          <div style={{ textAlign: 'center', color: 'var(--danger)', marginTop: '20px' }}>
            Invalid code, or camera scan unavailable on this platform.
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default QRScanner;
