$(function(){
    // 初期状態で非表示にしたい場合は外してもOK
    $('#iframecontainer .iframe-container').hide();

    // 折りたたみトグル
    $('#iframeFolding').on('click', function(){
      // this の次の .iframe-container を開閉
      $(this).next('.iframe-container').slideToggle(300);
      // （もし折りたたみ見出しの開閉状態をクラスで管理したい場合）
      $(this).toggleClass('open');
    });
  });
