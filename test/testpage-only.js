document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('main');
    const footerDiv = document.querySelector('footer > div');

    mainElement?.insertAdjacentHTML('afterbegin', '<div class="testpage_yome"><p>このページはあにまん検索【非公式】のテストページです<br />正規版は<a href="https://animanman.github.io/">こちら</a>からどうぞ</p></div>');
    footerDiv?.insertAdjacentHTML('beforeend', '<p><a href="https://github.com/animanman/animanman.github.io/tree/main/test">github(test)</a></p>');

});
