const { createApp } = Vue;
  createApp({
    data() {
      return {
        open: false  // 折りたたみの状態
      }
    }
  }).mount('#iframecontainer');

$(window).on('load', function() {
  
  var $widget = $('iframe#zawazawa-embed-animamman-1-e1,iframe#InlineFrameContact');
  var $widgetContents = $widget.contents();
  $widgetContents.find('head').append('<link href="https://animanman.github.io/contact/if.css" rel="stylesheet" type="text/css">');

});
