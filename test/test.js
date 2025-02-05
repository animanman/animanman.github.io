$(function () {
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

    
    const SearchMapping = {
        se_Google: {
            baseUrl: 'https://www.google.com/search?q=',
            supportsDate: true,
            dateFormat: (bfDay, afDay) => 
                `${bfDay ? `before:${bfDay}` : ''}${afDay ? ` after:${afDay}` : ''}`
        },
        se_YahooJ: {
            baseUrl: 'https://search.yahoo.co.jp/search?p=',
            supportsDate: true,
            dateFormat: (bfDay, afDay) => 
                `${bfDay ? `before:${bfDay}` : ''}${afDay ? ` after:${afDay}` : ''}`,
            customUrl: (query, categoryText, additionalFilters) => 
                `https://search.yahoo.co.jp/search?p=${query}${categoryText ? `+カテゴリ『${categoryText}』` : ''}${additionalFilters}&vs=bbs.animanch.com/board/`
        },
        se_Bing: {
            baseUrl: 'https://www.bing.com/search?q=',
            supportsDate: false,
            dateFormat: () => ''
        },
        se_DDG: {
            baseUrl: 'https://duckduckgo.com/?q=',
            supportsDate: true,
            dateFormat: (bfDay, afDay) => `&df=${afDay || ''}..${bfDay || ''}`
        },
        se_Brave: {
            baseUrl: 'https://search.brave.com/search?q=',
            supportsDate: false,
            dateFormat: () => ''
        }
    };
    
    $('#search_button').on('click', function () {
        const query = encodeURIComponent($('#q').val().trim());
        const selectedCategory = $('#s_category').val();
        const selectedCategoryText = encodeURIComponent($('#s_category option:selected').text());
        const bfDay = $('#ds_bfday').val();
        const afDay = $('#ds_afday').val();
        const finalQuery = query.length === 1 ? `>${query}` : query;
    
        const selectedEngine = $('#s_engine').val()?.trim();
const normalizedEngine = selectedEngine 
    ? Object.keys(SearchMapping).find(key => key.toLowerCase() === selectedEngine.toLowerCase()) 
    : null;
const engineConfig = normalizedEngine ? SearchMapping[normalizedEngine] : null;

if (!engineConfig) {
    alert('無効な検索エンジンが選択されています。');
    return;
}

    
        const additionalFilters = engineConfig.supportsDate 
            ? engineConfig.dateFormat(bfDay, afDay) 
            : '';
    
        // カテゴリ部分を復元
        const categoryText = selectedCategory.includes('category') 
            ? decodeURIComponent(selectedCategoryText) 
            : '';
    
        // Yahoo Japan の場合はカスタム URL を使用
        const searchUrl = selectedEngine === 'se_YahooJ'
            ? engineConfig.customUrl(finalQuery, categoryText, additionalFilters)
            : `${engineConfig.baseUrl}${enc_s_abbs_url}+${finalQuery}${categoryText ? `+カテゴリ『${categoryText}』` : ''}${engineConfig.supportsDate ? additionalFilters : ''}`;
    
        window.open(searchUrl, '_blank');
        alert(`『${decodeURIComponent(query)}』${categoryText ? ` (カテゴリ『${categoryText}』)` : ''}${additionalFilters.trim() ? ` (${additionalFilters.trim()})` : ''} を${selectedEngineName}で検索しました`);
    });
    


    // チェックボックスとリンクの対応
    const linkMapping = {
        '#s_anm1': 'https://bbs.animanch.com/search/',
        '#s_anm2': 'https://bbs.animanch.com/search2/',
        '#s_anm3': 'https://bbs.animanch.com/searchRes/'
    };

    function updateLinks() {
        const query = $('#q').val().trim(); // 検索ワード
        const futanDiv = $('#futan').empty();
        const selectedCategory = $('#s_category').val(); // 選択されたカテゴリ
        const bfDay = $('#ds_bfday').val(); // 指定された日付
        const encodedQuery = encodeURIComponent(query.length === 1 ? `>${query}` : query);
        const isKakologChecked = $('#kakolog').is(':checked'); // 過去ログチェックボックスの状態
    
        // `#kakolog` がチェックされておらず、検索ワードもない場合は警告メッセージを表示
        if (!query && !isKakologChecked) {
            futanDiv.append('<p>検索ワードを入力してください。</p>');
            return;
        }
    
        // `anm_nai_search` のチェックボックスのリンクを先に追加
        if (query) {
            Object.entries(linkMapping).forEach(([checkbox, baseUrl]) => {
                if ($(checkbox).is(':checked')) {
                    futanDiv.append(`<p><a href="${baseUrl}${encodedQuery}" target="_blank">${$(checkbox).next('label').text()}</a></p>`);
                }
            });
        }
    
        // `#kakolog` のリンクは最後に追加
        if (isKakologChecked) {
            let kakologBaseUrl = 'https://bbs.animanch.com/kakolog';
    
            // カテゴリ指定がある場合
            if (selectedCategory && selectedCategory !== '') {
                const categoryNumber = selectedCategory.replace('category', ''); // category番号を抽出
                kakologBaseUrl += `${categoryNumber}`;
            }
    
            // 日付指定がある場合
            if (bfDay) {
                kakologBaseUrl += `/${bfDay}`;
            }
    
            // URLの末尾を整形
            if (!kakologBaseUrl.endsWith('/')) {
                kakologBaseUrl += '/';
            }
    
            // `#kakolog` のリンクを追加（最後に追加することで `anm_nai_search` のリンクより下に表示）
            futanDiv.append(`<p><a href="${kakologBaseUrl}" target="_blank">カテゴリー過去ログ${bfDay ? ` (${bfDay})` : ''}</a></p>`);
        }
    }
    
    // 検索ワード、カテゴリ、日付、チェックボックスの変更を監視
    $('#q').on('input', updateLinks);
    $('input[type="checkbox"], #s_category, #ds_bfday').on('change', updateLinks);
    
    // 初期化処理
    updateLinks();
    
    
    // #q_clearをクリックしたときに入力フィールドをクリアし、リンクを更新
$('#q_clear').on('click', () => {
    $('#q').val('');
    updateLinks(); // クリア後にリンクを更新
});

// リセットボタンの動作設定
$('.reset_bottons').on('click', function () {
    const parentOpt = $(this).closest('.opt');
    parentOpt.find('select').prop('selectedIndex', 0);
    parentOpt.find('input[type="text"], input[type="number"], input[type="date"]').val('');
    parentOpt.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);

    // #rscb なら #futan を空にするのではなく、updateLinks() を実行
    if ($(this).is('#rscb') || $(this).is('#rsb')) {
        updateLinks();
    }
});






    // 広告挿入
    const allowedDomain = 'animanman.github.io';
    if (!location.hostname.includes(allowedDomain)) {
        const insertionTarget = $('main').length ? $('main') : $('header nav').length ? $('header nav') : $('header');
        insertionTarget.prepend(`
            <div class="anisearch_ad">
                <a href="https://${allowedDomain}/" target="_blank">
                    <p>このサイトが気に入ったら<span>こちら</span>も使ってみてね</p>
                </a>
            </div>
        `);
    }

    // スタイル挿入
    $('footer').after(`
        <style>
        .anisearch_ad {
            background-color:#dcc9fb;
            border: 1px solid #7d74c7;
            border-radius: 5px;
            color: #7d74c7;
            position: relative;
            z-index: 1;
            text-align: center;

            
            & a{
                display:inline-block;
                width:100%;
                padding: 15px;
                

                & p{
                    margin: 0;
                    font-size: 16px;

                    & span{
                        color: #fff;
                        text-decoration: underline;
                    }
                }

            }

            &::after{
                content: "";
                padding: 23px;
                background-color:#bb95f8;
                mask:url("https://animanman.github.io/commons/rogo.svg#animanman") no-repeat center;
                position: absolute;
                right: 0;
                z-index: -1;
            }
        }
        </style>
    `);
});
