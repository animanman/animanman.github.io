// commons/js/script.js

// ====================
// ヘッダー用 Vue アプリ
// ====================
const headerapp = Vue.createApp({
  // Jekyll と競合しないようにデリミタを [[ で変更
  delimiters: ['[[', ']]'],
  data() {
    return {
      navOpen: false,
      // headerLinks を手動で定義しているが、
      // Jekyll 側で site.navigation を流し込みたければ Liquid で書き換え可能
      headerLinks: [
        { text: 'ホーム',     url: '/' },
        { text: 'About',    url: '/about/' },
        { text: 'テスト版',  url: '/test/' },
        { text: 'その他',    url: '/test/other/' },
        { text: 'お問い合わせ', url: 'https://zawazawa.jp/animamman/topic/1' }
      ]
    };
  },
  methods: {
    toggleNav() {
      this.navOpen = !this.navOpen;
      this.$nextTick(() => {
        const ul = this.$refs.navList;
        if (ul) {
          ul.style.maxHeight = this.navOpen
            ? ul.scrollHeight + 'px'
            : '0';
        }
      });
    }
  }
});
headerapp.mount('#headerapp');

// ====================
// フッター用 Vue アプリ
// ====================
const footerapp = Vue.createApp({
  delimiters: ['[[', ']]'],
  data() {
    return {
      footerLinks: [
        { text: 'animanman.github.io', url: '/' },
        { text: 'GitHub',             url: 'https://github.com/animanman/animanman.github.io/' }
      ]
    };
  }
});
footerapp.mount('#footerapp');


