// load イベント後に呼ぶのが安全
  window.addEventListener('load', function() {
    iFrameResize({
      // 高さをどの要素基準で計算するか
      heightCalculationMethod: 'bodyOffset',
      // origin チェックを無効に（必要に応じて設定）
      checkOrigin: false,
      // ログを出したいとき
      // log: true
    }, '#InlineFrameContact');
  });

