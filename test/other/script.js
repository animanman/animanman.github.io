// after: test/other/script.js
// ※Vue の読み込みは default.html で済んでいる想定です
Vue.createApp({
  // Jekyll の Liquid と競合しないように delimiters を変更
  delimiters: ['[[', ']]'],
  data() {
    return {
      scriptGroups: [
        {
          heading: "Tampermonkey 用スクリプト",
          scripts: [
            {
              title: "下書き保存ツール",
              url: "https://animanman.github.io/test/other/anm-Draftsavingtool.js",
              installurl: "https://animanman.github.io/test/other/anm-Draftsavingtool.user.js",
              description: "下書き保存を保存したり、書き込む時に安価先のレスを書き込みフォームの上に表示したりします"
            }
            // ここに他のスクリプトを追加できます
          ]
        }
        // 他にセクション（group）があれば、ここにオブジェクトを追加
      ]
    };
  }
}).mount("#otherapp");
