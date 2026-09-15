import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonImg, IonSpinner, IonButton, IonIcon, IonBadge,
  IonRefresher, IonRefresherContent, IonModal, IonItem, IonLabel, IonInput,
  IonTextarea
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { refreshOutline, timeOutline, trailSignOutline, alertCircleOutline, addOutline, createOutline, trashOutline, closeOutline, saveOutline } from 'ionicons/icons';
import { getTrails, createTrail, updateTrail, deleteTrail, Trail as TrailType } from '../services/api';

const FALLBACK_IMAGE = 'https://ionicframework.com/docs/img/demos/card-media.png';

const difficultyColor = (difficulty: string) => {
  const d = difficulty?.toLowerCase() || '';
  if (d.includes('easy') || d.includes('facile')) return 'var(--success)';
  if (d.includes('moderate') || d.includes('modéré') || d.includes('medium')) return 'var(--warning)';
  if (d.includes('hard') || d.includes('difficile')) return 'var(--danger)';
  return 'var(--neon-cyan)';
};

const emptyForm = {
  trail_name: '',
  district: '',
  difficulty: 'Moderate',
  distance_km: '',
  estimated_duration: '',
  safety_note: '',
  image_url: '',
  status: 'Open',
  latitude: '',
  longitude: ''
};

// Ce composant s'appelle "Trail" (singulier) pour matcher exactement
// l'import existant dans App.tsx : import Trail from './pages/Trail';
const Trail: React.FC = () => {
  const history = useHistory();
  const [trails, setTrails] = useState<TrailType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadTrails = async () => {
    setError(null);
    try {
      const data = await getTrails();
      setTrails(data);
    } catch (e: any) {
      setError(e.message || 'Unable to load trails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrails();
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    await loadTrails();
    event.detail.complete();
  };

  const openTrail = (id: number) => {
    history.push(`/trails/${id}`);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSaveError(null);
    setShowModal(true);
  };

  const openEditForm = (e: React.MouseEvent, trail: TrailType) => {
    e.stopPropagation(); // ne pas déclencher l'ouverture des détails du sentier
    setEditingId(trail.id);
    setForm({
      trail_name: trail.trail_name || '',
      district: trail.district || '',
      difficulty: trail.difficulty || 'Moderate',
      distance_km: String(trail.distance_km ?? ''),
      estimated_duration: trail.estimated_duration || '',
      safety_note: trail.safety_note || '',
      image_url: trail.image_url || '',
      status: trail.status || 'Open',
      latitude: trail.latitude != null ? String(trail.latitude) : '',
      longitude: trail.longitude != null ? String(trail.longitude) : ''
    });
    setSaveError(null);
    setShowModal(true);
  };

  const handleDelete = async (e: React.MouseEvent, trail: TrailType) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete "${trail.trail_name}"? This will remove it from the database.`);
    if (!confirmed) return;

    try {
      await deleteTrail(trail.id);
      await loadTrails();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trail.');
    }
  };

  const handleSave = async () => {
    if (!form.trail_name.trim()) return;
    setSaving(true);
    setSaveError(null);

    const payload: Partial<TrailType> = {
      trail_name: form.trail_name,
      district: form.district,
      difficulty: form.difficulty,
      distance_km: form.distance_km ? Number(form.distance_km) : 0,
      estimated_duration: form.estimated_duration,
      safety_note: form.safety_note,
      image_url: form.image_url || null,
      status: form.status,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null
    };

    try {
      if (editingId) {
        await updateTrail(editingId, payload);
      } else {
        await createTrail(payload);
      }
      setShowModal(false);
      await loadTrails();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save trail.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" style={{ color: 'var(--neon-cyan)' }} />
          </IonButtons>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Available Trails
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openCreateForm} style={{ '--color': 'var(--neon-magenta)' }}>
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <IonSpinner name="crescent" style={{ '--color': 'var(--neon-cyan)', width: '40px', height: '40px' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px' }}>
              Connecting to trails API...
            </div>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '0 20px' }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '40px', color: 'var(--danger)' }} />
            <div style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '12px 0', fontWeight: 'bold' }}>
              Connection to API failed
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
              {error}
            </div>
            <IonButton onClick={loadTrails} fill="outline" style={{ '--border-color': 'var(--neon-cyan)', '--color': 'var(--neon-cyan)' }}>
              <IonIcon icon={refreshOutline} slot="start" />
              Retry
            </IonButton>
          </div>
        )}

        {!loading && !error && trails.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No trails available at the moment. Tap + to add one.
          </div>
        )}

        {!loading && !error && trails.map((trail) => (
          <IonCard
            key={trail.id}
            className="cyber-card"
            button
            onClick={() => openTrail(trail.id)}
            style={{ margin: '0 0 16px 0', overflow: 'hidden' }}
          >
            <IonImg
              src={trail.image_url || FALLBACK_IMAGE}
              style={{ height: '150px', objectFit: 'cover' }}
            />
            <IonCardHeader style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <IonCardTitle style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                  {trail.trail_name}
                </IonCardTitle>
                <IonBadge style={{ '--background': difficultyColor(trail.difficulty), '--color': 'var(--text-primary)', fontWeight: 'bold' }}>
                  {trail.difficulty}
                </IonBadge>
              </div>
              <IonCardSubtitle style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                {trail.district}
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }} className="field-data">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={trailSignOutline} style={{ color: 'var(--neon-cyan)' }} />
                    {trail.distance_km} km
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IonIcon icon={timeOutline} style={{ color: 'var(--neon-cyan)' }} />
                    {trail.estimated_duration}
                  </span>
                </div>
                <div>
                  <IonButton fill="clear" size="small" onClick={(e) => openEditForm(e, trail)} style={{ '--color': 'var(--neon-cyan)' }}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" size="small" onClick={(e) => handleDelete(e, trail)} style={{ '--color': 'var(--danger)' }}>
                    <IonIcon icon={trashOutline} slot="icon-only" />
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>

      {/* CREATE / EDIT MODAL — writes directly to the Laravel API */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
            <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
              {editingId ? 'Edit Trail' : 'New Trail'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)} style={{ '--color': 'var(--text-muted)' }}>
                <IonIcon icon={closeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Trail name</IonLabel>
            <IonInput
              value={form.trail_name}
              onIonInput={(e) => setForm({ ...form, trail_name: e.detail.value || '' })}
              placeholder="e.g. Le Morne Brabant"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>District</IonLabel>
            <IonInput
              value={form.district}
              onIonInput={(e) => setForm({ ...form, district: e.detail.value || '' })}
              placeholder="e.g. Black River"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Difficulty</IonLabel>
            <IonInput
              value={form.difficulty}
              onIonInput={(e) => setForm({ ...form, difficulty: e.detail.value || '' })}
              placeholder="Easy / Moderate / Hard"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Distance (km)</IonLabel>
            <IonInput
              type="number"
              value={form.distance_km}
              onIonInput={(e) => setForm({ ...form, distance_km: e.detail.value || '' })}
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Estimated duration</IonLabel>
            <IonInput
              value={form.estimated_duration}
              onIonInput={(e) => setForm({ ...form, estimated_duration: e.detail.value || '' })}
              placeholder="e.g. 3h30"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Safety note</IonLabel>
            <IonTextarea
              value={form.safety_note}
              onIonInput={(e) => setForm({ ...form, safety_note: e.detail.value || '' })}
              autoGrow
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Image URL </IonLabel>
            <IonInput
              value={form.image_url}
              onIonInput={(e) => setForm({ ...form, image_url: e.detail.value || '' })}
              placeholder="https://..."
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Status</IonLabel>
            <IonInput
              value={form.status}
              onIonInput={(e) => setForm({ ...form, status: e.detail.value || '' })}
              placeholder="Open / Closed"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Latitude (optional)</IonLabel>
            <IonInput
              type="number"
              value={form.latitude}
              onIonInput={(e) => setForm({ ...form, latitude: e.detail.value || '' })}
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '20px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Longitude (optional)</IonLabel>
            <IonInput
              type="number"
              value={form.longitude}
              onIonInput={(e) => setForm({ ...form, longitude: e.detail.value || '' })}
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          {saveError && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '12px' }}>{saveError}</div>
          )}

          <IonButton
            expand="block"
            onClick={handleSave}
            disabled={saving}
            style={{ '--background': 'var(--neon-magenta)', '--color': 'var(--text-primary)', fontWeight: 'bold' }}
          >
            <IonIcon icon={saveOutline} slot="start" />
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create trail'}
          </IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Trail;
