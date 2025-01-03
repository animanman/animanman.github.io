const google_url = 'https://www.google.com/search?q=';
const s_abbs_url = 'site:bbs.animanch.com/board/';
const enc_s_abbs_url = encodeURIComponent(s_abbs_url);

$(function() {
    const href = encodeURIComponent(location.href);
    const title = encodeURIComponent($('title').html());

    // SNSボタンの動作設定
    $('div.btn').each(function () {
        const btnId = $(this).attr('id');
        if (btnId === 'tws_btn') {
            $(this).wrap(`<a href="http://twitter.com/share?text=${title}&url=${href}" target="_blank"></a>`);
        } else if (btnId === 'cps_btn') {
            $(this).on('click', () => navigator.clipboard.writeText(`${title} ${location.href}`));
        }
    }).on('click', function () {
        $(this).css({ 'background-color': 'var(--amm3)' });
        $(this).children('i').css({ 'color': 'var(--amm2)' });
    });
    
    // Google検索ボタンの動作設定
    $('main button').on('click', function () {
    const query = encodeURIComponent($('input#q').val());
    const selectedCategory = $('select#s_category').val();
    let selectedCategoryText = $('select#s_category option:selected').text();

    if (selectedCategory.includes('category')) {
        selectedCategoryText = `カテゴリ『${selectedCategoryText}』`;
    }
    const encodedCategoryText = encodeURIComponent(selectedCategoryText);

    const searchUrl = selectedCategory.includes('category')
        ? `${google_url}${enc_s_abbs_url}+${query}+"${encodedCategoryText}"`
        : `${google_url}${enc_s_abbs_url}+${query}`;

    window.open(searchUrl, '_blank');
    alert(`『${decodeURIComponent(query)}』${selectedCategory.includes('category') ? ` (${decodeURIComponent(selectedCategoryText)})` : ''} で検索しました`);
});

    $(function() {
    // チェックボックスとリンクの対応を定義
    const linkMapping = {
        '#s_anm1': 'https://bbs.animanch.com/search/',
        '#s_anm2': 'https://bbs.animanch.com/search2/',
        '#s_anm3': 'https://bbs.animanch.com/searchRes/'
    };

    // リンクを更新する関数
    function updateLinks() {
        let query = $('#q').val().trim(); // 入力値を取得し、空白をトリム
        const futanDiv = $('#futan');
        futanDiv.empty(); // 既存のリンクをクリア

        if (!query) {
            futanDiv.append('<p>検索ワードを入力してください。</p>');
            return;
        }

        // 一文字の場合は ">" を付け足す
        if (query.length === 1) {
            query = `>${query}`;
        }

        const encodedQuery = encodeURIComponent(query);

        // 各チェックボックスの状態を確認してリンクを生成
        Object.entries(linkMapping).forEach(([checkbox, baseUrl]) => {
            if ($(checkbox).is(':checked')) {
                futanDiv.append(`<p><a href="${baseUrl}${encodedQuery}" target="_blank">${$(checkbox).next('label').text()}</a></p>`);
            }
        });
    }

    // 入力フィールドとチェックボックスの変更を監視
    $('#q').on('input', updateLinks);
    $('input[type="checkbox"]').on('change', updateLinks);
});


});
