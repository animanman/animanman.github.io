window.addEventListener('load', function() {
  iFrameResize({
    heightCalculationMethod: 'documentElementScroll', // または 'max'
    checkOrigin: false
  }, '#InlineFrameContact');
});

