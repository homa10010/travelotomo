# 旅のおとも

持ち物チェック・予定・予約情報・行きたい場所を旅行ごとに管理するアプリ。

- 匿名認証なので、利用者は登録も入力もなしにそのまま使える
- データは端末ごとの UID の下に保存され、他の利用者と混ざらない
- オフラインキャッシュ有効。旅先で電波が悪くても操作でき、復帰後に同期される
- スマホのホーム画面に追加するとアプリのように開ける

## 技術構成

React + Vite / Firebase Authentication（匿名） / Cloud Firestore / GitHub Pages

---

# セットアップ（すべてブラウザだけで完結）

コマンド操作は一切不要。ビルドは GitHub 側が自動で行う。

## 1. Firebase を用意する

[Firebase コンソール](https://console.firebase.google.com/) を開く。

1. **プロジェクトを追加** → 名前を入力して作成（Google アナリティクスはオフでよい）
2. 左メニュー **構築 → Authentication** → 「始める」→ **Sign-in method** タブ → **匿名** を選び、有効にして保存
3. 左メニュー **構築 → Firestore Database** → 「データベースの作成」
   - ロケーションは `asia-northeast1`（東京）
   - **本番環境モード** を選ぶ
4. Firestore の **ルール** タブを開き、中身を全部消して、このリポジトリの `firestore.rules` の中身を貼り付け、**公開** を押す

> この手順を飛ばすとデータが保護されない。必ず行う。

5. 左上の歯車 → **プロジェクトの設定** → 下にスクロールして「マイアプリ」→ ウェブ（`</>`）を選ぶ
   - アプリ名を入れて登録（Hosting のチェックは不要）
   - 表示される `firebaseConfig` の中身をコピーしておく

## 2. GitHub にアップロードする

1. [GitHub](https://github.com/new) で新しいリポジトリを作る
   - **Public** を選ぶ（Pages を無料で使うため）
   - 「Add a README file」は**チェックしない**
2. 作成後の画面で **uploading an existing file** をクリック
3. このプロジェクトのフォルダの中身を、**ファイルとフォルダごとまとめてドラッグ&ドロップ**する
   - `node_modules` と `dist` は含めない（zip には入っていない）
4. 下の **Commit changes** を押す

## 3. 設定値を書き換える

GitHub 上で `src/firebase.js` を開き、右上の鉛筆アイコン（Edit this file）を押す。

`firebaseConfig` の 6 つの値を、手順1でコピーしたものに置き換えて **Commit changes**。

この値はビルド後の JS に含まれて公開されるが、問題ない。アクセス制御は `firestore.rules` が担っているため、値を知られても他人のデータは読めない。

## 4. GitHub Pages を有効にする

1. リポジトリの **Settings** タブ → 左メニューの **Pages**
2. **Source** を **GitHub Actions** に変更

これだけで自動的にビルドと公開が始まる。**Actions** タブで進行状況を確認でき、緑のチェックが付いたら完了。

公開 URL は `https://<ユーザー名>.github.io/<リポジトリ名>/` になる。

## 5. スマホのホーム画面に追加する

公開 URL をスマホで開き、

- **iPhone（Safari）**: 共有ボタン → 「ホーム画面に追加」
- **Android（Chrome）**: 右上メニュー → 「ホーム画面に追加」

アドレスバーのないアプリとして開けるようになる。

---

## あとから修正したいとき

GitHub 上で `src/App.jsx` を開いて鉛筆アイコンから編集し、Commit するだけ。数十秒後に公開ページへ自動で反映される。ここでもコマンドは不要。

## データ構造

```
users/{uid}/meta/settings     テーマ・持ち物テンプレート・忘れ物履歴
users/{uid}/trips/{tripId}    旅行ごとのデータ
```

`{uid}` は匿名認証で自動発行される端末固有の ID。`firestore.rules` により、ログイン中の UID と一致するパスしか読み書きできない。

## 匿名認証の注意点

UID はブラウザに保存されるため、次の場合は別ユーザー扱いになり過去の旅行が見えなくなる。

- 別の端末・別のブラウザで開いたとき
- ブラウザのサイトデータを削除したとき
- iOS Safari でプライベートブラウズを使ったとき

将来、複数端末で使いたくなった場合は `linkWithPopup` で匿名 UID を Google アカウントに紐付けできる。データを保持したまま昇格できるので、使いたい人だけがログインする形にできる。

## ファイル構成

```
src/
  App.jsx        画面とロジック（ここを編集する）
  firebase.js    Firebase 初期化と匿名ログイン（設定値を貼る場所）
  store.js       Firestore の読み書き
public/          アイコンと manifest
firestore.rules  アクセス制御（Firebase コンソールに貼る内容）
.github/workflows/deploy.yml  自動ビルドと公開の設定
```
