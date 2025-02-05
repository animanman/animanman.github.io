# [animanman.github.io/test/]( https://animanman.github.io/test/)
あにまん検索【非公式】のテストページです

正規版ページは[こちら](https://animanman.github.io/)\
正規版のソースは[こちら](https://github.com/animanman/animanman.github.io/)

[連絡先](https://zawazawa.jp/animamman/topic/1)

## 機能実装
- <ins>**2025/1/22**</ins>\
  testページ作成
  
  完成品のindex.htmlとして上げる時に最小限の要所変更で済むように _testpage-only.js_ で注意書きを差し込むjsを作成
  
  上のしくみを応用してanimanman.github.ioのドメイン以外でjsファイルが読み込まれると広告が出るように作成
  
  わかりやすいようにオプションのラベルの::beforeにfont awesomeのアイコンを配置
  
  将来機能させたいボタンを配置

 - <ins>**2025/1/26**</ins>\
   details、summaryでとりあえずオプションの折りたたみ設置
   ついでに折りたたみの開閉で.opt_t(オプションのタイトル)::beforeのマークの向きを変えるように

   input#qのfocus-visibleをoutline:none;にし、.kensaku_boxにoutlineを引くように\
   ついでに❌で#qの文字列を消せるように

   .opt(オプション)のリセットボタンがそれぞれ効くように

   チェックを入れているとカテゴリごとの過去ログ倉庫のリンクが反映されるように(日付指定も対応)

   Googleの他にYahooJapanとDuckDuckGoに一応対応(Bing、Braveはまだ)

 - <ins>**2025/2/5**</ins>\
   チェックボックスの挙動修正\
   Bing、Braveの検索対応\

### 実装予定
- オプション折りたたみ
- 検索履歴
- SNSエゴサ用リンク

- 検索履歴などに使うモーデル画面の作成
