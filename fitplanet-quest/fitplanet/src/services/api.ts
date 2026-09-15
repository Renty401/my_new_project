
import { Capacitor } from '@capacitor/core';

const LAN_IP = '10.71.109.114'; 
const PORT = '8001';

function resolveApiBase(): string {
  const platform = Capacitor.getPlatform(); // 'web' | 'android' | 'ios'
  if (platform === 'android') {
    // Emulateur Android : 10.0.2.2 route vers le localhost de la machine hôte.
    // Sur un vrai appareil Android, 10.0.2.2 ne marche pas -> il faudra LAN_IP.
    // Si tu testes sur un vrai téléphone, force manuellement la ligne du bas.
    return `http://10.71.109.114:${PORT}/api`;
    // return `http://${LAN_IP}:${PORT}/api`; // <- décommente pour un vrai téléphone Android
  }
  if (platform === 'ios') {
    // Simulateur iOS partage le réseau du Mac -> localhost fonctionne.
    // Vrai iPhone -> il faut LAN_IP.
    return `http://${LAN_IP}:${PORT}/api`;
  }
  // Web (navigateur, ionic serve)
  return `http://localhost:${PORT}/api`;
}

const API_BASE = resolveApiBase();

export interface Trail {
  id: number;
  trail_name: string;
  district: string;
  difficulty: string;
  distance_km: number;
  estimated_duration: string;
  safety_note: string;
  status: string;
  image_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrailWeather {
  trail_name: string;
  district: string;
  weather: {
    temperature: number;
    wind_speed: number;
    rain_probability: number;
  };
  source: string;
}

// Laravel renvoie soit un tableau simple, soit une pagination { data: [...], meta: {...} },
// soit une API Resource collection { data: [...] }. On gère les trois cas.
function unwrap<T>(json: any): T[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export async function getTrails(): Promise<Trail[]> {
  // Ton API pagine les résultats (Challenge B) — sans ça, on ne récupérerait
  // que la première page, et les sentiers plus loin dans la liste (ou un
  // nouveau sentier fraîchement créé) pourraient ne jamais s'afficher.
  // On suit donc automatiquement les pages suivantes jusqu'à la dernière.
  let allTrails: Trail[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await fetch(`${API_BASE}/trails?page=${page}`);
    const json = await handle(res);
    allTrails = allTrails.concat(unwrap<Trail>(json));

    lastPage = json?.meta?.last_page || json?.last_page || 1;
    page++;
  } while (page <= lastPage);

  return allTrails;
}

export async function getTrail(id: number): Promise<Trail> {
  const res = await fetch(`${API_BASE}/trails/${id}`);
  const json = await handle(res);
  // Une API Resource "show" renvoie souvent { data: {...} }
  return json?.data ?? json;
}

export async function getTrailWeather(id: number): Promise<TrailWeather> {
  const res = await fetch(`${API_BASE}/trails/${id}/weather`);
  return handle(res);
}

export async function createTrail(payload: Partial<Trail>): Promise<Trail> {
  const res = await fetch(`${API_BASE}/trails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await handle(res);
  return json?.data ?? json;
}

export async function updateTrail(id: number, payload: Partial<Trail>): Promise<Trail> {
  const res = await fetch(`${API_BASE}/trails/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await handle(res);
  return json?.data ?? json;
}

export async function deleteTrail(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/trails/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
}
