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
│   ├── _template/        # 新しいアプリを作る際のひな形
│   └── example/           # サンプルアプリ
└── .github/workflows/deploy-pages.yml  # GitHub Pagesへの自動デプロイ
```

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
