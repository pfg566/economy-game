// 공용 서버 연결 모듈
//  - Firebase(Firestore + 익명 로그인)를 쓰거나
//  - 설정이 비어 있거나 주소 끝에 ?demo=1 이 붙어 있으면 "데모 모드"(같은 브라우저 탭끼리 연결)로 동작합니다.
//
//  데이터 위치 (Firestore)
//    econRooms/{게임}_{수업코드}                  ← 방 정보 (선생님만 씀)
//    econRooms/{게임}_{수업코드}/players/{학생ID}  ← 학생 한 명의 정보 (본인 + 선생님만 씀)

import { FIREBASE_CONFIG } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";

export async function createBackend() {
  const params = new URLSearchParams(location.search);
  const demo = params.get("demo") === "1" || !FIREBASE_CONFIG.apiKey;
  if (demo) return new DemoBackend();
  const b = new FirebaseBackend();
  await b.init();
  return b;
}

/* ------------------------------------------------------------------ */
/*  Firebase                                                           */
/* ------------------------------------------------------------------ */
class FirebaseBackend {
  constructor() { this.mode = "firebase"; }

  async init() {
    const appMod = await import(SDK + "firebase-app.js");
    const authMod = await import(SDK + "firebase-auth.js");
    const fs = await import(SDK + "firebase-firestore.js");
    this.fs = fs;
    // 사회 게임 RPG와 같은 프로젝트를 써도 서로 섞이지 않도록 앱 이름을 따로 둡니다.
    const app = appMod.initializeApp(FIREBASE_CONFIG, "econ-games");
    this.db = fs.getFirestore(app);
    const auth = authMod.getAuth(app);
    const cred = await authMod.signInAnonymously(auth);
    this.uid = cred.user.uid;
  }

  _room(game, code) { return this.fs.doc(this.db, "econRooms", `${game}_${code}`); }
  _players(game, code) { return this.fs.collection(this.db, "econRooms", `${game}_${code}`, "players"); }
  _player(game, code, pid) { return this.fs.doc(this.db, "econRooms", `${game}_${code}`, "players", pid); }

  async getRoom(game, code) {
    const s = await this.fs.getDoc(this._room(game, code));
    return s.exists() ? s.data() : null;
  }
  setRoom(game, code, data) { return this.fs.setDoc(this._room(game, code), data); }
  updateRoom(game, code, patch) { return this.fs.setDoc(this._room(game, code), patch, { merge: true }); }
  watchRoom(game, code, cb) {
    return this.fs.onSnapshot(this._room(game, code), (s) => cb(s.exists() ? s.data() : null));
  }
  setPlayer(game, code, pid, data) { return this.fs.setDoc(this._player(game, code, pid), data); }
  updatePlayer(game, code, pid, patch) { return this.fs.setDoc(this._player(game, code, pid), patch, { merge: true }); }
  async updatePlayers(game, code, patches) {
    // 여러 학생 정보를 한 번에 저장 (최대 450개씩 나눠서)
    const ids = Object.keys(patches);
    for (let i = 0; i < ids.length; i += 450) {
      const batch = this.fs.writeBatch(this.db);
      ids.slice(i, i + 450).forEach((pid) => batch.set(this._player(game, code, pid), patches[pid], { merge: true }));
      await batch.commit();
    }
  }
  async deletePlayer(game, code, pid) { await this.fs.deleteDoc(this._player(game, code, pid)); }
  watchPlayers(game, code, cb) {
    return this.fs.onSnapshot(this._players(game, code), (qs) => {
      const out = {};
      qs.forEach((d) => (out[d.id] = d.data()));
      cb(out);
    });
  }
}

/* ------------------------------------------------------------------ */
/*  데모 모드: localStorage + BroadcastChannel (같은 브라우저 탭끼리)    */
/* ------------------------------------------------------------------ */
class DemoBackend {
  constructor() {
    this.mode = "demo";
    this.ch = new BroadcastChannel("econ-demo");
    this.listeners = new Set();
    this.ch.onmessage = (e) => this._emit(e.data);
    // 탭마다 다른 학생이 되도록 sessionStorage에 ID 저장
    let id = sessionStorage.getItem("econ-demo-uid");
    if (!id) { id = "u" + Math.random().toString(36).slice(2, 10); sessionStorage.setItem("econ-demo-uid", id); }
    this.uid = id;
  }
  _key(game, code, sub) { return `econ-demo:${game}_${code}:${sub}`; }
  _read(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
  _write(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
    this.ch.postMessage(k);
    this._emit(k);
  }
  _emit(k) { this.listeners.forEach((l) => { if (l.key === k) l.fire(); }); }
  _listen(key, fire) {
    const l = { key, fire };
    this.listeners.add(l);
    setTimeout(fire, 0);
    return () => this.listeners.delete(l);
  }
  async getRoom(game, code) { return this._read(this._key(game, code, "room"), null); }
  async setRoom(game, code, data) { this._write(this._key(game, code, "room"), data); }
  async updateRoom(game, code, patch) {
    const k = this._key(game, code, "room");
    this._write(k, { ...this._read(k, {}), ...patch });
  }
  watchRoom(game, code, cb) {
    const k = this._key(game, code, "room");
    return this._listen(k, () => cb(this._read(k, null)));
  }
  async setPlayer(game, code, pid, data) {
    const k = this._key(game, code, "players");
    const all = this._read(k, {}); all[pid] = data; this._write(k, all);
  }
  async updatePlayer(game, code, pid, patch) {
    const k = this._key(game, code, "players");
    const all = this._read(k, {}); all[pid] = { ...(all[pid] || {}), ...patch }; this._write(k, all);
  }
  async updatePlayers(game, code, patches) {
    const k = this._key(game, code, "players");
    const all = this._read(k, {});
    for (const pid in patches) all[pid] = { ...(all[pid] || {}), ...patches[pid] };
    this._write(k, all);
  }
  async deletePlayer(game, code, pid) {
    const k = this._key(game, code, "players");
    const all = this._read(k, {}); delete all[pid]; this._write(k, all);
  }
  watchPlayers(game, code, cb) {
    const k = this._key(game, code, "players");
    return this._listen(k, () => cb(this._read(k, {})));
  }
}

/* ------------------------------------------------------------------ */
/*  공용 도우미                                                         */
/* ------------------------------------------------------------------ */
export const won = (n) => (Math.round(n) || 0).toLocaleString("ko-KR") + "원";
export const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(Math.round(n)).toLocaleString("ko-KR") + "원";
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function newCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
export function modeBadge(backend) {
  return backend.mode === "demo"
    ? `<span class="badge demo" title="Firebase 설정이 비어 있어 같은 브라우저 탭끼리만 연결돼요">데모 모드</span>`
    : `<span class="badge live">온라인</span>`;
}
