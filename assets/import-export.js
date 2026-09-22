// 各アプリ共通のJSONエクスポート・インポート処理。
// 使い方は README.md の「ブラウザへのデータ保存とエクスポート・インポート」を参照。
(function (global) {
  'use strict';

  // 例: timestampedFilename('regex-sets') -> "regex-sets_20260917-1200.json"
  // 実体は assets/filename.js の Filename.timestamped()。このアプリの index.html で
  // import-export.js より先に filename.js を読み込んでおくこと。
  function timestampedFilename(prefix, ext) {
    return global.Filename.timestamped(prefix, ext);
  }

  function exportJson(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ファイル選択ダイアログを開き、選択されたJSONファイルをパースして onImport に渡す。
  // onImport 内で throw するとパースエラーと同様に onError に渡される。
  function importJson(options) {
    const opts = options || {};
    const onImport = opts.onImport;
    const onError = opts.onError || function (e) {
      alert('インポートに失敗しました: ' + e.message);
    };
    const accept = opts.accept || 'application/json';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.hidden = true;
    document.body.appendChild(input);

    input.addEventListener('change', () => {
      const file = input.files[0];
      input.remove();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          onImport(parsed);
        } catch (e) {
          onError(e);
        }
      };
      reader.onerror = () => {
        onError(reader.error || new Error('ファイルの読み込みに失敗しました'));
      };
      reader.readAsText(file);
    });

    input.click();
  }

  global.ImportExport = { exportJson, importJson, timestampedFilename };
}(window));
