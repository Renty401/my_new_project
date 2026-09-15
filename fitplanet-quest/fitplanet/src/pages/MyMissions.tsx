import React, { useState, useEffect } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle, IonBackButton,
  IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonModal, IonInput, IonTextarea, IonBadge
} from '@ionic/react';
import {
  addOutline, createOutline, trashOutline, leafOutline, closeOutline,
  saveOutline
} from 'ionicons/icons';

interface CustomMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  createdAt: string;
}

const STORAGE_KEY = 'custom_missions';

const loadMissions = (): CustomMission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveMissions = (missions: CustomMission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
};

const emptyForm = { title: '', description: '', xpReward: '10' };

const MyMissions: React.FC = () => {
  const [missions, setMissions] = useState<CustomMission[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setMissions(loadMissions());
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditForm = (mission: CustomMission) => {
    setEditingId(mission.id);
    setForm({
      title: mission.title,
      description: mission.description,
      xpReward: String(mission.xpReward)
    });
    setShowModal(true);
  };

  // CREATE + UPDATE (same form, distinguished by editingId)
  const handleSave = () => {
    if (!form.title.trim()) return;

    let updated: CustomMission[];

    if (editingId) {
      // UPDATE
      updated = missions.map((m) =>
        m.id === editingId
          ? { ...m, title: form.title, description: form.description, xpReward: Number(form.xpReward) || 0 }
          : m
      );
    } else {
      // CREATE
      const newMission: CustomMission = {
        id: Date.now().toString(),
        title: form.title,
        description: form.description,
        xpReward: Number(form.xpReward) || 0,
        createdAt: new Date().toISOString()
      };
      updated = [newMission, ...missions];
    }

    setMissions(updated);
    saveMissions(updated);
    setShowModal(false);
  };

  // DELETE
  const handleDelete = (id: string, title: string) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    const updated = missions.filter((m) => m.id !== id);
    setMissions(updated);
    saveMissions(updated);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/missions" style={{ color: 'var(--neon-cyan)' }} />
          </IonButtons>
          <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            My Missions
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openCreateForm} style={{ '--color': 'var(--neon-magenta)' }}>
              <IonIcon icon={addOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
        {missions.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '80px', padding: '0 30px' }}>
            <IonIcon icon={leafOutline} style={{ fontSize: '50px', color: 'var(--text-faint)' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>
              No missions yet. Tap + to create one.
            </div>
          </div>
        )}

        <IonList style={{ background: 'transparent' }}>
          {missions.map((mission) => (
            <IonItem
              key={mission.id}
              style={{ '--background': 'var(--bg-surface)', '--border-color': 'var(--border-subtle)', margin: '8px 0', borderRadius: '14px' }}
              lines="none"
            >
              <IonLabel>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '15px' }}>
                  {mission.title}
                </h2>
                {mission.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0' }}>
                    {mission.description}
                  </p>
                )}
                <IonBadge className="field-data" style={{ '--background': 'var(--neon-purple)', '--color': 'var(--text-primary)', marginTop: '4px' }}>
                  +{mission.xpReward} XP
                </IonBadge>
              </IonLabel>

              {/* Read = this list itself. Update / Delete = these two visible buttons. */}
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => openEditForm(mission)}
                style={{ '--color': 'var(--neon-cyan)' }}
                title="Edit"
              >
                <IonIcon icon={createOutline} slot="icon-only" />
              </IonButton>
              <IonButton
                fill="clear"
                slot="end"
                onClick={() => handleDelete(mission.id, mission.title)}
                style={{ '--color': 'var(--danger)' }}
                title="Delete"
              >
                <IonIcon icon={trashOutline} slot="icon-only" />
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      {/* MODAL CREATE / UPDATE */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}>
            <IonTitle style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
              {editingId ? 'Edit Mission' : 'New Mission'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)} style={{ '--color': 'var(--text-muted)' }}>
                <IonIcon icon={closeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': 'var(--bg-deep)' }} className="ion-padding">
          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '14px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Mission title</IonLabel>
            <IonInput
              value={form.title}
              onIonInput={(e) => setForm({ ...form, title: e.detail.value || '' })}
              placeholder="e.g. Pick up 5 pieces of litter"
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '14px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Description</IonLabel>
            <IonTextarea
              value={form.description}
              onIonInput={(e) => setForm({ ...form, description: e.detail.value || '' })}
              placeholder="Describe the mission goal"
              autoGrow
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonItem style={{ '--background': 'var(--bg-surface)', borderRadius: '12px', marginBottom: '20px' }}>
            <IonLabel position="stacked" style={{ color: 'var(--text-muted)' }}>Reward (XP)</IonLabel>
            <IonInput
              type="number"
              value={form.xpReward}
              onIonInput={(e) => setForm({ ...form, xpReward: e.detail.value || '0' })}
              style={{ color: 'var(--text-primary)' }}
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={handleSave}
            style={{ '--background': 'var(--neon-magenta)', '--color': 'var(--text-primary)', fontWeight: 'bold' }}
          >
            <IonIcon icon={saveOutline} slot="start" />
            {editingId ? 'Save changes' : 'Create mission'}
          </IonButton>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default MyMissions;
