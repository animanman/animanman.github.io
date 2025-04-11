Vue.createApp({
  delimiters: ['[[', ']]'],
  data() {
    return {
      navLinks: [
        { text: 'ホーム', url: '/' },
        { text: 'About', url: '/about' },
        { text: 'サービス', url: '/services' },
        { text: 'お問い合わせ', url: '/contact' }
      ]
    }
  }
}).mount('#navapp')
