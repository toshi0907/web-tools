# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## このリポジトリについて

小さな自己完結型の静的Webアプリを集めて、GitHub Pagesでまとめて公開するリポジトリです。ビルドステップ、パッケージマネージャ、テストスイートは存在しません。各アプリは単一の静的な `index.html`（共通の `assets/style.css` を参照）だけで完結し、ブラウザ上でそのまま動作します。

## コマンド

ビルド/lint/テストのツールはありません。ローカルで確認する場合は、リポジトリルートを静的ファイルとして配信します。例えば以下のように実行します。

```
python3 -m http.server 8000
```

その後 `http://localhost:8000/`（トップページ）または `http://localhost:8000/apps/<アプリ名>/`（各アプリ）を直接開いて確認します。

## アーキテクチャ

- `index.html` — トップのランディングページ。実行時に `apps.json` を fetch し、`#app-grid` に1エントリ1カードとして描画する。個々のアプリの情報をビルド時に持たない。
- `apps.json` — ランディングページに表示するアプリの唯一の情報源。各エントリは `{ "name": ..., "path": "apps/<アプリ名>/", "description": ... }` の形式。`apps/` 配下に `index.html` を置くだけではランディングページに表示されず、必ずここにもエントリを追加する必要がある。
- `apps/<アプリ名>/index.html` — 各アプリはHTML1ファイル（マークアップ＋インライン`<script>`）で完結し、共通スタイルとして `../../assets/style.css` を、トップページへの導線として `.back-link` から `../../index.html` を参照する。アプリ間でJSコードを共有したり、個別のビルド処理を持ったりはしない。
- 各アプリディレクトリには `index.html` に加えて `manifest.json` / `icon.svg` / `sw.js` を置き、そのアプリ単体をChromeに「インストール」できるようにしている（詳細は後述）。
- `apps/_template/` — 新しいアプリを作る際にコピーするひな形。共通スタイルシートと戻るリンク、Chromeインストール対応用の `manifest.json`/`icon.svg`/`sw.js` が既に組み込まれている。
- `assets/style.css` — ランディングページと全アプリで使う共通スタイル（`.page`, `.page-header`, `.back-link`、ランディングページ用の `.app-grid`/`.app-card` など）。
- `.github/workflows/deploy-pages.yml` — `main` へのpushのたびに、リポジトリルート全体をPagesのアーティファクトとしてデプロイする。成功させるには、リポジトリ設定（Settings > Pages）で Source を "GitHub Actions" にしておく必要がある。ワークフローの `GITHUB_TOKEN` にはリポジトリ管理者権限がないため、この設定をワークフロー側から自動で行うことはできない。

## 新しいアプリの追加手順

1. `apps/_template/` を `apps/<新しいアプリ名>/` としてコピーする。
2. `apps/<新しいアプリ名>/index.html` にアプリを実装する（共通スタイルは `../../assets/style.css` を参照）。
3. `apps.json` に対応するエントリ（`name`, `path`, `description`）を追加し、ランディングページに表示されるようにする。
4. `manifest.json` の `name`/`short_name` と `icon.svg` 内の1文字を新しいアプリに合わせて書き換える（Chromeへのインストール時に使われる名前とアイコンになる）。
5. `README.md` の「構成」のディレクトリツリーと「アプリ一覧」に、追加したアプリの説明を追記する（後述の「README.mdの更新」を参照）。
6. `main` にpushすると GitHub Actions が自動でデプロイする。

## README.mdの更新

以下のいずれかに該当する変更を行った場合は、必ず `README.md` も合わせて更新すること。

- 新規アプリの作成: 「構成」のディレクトリツリーと「アプリ一覧」に、そのアプリの説明を追記する。
- 既存アプリへの機能追加: 「アプリ一覧」内の該当アプリの説明に、追加した機能を追記する。
- 既存アプリの機能修正: 「アプリ一覧」内の該当アプリの説明が、修正後の実際の挙動と食い違わないように更新する。

README.md はこのリポジトリの唯一のドキュメントであり、実装との乖離はそのまま利用者への誤情報になるため、コード変更と同じコミット/PRの中で更新する。

## Chromeへの「アプリとしてインストール」対応

各アプリディレクトリは独立したPWA（Progressive Web App）としてChromeにインストール可能になっている。トップページ (`index.html`) 自体はインストール対象ではなく、各アプリ個別にインストールする設計。

- `manifest.json` — アプリ名・アイコン・`display: "standalone"` などを定義。`start_url`/`scope` はいずれもそのアプリのディレクトリ内に閉じる。
- `icon.svg` — ブランドカラー（`#3457d5`）の角丸背景に白文字1文字を配置しただけのシンプルなベクターアイコン。192x192/512x512として`manifest.json`から参照される。
- `sw.js` — キャッシュは行わない最小限のService Worker。Chromeのインストール要件を満たすためだけに登録している。
- 各 `index.html` の `<head>` に `<link rel="manifest">` と `<link rel="icon">`、`<meta name="theme-color">` を、`<body>` 内に `sw.js` を登録する小さな `<script>` を追加している。
