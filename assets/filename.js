// 各アプリ共通のタイムスタンプ付きファイル名生成処理。
(function (global) {
  'use strict';

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  // 例: timestamp() -> "20260917-1200"
  function timestamp(date) {
    const d = date || new Date();
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
      '-' + pad2(d.getHours()) + pad2(d.getMinutes());
  }

  // 例: timestamped('resized_images', 'zip') -> "resized_images_20260917-1200.zip"
  function timestamped(prefix, ext) {
    return prefix + '_' + timestamp() + '.' + (ext || 'json');
  }

  global.Filename = { timestamp, timestamped };
}(window));
