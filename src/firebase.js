import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

// Firebase コンソール →「プロジェクトの設定」→「マイアプリ」で表示される値に置き換える。
// この値は公開されて問題ない（アクセス制御は firestore.rules が担う）。
const firebaseConfig = {
  apiKey: "AIzaSyDA14dOrMZlxvWI4QpBbEy-ncT8w2X3eKY",
  authDomain: "travel-ff404.firebaseapp.com",
  projectId: "travel-ff404",
  storageBucket: "travel-ff404.firebasestorage.app",
  messagingSenderId: "822408507139",
  appId: "1:822408507139:web:8e072eb7673879628a8336"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// 端末にキャッシュを持たせる。旅行先で電波が悪くても読み書きでき、
// 復帰したときに自動で同期される。
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
});

// アプリ起動時に呼ぶ。登録画面は出さず、その端末専用の UID を自動で発行する。
// 一度発行された UID はブラウザに保存され、次回以降も同じものが使われる。
export function ensureUser() {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          stop();
          resolve(user.uid);
        } else {
          signInAnonymously(auth).catch(reject);
        }
      },
      reject
    );
  });
}
