$(function() {
    const google_url = 'https://www.google.com/search?q=';
    const s_abbs_url = 'site:bbs.animanch.com/board/';
    const enc_s_abbs_url = encodeURIComponent(s_abbs_url);

    // SNSボタンの動作設定
    $('div.btn').each(function () {
        const btnId = $(this).attr('id');
        if (btnId === 'tws_btn') {
            $(this).wrap(`<a href="http://twitter.com/share?text=${encodeURIComponent($('title').html())}&url=${encodeURIComponent(location.href)}" target="_blank"></a>`);
        } else if (btnId === 'cps_btn') {
            $(this).on('click', () => navigator.clipboard.writeText(`${$('title').html()} ${location.href}`));
        }
    }).on('click', function () {
        $(this).css({ 'background-color': 'var(--amm3)' });
        $(this).children('i').css({ 'color': 'var(--amm2)' });
    });

    // 検索ボタンの動作設定
    $('main button').on('click', function () {
        let query = encodeURIComponent($('input#q').val().trim()); // 検索語句
        const selectedCategory = $('select#s_category').val();
        const selectedCategoryText = encodeURIComponent($('select#s_category option:selected').text());
        let additionalFilters = "";

        // 日付指定がある場合
        const bfDay = $('input[name="bfday"]').val();
        const afDay = $('input[name="afday"]').val();
        if (bfDay) {
            additionalFilters += ` before:${bfDay}`;
        }
        if (afDay) {
            additionalFilters += ` after:${afDay}`;
        }

        // 一文字の場合に '>' を付加
        if (query.length === 1) {
            query = `>${query}`;
        }

        const searchUrl = selectedCategory.includes('category')
            ? `${google_url}${enc_s_abbs_url}+${query}+"カテゴリ『${decodeURIComponent(selectedCategoryText)}』"${additionalFilters}`
            : `${google_url}${enc_s_abbs_url}+${query}${additionalFilters}`;

        // 新しいタブで検索結果を表示
        window.open(searchUrl, '_blank');
        alert(`『${decodeURIComponent(query)}』${selectedCategory.includes('category') ? ` (カテゴリ『${decodeURIComponent(selectedCategoryText)}』)` : ''}${additionalFilters ? ` (${additionalFilters.trim()})` : ''} で検索しました`);
    });
});
