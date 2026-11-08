import { BoardState, Color, AISparringLevel, Point } from '../types/go';

export interface KataGoServerStatus {
  ok: boolean;
  engine: string;
  model: string;
  lanIp: string;
  port: number;
  currentProfile: string;
}

export interface KataGoMoveResponse {
  ok: boolean;
  move: Point | null;
  gtpMove: string;
  profile: string;
  visits: number;
  durationMs: number;
  error?: string;
}

const DEFAULT_LAN_IP = '192.168.10.135';
const DEFAULT_PORT = 8765;
const STORAGE_KEY = 'weiqi_katago_pc_url';

class PcKataGoClientImpl {
  private activeUrl: string | null = null;
  private isOnline = false;
  private lastCheckTime = 0;
  private checkingPromise: Promise<boolean> | null = null;

  public getSavedServerUrl(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      // If served directly from server.py (same host)
      if (window.location.port === String(DEFAULT_PORT)) {
        return `${window.location.protocol}//${window.location.host}`;
      }
      // If served from Vite dev server or Pages on LAN
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `http://${window.location.hostname}:${DEFAULT_PORT}`;
      }
    }
    return `http://${DEFAULT_LAN_IP}:${DEFAULT_PORT}`;
  }

  public setServerUrl(url: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, url);
    }
    this.activeUrl = url;
    this.lastCheckTime = 0;
  }

  public isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Probes PC server status with 1.5s timeout.
   */
  public async probeStatus(): Promise<boolean> {
    const now = Date.now();
    // Cache positive status for 8 seconds, negative for 3 seconds
    if (this.checkingPromise) return this.checkingPromise;
    if (this.isOnline && now - this.lastCheckTime < 8000) return true;
    if (!this.isOnline && now - this.lastCheckTime < 3000) return false;

    this.checkingPromise = (async () => {
      const candidates = [
        this.getSavedServerUrl(),
        `http://${DEFAULT_LAN_IP}:${DEFAULT_PORT}`,
        `http://localhost:${DEFAULT_PORT}`,
      ];

      // Deduplicate candidates
      const uniqueCandidates = Array.from(new Set(candidates));

      for (const url of uniqueCandidates) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1200);
          const res = await fetch(`${url}/api/status`, {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = (await res.json()) as KataGoServerStatus;
            if (data && data.ok) {
              this.activeUrl = url;
              this.isOnline = true;
              this.lastCheckTime = Date.now();
              return true;
            }
          }
        } catch {
          // Continue trying next candidate
        }
      }

      this.isOnline = false;
      this.lastCheckTime = Date.now();
      return false;
    })().finally(() => {
      this.checkingPromise = null;
    });

    return this.checkingPromise;
  }

  /**
   * Request move from PC KataGo Human-SL engine.
   */
  public async requestMove(
    state: BoardState,
    color: Color,
    level: AISparringLevel = '15k'
  ): Promise<Point | null> {
    const available = await this.probeStatus();
    if (!available || !this.activeUrl) {
      return null;
    }

    const payload = {
      boardSize: state.size,
      moveHistory: state.moveHistory.map((m) => ({
        x: m.x,
        y: m.y,
        color: m.color,
      })),
      turn: color,
      sparringLevel: level,
      komi: state.size === 19 ? 7.5 : state.size === 13 ? 5.5 : 3.5,
    };

    const controller = new AbortController();
    // 15 seconds max timeout for full search
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${this.activeUrl}/api/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = (await res.json()) as KataGoMoveResponse;
      if (data && data.ok) {
        return data.move;
      }
      return null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[PcKataGoClient] Move request failed, falling back to local engine:', e);
      this.isOnline = false;
      this.lastCheckTime = 0;
      return null;
    }
  }
}

export const PcKataGoClient = new PcKataGoClientImpl();
