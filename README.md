# web-tools

簡易的なWebアプリを複数配置し、GitHub Pagesでまとめて公開するためのリポジトリです。

## 構成

```
.
├── index.html          # 各アプリへのリンク一覧（トップページ）
├── apps.json           # index.html が読み込むアプリ一覧データ
├── assets/
│   └── style.css        # 共通スタイル
├── apps/
│   ├── _template/            # 新しいアプリを作る際のひな形
│   ├── example/               # サンプルアプリ
│   └── favicon-generator/      # favicon作成ツール
└── .github/workflows/deploy-pages.yml  # GitHub Pagesへの自動デプロイ
```

## アプリ一覧

### サンプルアプリ (`apps/example/`)

新しいアプリを追加する際のひな形です。カウンターの動作を確認できます。

### favicon作成ツール (`apps/favicon-generator/`)

文字を入力してシンプルなfaviconを作成し、PNGおよびICO形式でダウンロードできるツールです。

- **入力項目**
  - 文字（最大4文字。空の場合は「W」を表示）
  - 背景色（カラーピッカー）
  - 文字色（カラーピッカー）
  - 形（四角 / 角丸四角 / 円）
  - フォント（ゴシック体 / 明朝体 / 等幅）
- **プレビュー**
  - 入力内容に応じてリアルタイムにcanvasへ描画
  - 実際のブラウザタブでの見え方を確認できるよう、このページ自体のfaviconも同時に更新
- **ダウンロード（PNG）**
  - 16x16 / 32x32 / 48x48 / 64x64 / 128x128 / 180x180（Apple touch icon向け） / 512x512 の各サイズをPNG形式で個別にダウンロード可能
  - 文字が背景の80%幅に収まるようフォントサイズを自動調整
- **ダウンロード（ICO）**
  - 16x16 / 32x32 / 48x48 / 256x256 を内包したマルチ解像度の `favicon.ico` をダウンロード可能
  - C#のWinFormsアプリなど、`Form.Icon`やプロジェクトのアプリケーションアイコンとして `.ico` が必要な場面向け
- **その他**
  - 外部ライブラリを使用せず、Canvas APIとICOファイルフォーマットの自前実装のみで完結（オフラインでも動作）

## 新しいアプリを追加する手順

1. `apps/_template/` を `apps/<新しいアプリ名>/` としてコピーする
2. `apps/<新しいアプリ名>/index.html` を編集してアプリを実装する
   （共通スタイルは `../../assets/style.css` を参照）
3. `apps.json` に以下の形式でエントリを追加する

   ```json
   {
     "name": "アプリの表示名",
     "path": "apps/<新しいアプリ名>/",
     "description": "アプリの簡単な説明"
   }
   ```

4. `main` ブランチにpushすると GitHub Actions が自動でGitHub Pagesにデプロイします。

## GitHub Pagesの設定

リポジトリの Settings > Pages で、Source を "GitHub Actions" に設定してください。
`.github/workflows/deploy-pages.yml` が `main` ブランチへのpushをトリガーに
自動でビルド・デプロイを行います。
