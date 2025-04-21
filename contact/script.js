document.getElementById('InlineFrameContact').addEventListener('load', function() {
  iFrameResize({
    heightCalculationMethod: 'documentElementScroll',
    checkOrigin: false
  }, '#InlineFrameContact');
});

