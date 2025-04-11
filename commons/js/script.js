const headerapp = Vue.createApp({
  // Jekyllとの記法競合回避のためのデリミタ変更
      delimiters: ['[[', ']]'],
  data() {
    return {
      // 例：ヘッダー用のデータ
      headerLinks: [
        { text: 'ホーム', url: '/' },
        { text: 'About', url: '/about' },
        { text: 'テスト版', url: '/test' },
        { text: 'その他', url: '/test/other' },
        { text: 'お問い合わせ', url: 'https://zawazawa.jp/animamman/topic/1' }
      ]
    }
  }
});
headerapp.mount('#headerapp');

const footerapp = Vue.createApp({
  // Jekyllとの記法競合回避のためのデリミタ変更
      delimiters: ['[[', ']]'],
  data() {
    return {
      // 例：フッター用のデータ
      footerLinks: [
        { text: 'animanman.github.io', url: '/' },
        { text: 'github', url: 'https://github.com/animanman/animanman.github.io/' }
      ]
    }
  }
});
footerapp.mount('#footerapp');

