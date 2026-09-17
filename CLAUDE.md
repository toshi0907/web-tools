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

- `index.html` — トップのランディングページ。実行時に `apps.json` を fetch し、`#app-grid` に1エントリ1カード（各アプリの `icon.svg` とアプリ名を横並びで表示するリンクを縦1列に並べたもの。`description` はカードには表示しない）として描画する。個々のアプリの情報をビルド時に持たない。
- `apps.json` — ランディングページに表示するアプリの唯一の情報源。各エントリは `{ "name": ..., "path": "apps/<アプリ名>/", "description": ... }` の形式。`apps/` 配下に `index.html` を置くだけではランディングページに表示されず、必ずここにもエントリを追加する必要がある。`description` はランディングページのカードには表示されないが、README.mdのアプリ一覧などに使うため引き続き記述する。
- `apps/<アプリ名>/index.html` — 各アプリはHTML1ファイル（マークアップ＋インライン`<script>`）で完結し、共通スタイルとして `../../assets/style.css` を、トップページへの導線として `.back-link` から `../../index.html` を参照する。個別のビルド処理は持たない。アプリ間のJSコード共有は基本的に行わないが、`assets/import-export.js`（後述のエクスポート・インポート処理）のように複数アプリで確実に必要になる汎用処理に限り、`assets/` 配下の共通スクリプトとして切り出し、各アプリの `index.html` から `<script src="../../assets/xxx.js"></script>` で読み込む。
- 各アプリディレクトリには `index.html` に加えて `manifest.json` / `icon.svg` / `sw.js` を置き、そのアプリ単体をChromeに「インストール」できるようにしている（詳細は後述）。
- `apps/_template/` — 新しいアプリを作る際にコピーするひな形。共通スタイルシートと戻るリンク、Chromeインストール対応用の `manifest.json`/`icon.svg`/`sw.js` が既に組み込まれている。
- `assets/style.css` — ランディングページと全アプリで使う共通スタイル（`.page`, `.page-header`, `.back-link`、ランディングページ用の `.app-grid`/`.app-card` など）。
- `.github/workflows/deploy-pages.yml` — `main` へのpushのたびに、リポジトリルート全体をPagesのアーティファクトとしてデプロイする。成功させるには、リポジトリ設定（Settings > Pages）で Source を "GitHub Actions" にしておく必要がある。ワークフローの `GITHUB_TOKEN` にはリポジトリ管理者権限がないため、この設定をワークフロー側から自動で行うことはできない。

## ページの横幅

各アプリのページ（`.page`）は横幅に上限を設けず、ブラウザの画面幅いっぱいに広がる。共通スタイル（`assets/style.css`）の `.page` に `max-width` を指定していないため、新しいアプリを作る際に特別な対応は不要。

ただし、盤面やキャンバスなど画面幅に比例して内部要素のサイズが決まるアプリでは、無制限に幅を広げると意図しない拡大や崩れを招くことがある。そのアプリの `<style>` 内で `.page` に個別で `max-width` を指定し、幅を固定して対応している。
- `apps/animal-shogi/` — 将棋盤のマス目が画面幅に応じて拡大されてしまうため
- `apps/whiteboard-memo/` — ウィンドウのリサイズ時にホワイトボードの描画内容を縦横比を保たず引き伸ばして再描画する実装のため、画面幅の変化が頻発すると描画が歪む

新しいアプリを作る際も、広い画面幅で表示が崩れないか確認し、崩れる場合のみそのアプリの `<style>` で `.page` の `max-width` を上書きする。

## ブラウザへのデータ保存とエクスポート・インポート

アプリが `localStorage` や `IndexedDB` などブラウザ側にユーザーデータ（登録した設定、入力内容、履歴など）を保存する場合は、そのデータのエクスポート・インポート機能を必ず実装すること。ブラウザやデバイスを変えたとき、あるいはキャッシュ削除などで保存内容が失われたときに、ユーザーが手元のファイルから復元できるようにするため。

- エクスポート: 保存しているデータをJSON等の形式でファイルとしてダウンロードできるボタンを用意する。
- インポート: エクスポートしたファイルを選択して読み込み、既存データへの「追加」または「置き換え」を選べるようにする。
- データがJSONでそのまま表現できる場合は、共通スクリプト `assets/import-export.js` の `ImportExport.exportJson(data, filename)` / `ImportExport.importJson({ onImport, onError })` を利用する（ファイル名の生成には `ImportExport.timestampedFilename(prefix)` が使える）。アプリの `index.html` で `<script src="../../assets/import-export.js"></script>` を読み込んでから使用する。実装例として `apps/regex-replacer/` や `apps/home-dashboard/` を参照。
- 画像やホワイトボードの描画などテキストで表現しづらいデータの場合は、`ImportExport` の対象外のため、個別ダウンロードやZIPでの一括ダウンロードなど、可能な範囲でエクスポート手段を検討する。

## 新しいアプリの追加手順

1. `apps/_template/` を `apps/<新しいアプリ名>/` としてコピーする。
2. `apps/<新しいアプリ名>/index.html` にアプリを実装する（共通スタイルは `../../assets/style.css` を参照）。ブラウザにデータを保存するアプリの場合は、上記の「ブラウザへのデータ保存とエクスポート・インポート」に従ってエクスポート・インポート機能も実装する。
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

## myskillsスキルの利用について

[myskills](https://github.com/toshi0907/myskills) リポジトリを `.myskills` にsubmoduleとして追加してある。myskills側の[組み込み手順](https://github.com/toshi0907/myskills/blob/main/docs/skill-integration-submodule.md)に従って以下を設定すると、`.claude/skills/` からスキルを利用できるようになる（このコミットの時点ではまだ未設置）。

1. `.claude/skills` を `.myskills/claude-skills` へのsymlinkにする。
2. Claude Code on the web（使い捨て環境）向けに、セッション開始時に `.myskills` を最新化するSessionStart hook（`.myskills/scripts/session-start-hook/` を参照）を設置する。外部リポジトリ由来のスクリプトを自動実行させる設定になるため、内容を確認した上でリポジトリ管理者が設置すること。

設置後は、実装作業を始める前に `.claude/skills/` にあるスキルの一覧と各 `SKILL.md` の description を確認し、該当するものがあれば優先的に使うこと。

myskills側の更新を取り込みたい場合は `git submodule update --init --remote -- .myskills` を実行する。
