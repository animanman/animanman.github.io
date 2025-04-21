const { createApp } = Vue;
  createApp({
    data() {
      return {
        open: false  // 折りたたみの状態
      }
    }
  }).mount('#iframecontainer');
