import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// ---- データの置き場所 ----
//   users/{uid}/meta/settings     テーマ・持ち物テンプレート・忘れ物履歴
//   users/{uid}/trips/{tripId}    旅行ごとのデータ
// firestore.rules で uid が一致しないと読み書きできないため、
// 他の利用者のデータが混ざることはない。

function settingsRef(uid) {
  return doc(db, "users", uid, "meta", "settings");
}

function tripsRef(uid) {
  return collection(db, "users", uid, "trips");
}

export async function loadAll(uid) {
  const [settingsSnap, tripsSnap] = await Promise.all([
    getDoc(settingsRef(uid)),
    getDocs(tripsRef(uid)),
  ]);

  const settings = settingsSnap.exists() ? settingsSnap.data() : null;
  const trips = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // 新しく作ったものを上に
  trips.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return { settings, trips };
}

export async function saveTrip(uid, trip) {
  const { id, ...rest } = trip;
  await setDoc(doc(tripsRef(uid), id), rest);
}

export async function removeTrip(uid, tripId) {
  await deleteDoc(doc(tripsRef(uid), tripId));
}

export async function saveSettings(uid, settings) {
  await setDoc(settingsRef(uid), settings);
}

// チェックを付けるたびに書き込むと通信が増えるので、
// 操作が止まってからまとめて送る。
export function makeDebouncer(wait = 800) {
  const timers = new Map();
  return function schedule(key, fn) {
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        Promise.resolve(fn()).catch((e) => console.error("保存に失敗:", e));
      }, wait)
    );
  };
}
