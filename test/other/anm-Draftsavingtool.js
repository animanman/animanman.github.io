// ==UserScript==
// @name         下書き保存機能
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  本文の下書きをlocalStorageに保存し、呼び出す機能を追加
// @match        https://bbs.animanch.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // localStorageキー
    const STORAGE_KEY = "drafts";

    // 下書き保存可能な最大件数
    const MAX_DRAFTS = 10;

    // Utility: 現在の下書き配列を取得
    function getDrafts() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Utility: 下書き配列を保存
    function setDrafts(drafts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }

    // 下書き保存用のモーダルを生成
    function createModal() {
        // 既に存在している場合は再利用
        if(document.getElementById('draftModal')) return;

        const modal = document.createElement('div');
        modal.id = "draftModal";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.background = "#fff";
        modal.style.border = "1px solid #ccc";
        modal.style.padding = "20px";
        modal.style.zIndex = "10000";
        modal.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

        // 閉じるボタン
        const closeBtn = document.createElement('span');
        closeBtn.textContent = "×";
        closeBtn.style.float = "right";
        closeBtn.style.cursor = "pointer";
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeBtn);

        // 本文
        const message = document.createElement('p');
        message.textContent = "下書きに保存しますか？";
        modal.appendChild(message);

        // 「はい」ボタン
        const saveBtn = document.createElement('button');
        saveBtn.textContent = "はい";
        saveBtn.addEventListener('click', () => {
            saveDraft();
            document.body.removeChild(modal);
        });
        modal.appendChild(saveBtn);

        // 「他の下書き」ボタン
        const listBtn = document.createElement('button');
        listBtn.textContent = "他の下書き";
        listBtn.style.marginLeft = "10px";
        listBtn.addEventListener('click', () => {
            showDraftList();
        });
        modal.appendChild(listBtn);

        document.body.appendChild(modal);
    }

    // 下書き一覧をモーダルで表示する
    function showDraftList() {
        // 既存の一覧があれば一度削除
        let listModal = document.getElementById('draftListModal');
        if(listModal) {
            document.body.removeChild(listModal);
        }
        listModal = document.createElement('div');
        listModal.id = 'draftListModal';
        listModal.style.position = "fixed";
        listModal.style.top = "50%";
        listModal.style.left = "50%";
        listModal.style.transform = "translate(-50%, -50%)";
        listModal.style.background = "#fff";
        listModal.style.border = "1px solid #ccc";
        listModal.style.padding = "20px";
        listModal.style.zIndex = "10001";
        listModal.style.maxHeight = "80%";
        listModal.style.overflowY = "auto";

        // 閉じるボタン
        const closeBtn = document.createElement('span');
        closeBtn.textContent = "×";
        closeBtn.style.float = "right";
        closeBtn.style.cursor = "pointer";
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(listModal);
        });
        listModal.appendChild(closeBtn);

        const drafts = getDrafts();
        if(drafts.length === 0) {
            const noDraft = document.createElement('p');
            noDraft.textContent = "下書きはありません。";
            listModal.appendChild(noDraft);
        } else {
            drafts.slice(0, MAX_DRAFTS).forEach((draft, index) => {
                const item = document.createElement('div');
                item.style.borderBottom = "1px solid #eee";
                item.style.padding = "5px";
                // 日付と本文冒頭20文字を表示
                item.textContent = `${draft.date} - ${draft.text.substring(0,20)}`;
                item.style.cursor = "pointer";
                item.addEventListener('click', () => {
                    loadDraft(draft);
                    document.body.removeChild(listModal);
                });
                listModal.appendChild(item);
            });
        }

        document.body.appendChild(listModal);
    }

    // 下書きを保存する処理
    function saveDraft() {
        // 日付の取得
        const now = new Date().toLocaleString();

        // スレ立てかレスかで取得する要素が異なる
        // カテゴリーについては、スレ立ての場合はselectの値、
        // レスの場合は #resform の #breadcrumb の2番目の<a>のURLかテキストなどで判断
        let category = "";
        const selectCategory = document.querySelector('#resform select[name="category"]');
        if(selectCategory && selectCategory.offsetParent !== null) {
            // selectが表示されている場合はスレ立て
            category = selectCategory.value;
        } else {
            // レス投稿時：#breadcrumb内の2番目のdivを利用
            const breadcrumbItems = document.querySelectorAll('#resform #breadcrumb [itemtype="http://data-vocabulary.org/Breadcrumb"]');
            if(breadcrumbItems.length >= 2) {
                const a = breadcrumbItems[1].querySelector('a[itemprop="url"]');
                if(a) {
                    // URLやテキストを利用
                    category = a.href || a.textContent;
                }
            }
        }

        // 名前と本文の取得
        const nameEl = document.querySelector('#resform input[name="name"]');
        const textEl = document.querySelector('#resform textarea[name="text"]');
        const name = nameEl ? nameEl.value : "";
        const text = textEl ? textEl.value : "";

        // 下書きオブジェクトの作成
        const draft = {
            date: now,
            category: category,
            name: name,
            text: text
        };

        // 既存の下書きを取得して新規追加（最大件数まで）
        let drafts = getDrafts();
        // 新しい下書きを先頭に追加
        drafts.unshift(draft);
        if(drafts.length > MAX_DRAFTS) {
            drafts = drafts.slice(0, MAX_DRAFTS);
        }
        setDrafts(drafts);
        alert("下書きを保存しました");
    }

    // 下書きをフォームに反映する処理
    function loadDraft(draft) {
        // カテゴリー
        const selectCategory = document.querySelector('#resform select[name="category"]');
        if(selectCategory) {
            // 下書きのカテゴリーが存在する場合、selectの値をセット（選択肢に無い場合は無視）
            selectCategory.value = draft.category;
        }
        // 名前
        const nameEl = document.querySelector('#resform input[name="name"]');
        if(nameEl) {
            nameEl.value = draft.name;
        }
        // 本文
        const textEl = document.querySelector('#resform textarea[name="text"]');
        if(textEl) {
            textEl.value = draft.text;
        }
    }

    // フォームのtextarea上に下書きボタンを設置する
    function insertDraftButton() {
        const textArea = document.querySelector('#resform textarea[name="text"]');
        if(textArea) {
            // ボタン作成
            const btn = document.createElement('button');
            btn.type = "button";
            btn.textContent = "💾"; // アイコンとしてディスクの絵文字など
            btn.style.marginBottom = "5px";
            btn.addEventListener('click', createModal);
            // textareaの直前に挿入
            textArea.parentNode.insertBefore(btn, textArea);
        }
    }

    // 初期化
    function init() {
        // DOMが完全に読み込まれた後に実行
        window.addEventListener('load', () => {
            insertDraftButton();
        });
    }

    init();

})();
