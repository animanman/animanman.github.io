Vue.createApp({
      // Jekyllとの記法競合回避のためのデリミタ変更
      delimiters: ['[[', ']]'],
      data() {
        return {
          // ヘッダー用リンク配列
          headerLinks: [
            { text: 'ホーム', url: '/' },
            { text: 'About', url: '/about' },
            { text: 'テスト版', url: '/test' },
            { text: 'その他', url: '/test/other' },
            { text: 'お問い合わせ', url: 'https://zawazawa.jp/animamman/topic/1' }
          ],
          // フッター用リンク配列（必要に応じて他の場所のリンクも追加）
          footerLinks: [
            { text: 'animanman.github.io', url: '/' },
            { text: 'github', url: 'https://github.com/animanman/animanman.github.io/' }
          ]
        }
      }
    }).mount('#templateapp')
