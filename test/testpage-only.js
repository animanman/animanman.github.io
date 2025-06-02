document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('main');
    const footerDiv = document.querySelector('footer > div');
    const footerElement = document.querySelector('footer');

    mainElement?.insertAdjacentHTML('afterbegin', '<div class="testpage_yome"><p>このページはあにまん検索【非公式】のテストページです。機能しない機能が沢山あります。<br />正規版は<a href="https://animanman.github.io/">こちら</a>からどうぞ</p></div>');
    footerDiv?.insertAdjacentHTML('beforeend', '<p><a href="https://github.com/animanman/animanman.github.io/tree/main/test">github(test)</a></p><p><a href="/test/other/">その他</a></p>');

footerElement?.insertAdjacentHTML('afterend', `
<style>
.testpage_yome {
    background-color: #f0f0f0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 5px 0;
}
.testpage_yome p {
    color: #333;
    font-size: 14px;
}
.testpage_yome a {
    color: #007bff;
    text-decoration: none;
}
.testpage_yome a:hover {
    text-decoration: underline;
}
</style>
`);

});
