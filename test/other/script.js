Vue.createApp({
      // Jekyllとの記法競合回避のためのデリミタ変更
      delimiters: ['[[', ']]'],
      data() {
        return {
          // 各セクションごとに、headingとその中のスクリプト情報を格納
          scriptGroups: [
            {
              heading: "tampermonkey用スクリプト",
              scripts: [
                {
                  title: "下書き保存ツール",
                  url: "https://animanman.github.io/test/other/anm-Draftsavingtool.js",
                  description: "下書き保存を保存したり、書き込む時に安価先のレスを書き込みフォームの上に表示したりします"
                }
                // 他のスクリプト情報をここに追加可能
              ]
            }
            // 他のグループがある場合は、ここにオブジェクトを追加
          ]
        }
      }
    }).mount("#otherapp")
