// ==UserScript==
// @name         下書き保存機能
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  本文の下書きをlocalStorageに保存し、呼び出す機能に一括削除や個別削除機能を追加（スタイル調整済み）
// @match        https://bbs.animanch.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = "drafts";
    const MAX_DRAFTS = 10;

    // LocalStorage関連のユーティリティ
    const getDrafts = () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    };
    const setDrafts = drafts => localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));

    // モーダル共通の作成ヘルパー
    const createModalElement = (id, zIndex = 10000) => {
        const modal = document.createElement('div');
        modal.id = id;
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.2);
            background: #fff;
            border: 1px solid #ccc;
            padding: 10px;
            z-index: ${zIndex};
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            font-size: 12px;
            max-height: 80%;
            overflow-y: auto;
        `;
        return modal;
    };

    // メインの保存確認モーダル
    const createSaveModal = () => {
        if(document.getElementById('draftModal')) return;
        const modal = createModalElement('draftModal', 10000);

        // モーダル上部に固定する閉じるボタン
        const closeBtn = document.createElement('span');
        closeBtn.textContent = "×";
        closeBtn.style.cssText = `
            position: absolute;
            top: 3px;
            right: 3px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.addEventListener('click', () => modal.remove());
        modal.appendChild(closeBtn);

        const message = document.createElement('p');
        message.textContent = "下書きに保存しますか？";
        modal.appendChild(message);

        const btnContainer = document.createElement('div');
        // 「はい」ボタン
        const yesBtn = document.createElement('button');
        yesBtn.textContent = "はい";
        yesBtn.addEventListener('click', () => {
            saveDraft();
            modal.remove();
        });
        btnContainer.appendChild(yesBtn);

        // 「履歴一覧」ボタン
        const historyBtn = document.createElement('button');
        historyBtn.textContent = "履歴一覧";
        historyBtn.style.marginLeft = "10px";
        historyBtn.addEventListener('click', showDraftList);
        btnContainer.appendChild(historyBtn);

        modal.appendChild(btnContainer);
        document.body.appendChild(modal);
    };

    // 下書き一覧モーダルの表示
    const showDraftList = () => {
        let listModal = document.getElementById('draftListModal');
        if(listModal) listModal.remove();
        listModal = createModalElement('draftListModal', 10001);

        // 一括削除ボタン
        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.textContent = "🗑 一括削除";
        deleteAllBtn.style.marginBottom = "10px";
        deleteAllBtn.addEventListener('click', () => {
            if(confirm("すべての下書きを削除してもよろしいですか？")) {
                localStorage.removeItem(STORAGE_KEY);
                listModal.innerHTML = "";
                listModal.appendChild(deleteAllBtn);
                const emptyMsg = document.createElement('p');
                emptyMsg.textContent = "下書きはありません。";
                listModal.appendChild(emptyMsg);
            }
        });
        listModal.appendChild(deleteAllBtn);

        const drafts = getDrafts();
        if(drafts.length === 0) {
            const noDraft = document.createElement('p');
            noDraft.textContent = "下書きはありません。";
            listModal.appendChild(noDraft);
        } else {
            drafts.slice(0, MAX_DRAFTS).forEach((draft, index) => {
                const itemContainer = document.createElement('div');
                itemContainer.style.cssText = `
                    border-bottom: 1px solid #eee;
                    padding: 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                `;

                const itemInfo = document.createElement('span');
                itemInfo.textContent = `${draft.date} - ${draft.text.substring(0,20)}`;
                itemInfo.style.cursor = "pointer";
                itemInfo.addEventListener('click', () => {
                    loadDraft(draft);
                    document.getElementById('draftModal')?.remove();
                    listModal.remove();
                });
                itemContainer.appendChild(itemInfo);

                const delBtn = document.createElement('button');
                delBtn.textContent = "×";
                delBtn.style.marginLeft = "10px";
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentDrafts = getDrafts();
                    currentDrafts.splice(index, 1);
                    setDrafts(currentDrafts);
                    listModal.remove();
                    showDraftList();
                });
                itemContainer.appendChild(delBtn);
                listModal.appendChild(itemContainer);
            });
        }

        // モーダル上部固定の閉じるボタン
        const closeBtn = document.createElement('span');
        closeBtn.textContent = "×";
        closeBtn.style.cssText = `
            position: absolute;
            top: 3px;
            right: 3px;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.addEventListener('click', () => listModal.remove());
        listModal.appendChild(closeBtn);

        document.body.appendChild(listModal);
    };

    // 下書きを保存する処理
    const saveDraft = () => {
        const now = new Date().toLocaleString();
        let category = "";
        const selectCategory = document.querySelector('#resform select[name="category"]');
        if(selectCategory && selectCategory.offsetParent !== null) {
            category = selectCategory.value;
        } else {
            const breadcrumbItems = document.querySelectorAll('#resform #breadcrumb [itemtype="http://data-vocabulary.org/Breadcrumb"]');
            if(breadcrumbItems.length >= 2) {
                const a = breadcrumbItems[1].querySelector('a[itemprop="url"]');
                if(a) category = a.href || a.textContent;
            }
        }
        const nameEl = document.querySelector('#resform input[name="name"]');
        const textEl = document.querySelector('#resform textarea[name="text"]');
        const draft = {
            date: now,
            category: nameEl ? category : "",
            name: nameEl ? nameEl.value : "",
            text: textEl ? textEl.value : ""
        };

        const drafts = getDrafts();
        drafts.unshift(draft);
        if(drafts.length > MAX_DRAFTS) drafts.length = MAX_DRAFTS;
        setDrafts(drafts);
        alert("下書きを保存しました");
    };

    // フォームに下書きを反映
    const loadDraft = draft => {
        const selectCategory = document.querySelector('#resform select[name="category"]');
        if(selectCategory) selectCategory.value = draft.category;
        const nameEl = document.querySelector('#resform input[name="name"]');
        if(nameEl) nameEl.value = draft.name;
        const textEl = document.querySelector('#resform textarea[name="text"]');
        if(textEl) textEl.value = draft.text;
    };

    // テキストエリア上に下書き保存ボタンを追加（右下に絶対配置、半透明）
    const insertDraftButton = () => {
        const textArea = document.querySelector('#resform textarea[name="text"]');
        if(textArea) {
            const container = textArea.parentNode;
            container.style.position = 'relative';

            const btn = document.createElement('button');
            btn.type = "button";
            btn.id = "draftsave";
            btn.textContent = "💾";
            btn.style.cssText = `
                position: absolute;
                bottom: 5px;
                right: 5px;
                opacity: 0.5;
            `;
            btn.addEventListener('mouseover', () => btn.style.opacity = "1");
            btn.addEventListener('mouseout', () => btn.style.opacity = "0.5");
            btn.addEventListener('click', createSaveModal);

            container.appendChild(btn);
        }
    };

    const init = () => {
        window.addEventListener('load', insertDraftButton);
    };

    init();
})();


(function(){
    'use strict';

    // 1) ポップアップ用のスタイルをまとめて定義
    const style = document.createElement('style');
    style.id = 'respopupStyle';
    style.textContent = `
        /* ポップアップ本体 */
        #respopup {
            font-site:1.4rem;
            display: block;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.95);
            box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.25);
            z-index: 10001;
            max-width: 930px;
            margin-top: 10px;
            & p ~ *{display:block;}
        }

        /* 投票ボタンや削除ボタンなどを非表示に */
        #respopup .vote,
        #respopup .voteBtns,
        #respopup .resheader .badge {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2) クリックされたレスの内容をポップアップとして挿入する関数
    const insertResponsePopup = (li) => {
        const header = li.querySelector('.resheader');
        const body = li.querySelector('.resbody');
        if (!header || !body) return;

        // 既存のポップアップがあれば削除
        const prevPopup = document.getElementById('respopup');
        if (prevPopup) prevPopup.remove();

        // p要素を作成してIDを付与
        const popup = document.createElement('div');
        popup.id = 'respopup';

        // レスのヘッダーと本文をまとめて挿入
        popup.innerHTML = header.outerHTML + body.outerHTML;

        // #resform 内の .alert.alert-info.infotext の直後に挿入
        const infoText = document.querySelector('#resform .alert.alert-info.infotext');
        if (infoText) {
            infoText.insertAdjacentElement('afterend', popup);
        }
    };

    // 3) span.resnumberがクリックされたときに処理を実行
    document.addEventListener('click', (e) => {
        const resNumber = e.target.closest('.resheader .resnumber');
        if (!resNumber) return;
        const li = resNumber.closest('li');
        if (li) {
            insertResponsePopup(li);
        }
    });
})();

