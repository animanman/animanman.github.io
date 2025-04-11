Vue.createApp({
      // Jekyllとの記法競合回避のためのデリミタ変更
      delimiters: ['[[', ']]'],
      data() {
        return {
          // ヘッダー用リンク配列
          headerLinks: [
            { text: 'ホーム', url: '/' },
            { text: 'About', url: '/about' },
            { text: 'サービス', url: '/services' },
            { text: 'お問い合わせ', url: '/contact' }
          ],
          // フッター用リンク配列（必要に応じて他の場所のリンクも追加）
          footerLinks: [
            { text: 'プライバシーポリシー', url: '/privacy' },
            { text: '利用規約', url: '/terms' },
            { text: 'サイトマップ', url: '/sitemap' }
          ]
        }
      }
    }).mount('#templateapp')
