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
  await withTimeout(b.init(), 15000);
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
    return this.fs.onSnapshot(this._room(game, code), (s) => cb(s.exists() ? s.data() : null), (e) => showError(e));
  }
  async getPlayer(game, code, pid) {
    const s = await this.fs.getDoc(this._player(game, code, pid));
    return s.exists() ? s.data() : null;
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
  // 학생 한 명(나)만 지켜보기 — 학생 화면은 이것만 써서 Firebase 읽기 횟수를 줄입니다
  watchPlayer(game, code, pid, cb) {
    return this.fs.onSnapshot(this._player(game, code, pid), (s) => cb(s.exists() ? s.data() : null), (e) => showError(e));
  }
  watchPlayers(game, code, cb) {
    return this.fs.onSnapshot(this._players(game, code), (qs) => {
      const out = {};
      qs.forEach((d) => (out[d.id] = d.data()));
      cb(out);
    }, (e) => showError(e));
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
  async getPlayer(game, code, pid) { return this._read(this._key(game, code, "players"), {})[pid] || null; }
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
  watchPlayer(game, code, pid, cb) {
    const k = this._key(game, code, "players");
    return this._listen(k, () => cb(this._read(k, {})[pid] || null));
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

/* ------------------------------------------------------------------ */
/*  오류를 한글로 알려 주기                                              */
/* ------------------------------------------------------------------ */
export function explainError(e) {
  const code = (e && (e.code || "")) + "";
  const msg = (e && (e.message || "")) + "";
  if (msg.includes("dynamically imported module") || msg.includes("Failed to fetch")) return "Firebase 프로그램을 불러오지 못했어요. 인터넷 연결을 확인하고, 학교 인터넷이 gstatic.com 을 막고 있지 않은지 확인해 주세요.";
  if (code === "timeout") return "서버 응답이 너무 늦어요. 인터넷 연결을 확인하고, Firebase에 Firestore 데이터베이스를 만들었는지 확인해 주세요.";
  if (code.includes("permission-denied") || msg.includes("permission")) return "Firebase 보안 규칙 때문에 막혔어요. Firestore → 규칙에 경제 게임 규칙을 넣고 '게시'했는지 확인해 주세요.";
  if (msg.includes("does not exist") || code.includes("not-found") || code.includes("failed-precondition")) return "Firestore 데이터베이스가 아직 없어요. Firebase → Firestore Database → '데이터베이스 만들기'를 해 주세요.";
  if (code.includes("admin-restricted") || code.includes("operation-not-allowed")) return "Firebase 익명 로그인이 꺼져 있어요. Authentication → 로그인 방법 → 익명을 켜 주세요.";
  if (code.includes("unavailable") || msg.includes("offline") || code.includes("network")) return "Firebase 서버에 연결되지 않아요. 인터넷 연결이나 학교 인터넷 차단을 확인해 주세요.";
  if (code.includes("api-key") || msg.includes("API key")) return "Firebase 설정값(apiKey)이 잘못됐어요. shared/firebase-config.js를 확인해 주세요.";
  return "문제가 생겼어요: " + (code || msg || e);
}

export function withTimeout(p, ms = 12000) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: "timeout" }), ms))]);
}

export function showError(e) {
  console.error(e);
  let box = document.getElementById("econ-error");
  if (!box) {
    box = document.createElement("div");
    box.id = "econ-error";
    box.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:999;background:#fde9e5;color:#7a1f12;border:2px solid #c2412d;border-radius:14px;padding:14px 16px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.15)";
    box.onclick = () => box.remove();
    document.body.appendChild(box);
  }
  box.textContent = "⚠️ " + explainError(e) + "  (눌러서 닫기)";
}
