// ==UserScript==
// @name         あにまん掲示板下書き保存機能拡張
// @namespace    https://animanman.github.io/test/other/
// @version      1.4
// @description  トリップを平文で保存するよりマシにしました(非推奨)
// @author       You
// @match        https://bbs.animanch.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/encoding-japanese@1.0.30/encoding.min.js
// @require      https://cdn.jsdelivr.net/npm/unix-crypt-td-js@1.1.4/unix-crypt-td.min.js
// @downloadURL  https://animanman.github.io/test/other/anm-Draftsavingtool.js
// @updateURL    https://animanman.github.io/test/other/anm-Draftsavingtool.js
// ==/UserScript==

(function() {
  'use strict';

  // ────────────────────────────────────────────
  // ◆ グローバル宣言
  // ────────────────────────────────────────────
  const STORAGE_KEY       = 'drafts';
  const MAX_DRAFTS        = 10;
  const DB_NAME           = 'DraftToolDB';
  const DB_STORE_NAME     = 'KeyStore';
  const DB_KEY_ID         = 'aesgcm_key';

  let aesKey = null;

    const categories = [
  { id: "4",  label: "その他ジャンル(二次元以外)" },
  { id: "11", label: "ジャンプ漫画(集英社系)" },
  { id: "29", label: "サンデー・コロコロ漫画(小学館系)" },
  { id: "28", label: "チャンピオン漫画(秋田書店系)" },
  { id: "18", label: "マガジン漫画(講談社系)" },
  { id: "1",  label: "その他漫画" },
  { id: "16", label: "ワンピース" },
  { id: "14", label: "鬼滅の刃" },
  { id: "15", label: "呪術廻戦" },
  { id: "19", label: "ヒロアカ" },
  { id: "26", label: "NARUTO・BORUTO" },
  { id: "31", label: "BLEACH(ブリーチ)" },
  { id: "17", label: "ワールドトリガー" },
  { id: "30", label: "ロボット関連" },
  { id: "27", label: "TOUGH(タフ)" },
  { id: "8",  label: "ウマ娘・競馬" },
  { id: "9",  label: "型月(Fate・FGO・月姫など)" },
  { id: "10", label: "ポケモン" },
  { id: "13", label: "アイドルマスター" },
  { id: "2",  label: "アニメ" },
  { id: "25", label: "カードゲーム(TCG・DCG)" },
  { id: "33", label: "ブルーアーカイブ" },
  { id: "3",  label: "ソシャゲ・ブラゲ" },
  { id: "32", label: "家庭用ゲーム　他" },
  { id: "24", label: "VTuber・2.5次元" },
  { id: "22", label: "特撮ヒーロー" },
  { id: "12", label: "小説(ラノベ・web小説など)" },
  { id: "23", label: "創作全般(絵・小説・ゲ制など)" },
  { id: "6",  label: "作品別" },
  { id: "7",  label: "その他話題" },
  { id: "21", label: "実況" },
  { id: "20", label: "安価系" }
];

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function getKeyFromDB() {
    return openDatabase().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE_NAME, 'readonly');
        const store = tx.objectStore(DB_STORE_NAME);
        const getReq = store.get(DB_KEY_ID);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror   = () => reject(getReq.error);
      });
    });
  }

  function saveKeyToDB(jwk) {
    return openDatabase().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        const putReq = store.put(jwk, DB_KEY_ID);
        putReq.onsuccess = () => resolve();
        putReq.onerror   = () => reject(putReq.error);
      });
    });
  }

  (async function initAesKey() {
    try {
      const storedJwk = await getKeyFromDB();
      if (storedJwk) {
        aesKey = await crypto.subtle.importKey(
          'jwk',
          storedJwk,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
        console.log('[DraftTool] AES-GCM キーを IndexedDB から復元しました');
      } else {
        await generateAndStoreKey();
      }
    } catch (err) {
      console.warn('[DraftTool] AES-GCM キーの復元に失敗:', err);
      await generateAndStoreKey();
    }
  })();

  async function generateAndStoreKey() {
    aesKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const jwk = await crypto.subtle.exportKey('jwk', aesKey);
    await saveKeyToDB(jwk);
    console.log('[DraftTool] AES-GCM キーを新規生成し IndexedDB に保存しました');
  }

  async function encryptTrip(plainText) {
    // 96bit (=12バイト) の IV をランダム生成
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipherData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      enc.encode(plainText)
    );
    const b64iv = btoa(String.fromCharCode(...iv));
    const b64ct = btoa(String.fromCharCode(...new Uint8Array(cipherData)));
    return `AESGCM:${b64iv}:${b64ct}`;
  }

  async function decryptTrip(encStr) {
    try {
      const parts = encStr.split(':');
      if (parts.length !== 3 || parts[0] !== 'AESGCM') {
        throw new Error('Invalid encrypted format');
      }
      const iv = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
      const cipherBytes = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));
      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        cipherBytes
      );
      const dec = new TextDecoder();
      return dec.decode(plainBuffer);
    } catch (e) {
    console.error('[DraftTool] decryptTrip error:', e);
    alert('トリップの復号に失敗しました。');
    return null;
    }
  }

  function escapeHTML_SJIS(sjisBytes) {
    let esc = "";
    for (const b of sjisBytes) {
      switch (b) {
        case 0x26: // &
          esc += "&amp;"; break;
        case 0x3C: // <
          esc += "&lt;"; break;
        case 0x3E: // >
          esc += "&gt;"; break;
        case 0x22: // "
          esc += "&quot;"; break;
        case 0x27: // '
          esc += "&#039;"; break;
        default:
          esc += String.fromCharCode(b);
      }
    }
    return esc;
  }

window.hitoricapJS = async function(rawTripkey) {
  const tripkeySJIS = Encoding.convert(rawTripkey, { to: "SJIS", from: "UNICODE" });

  if (tripkeySJIS.length >= 12) {
    const firstChar = rawTripkey.charAt(0);

    if (firstChar === "#") {
      const reNew = /^#([0-9A-Fa-f]{16})([.\/0-9A-Za-z]{0,2})$/;
      const m = rawTripkey.match(reNew);
      if (m) {
        const hex16 = m[1];
        const keyBytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
          keyBytes[i] = parseInt(hex16.substr(i * 2, 2), 16);
        }
        const idx128 = Array.from(keyBytes).indexOf(128);
        const truncated = idx128 !== -1 ? keyBytes.slice(0, idx128) : keyBytes;
        let plain8bit = "";
        for (let b of truncated) {
          plain8bit += String.fromCharCode(b);
        }
        const saltPart = m[2] || "";
        const saltForCrypt = (saltPart + "..").substr(0, 2);
        const cryptResult = unixCryptTD(plain8bit, saltForCrypt);
        const trip = cryptResult.slice(-10);
        return "◆" + trip;
      } else {
        return "???";
      }
    }

    else if (firstChar === "$") {
      return "???";
    }

    else {
      const utf8Bytes = new TextEncoder().encode(rawTripkey);
      const hashBuffer = await crypto.subtle.digest("SHA-1", utf8Bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashStr = hashArray.map(b => String.fromCharCode(b)).join("");
      const b64 = btoa(hashStr);
      const trip12 = b64.substr(0, 12).replace(/\+/g, ".");
      return "◆" + trip12;
    }
  }

  else {
    const keySJISEsc = escapeHTML_SJIS(tripkeySJIS);
    const keyPlusHdot = keySJISEsc + "H.";
    let rawSalt = keyPlusHdot.substr(1, 2);
    rawSalt = rawSalt.replace(/[^.\-z]/g, ".");
    const map = {
      ":" : "A", ";" : "B", "<" : "C", "=" : "D", ">" : "E",
      "?" : "F", "@" : "G", "[" : "a", "\\" : "b", "]": "c",
      "^" : "d", "_" : "e", "`" : "f"
    };
    let mappedSalt = "";
    for (const ch of rawSalt) {
      mappedSalt += (map[ch] || ch);
    }
    const cryptResOld = unixCryptTD(keySJISEsc, mappedSalt);
    const trip = cryptResOld.slice(-10);
    return "◆" + trip;
  }
};

  const modalStyle = document.createElement('style');
  modalStyle.id = 'draftModalStyle';
  modalStyle.textContent = `
    #draftsave {
      position: absolute;
      bottom: 5px;
      right: 5px;
      opacity: 0.5;
      box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.25);
    }

    #outdraftModal {
      position: fixed;
      display: flex;
      top: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.3);
      z-index: 9999;
    }

    #draftModal {
      display: flex;
      gap: 5px;
      flex-direction: column;
      position: relative;
      margin: auto;
      background: #fff;
      border: 1px solid #ccc;
      padding: 30px 10px 10px 10px;
      z-index: 10000;
      box-shadow: 0 0 1px 2px rgba(0,0,0,0.25);
      font-size: 14px;
      max-height: 80%;
      overflow-y: auto;
      border-radius: .50rem;
    }
    #draftModal.mode-list {
      width: 80%;
    }
    #draftModal > span.closeBtn {
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      position: absolute;
      top: 5px;
      right: 5px;
    }
    #draftModal > :is(#dftMdl-Hdr, #dftMdl-bd, #dftMdl-ftr) {
      display: contents;
    }
    #draftModal > #dftMdl-Hdr > .dndhd-dfbtn {
      display: flex;
      gap: 5px;
    }
    #draftModal > #dftMdl-Hdr > .dMd-Hd,
    #draftModal > #dftMdl-ftr > .dMd-ft {
      display: flex;
      gap: 5px;
      font-size: 14px;
    }

    #draftModal > #dftMdl-Hdr > .dMd-Hd button#dmd-backBtn::before {
      font-family: 'Bootstrap-icons';
      content: '\\F284';
      margin-right: 4px;
    }
    #draftModal > #dftMdl-Hdr > .dMd-Hd button#hdrSaveBtn::before {
      font-family: 'Bootstrap-icons';
      content: '\\f525';
      margin-right: 4px;
    }
    #draftModal > #dftMdl-Hdr > .dMd-Hd button#delAllBtn::before {
      font-family: 'Bootstrap-icons';
      content: '\\F5DE';
      margin-right: 4px;
    }

    #listSection {
      display: flex;
      flex-flow: column;
    }
    #listSection > .draftItem {
      border-bottom: 1px solid #eee;
      font-size: 12px;
      padding: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 3px;
    }
    #listSection > .draftItem > span.drafts {
      display: flex;
      flex-wrap: wrap;
      word-break: break-word;
      cursor: pointer;
    }
    #listSection > .draftItem > span.drafts > :is(.df-breadcrumb,.df-resheader){
    display: flex;
    }
    #listSection > .draftItem > span.drafts > span:not(.df-resbody) {
      font-size: 10px;
    }
    #listSection > .draftItem > span.drafts span.df-breadcrumb {
      flex: 1;
    }
    #listSection > .draftItem > span.drafts span.df-breadcrumb > span.df-board::before {
      content: "\u00bb";
      font-size: 10px;
      display:inline-block;
    }
    #listSection > .draftItem > span.drafts > span.df-cause {
      color: #842029;
    }
    #listSection > .draftItem > span.drafts > span.df-cause::before {
      content: "\u26a0";
    }
    #listSection > .draftItem > span.drafts > span.df-resheader {
      color: #104cd0;
      width: 100%;
    }
    #listSection > .draftItem > span.drafts > span.df-resbody {
      width: 100%;
    }

    #draftModal.mode-confirm *.confirmSection { display: block; }
    #draftModal.mode-confirm *.listSection    { display: none !important; }
    #draftModal.mode-list    *.confirmSection { display: none !important; }
    #draftModal.mode-list    *.listSection    { display: block; }

    #respopup {
      font-size: 1.4rem;
      display: block;
      padding: 10px;
      margin-bottom: 1rem;
      background-color: rgba(255,255,255,0.95);
      box-shadow: 0 0 1px 2px rgba(0,0,0,0.25);
      z-index: 10001;
      max-width: 930px;
      margin-top: 10px;
    }
    #respopup p ~ * { display: block; }
    #respopup .vote,
    #respopup .voteBtns,
    #respopup .resheader .badge {
      display: none !important;
    }

    @media (min-width: 768px) {
      #draftModal {
        max-width: 1200px;
      }
      #listSection > .draftItem > span.drafts > .df-resheader{
      gap: 0.7em;
      }
      #listSection > .draftItem > span.drafts > .df-breadcrumb > span.df-board::before{
      margin:0 0.7em;
      }
    }
    @media (max-width: 575.8px) {
      #draftModal {
        max-width: 80%;
      }
      #listSection > .draftItem > span.drafts > .df-resheader{
      gap: 0.3em;
      }
      #listSection > .draftItem > span.drafts > .df-breadcrumb > span.df-board::before{
      margin:0 0.3em;
      }
    }
  `;
  document.head.appendChild(modalStyle);

  const getDrafts = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const setDrafts = ds => localStorage.setItem(STORAGE_KEY, JSON.stringify(ds));

  const getContext = () => {
    const crumbs   = document.querySelectorAll('#resform #breadcrumb [itemtype]');
    const category = crumbs[1]?.querySelector('a')?.href.match(/category(\d+)/)?.[1] || '';
    const board    = crumbs[2]?.querySelector('a')?.href.match(/board\/(\d+)\//)?.[1] || '';
    return { category, board };
  };

  function loadDraft(draft) {
  const selectCategory = document.querySelector('#resform select[name="category"]');
  if (selectCategory) selectCategory.value = draft.category;

  const nameEl = document.querySelector('#resform input[name="name"]');
  if (nameEl) {
    if (draft.trip) {
      nameEl.value = `${draft.name}#…(復号中)…`;

      decryptTrip(draft.trip).then((decrypted) => {
        if (decrypted !== null) {
          nameEl.value = `${draft.name}#${decrypted}`;
        } else {
          nameEl.value = `${draft.name}#[復号失敗]`;
        }
      });
    } else {
      nameEl.value = draft.name;
    }
  }

  const textEl = document.querySelector('#resform textarea[name="text"]');
  if (textEl) textEl.value = draft.text;
}

  const saveDraft = async (cause) => {
  const { category, board } = getContext();

  let nameRaw = document.querySelector('#resform input[name="name"]')?.value || '';
  const text = document.querySelector('#resform textarea[name="text"]')?.value || '';

  let storedName = nameRaw;
  let tripEncrypted = null;

  if (nameRaw.includes('#')) {
    const idx = nameRaw.indexOf('#');
    const prefix = nameRaw.slice(0, idx);
    const tripPart = nameRaw.slice(idx + 1);

    const encrypted = await encryptTrip(tripPart);

    storedName = prefix;
    tripEncrypted = encrypted;
  }

  const draft = {
    date: new Date().toLocaleString(),
    category,
    board,
    name: storedName,
    ...(tripEncrypted && { trip: tripEncrypted }),
    text,
    ...(cause && { cause })
  };

  const ds = [draft, ...getDrafts()].slice(0, MAX_DRAFTS);
  setDrafts(ds);

  alert(`下書きを保存しました${cause ? `（原因：${cause}）` : ''}`);
};

  const createModal = () => {
    // すでに表示中なら何もしない
    if (document.getElementById('outdraftModal')) return;

    const outmodal = document.createElement('div');
    outmodal.id = 'outdraftModal';

    const modal = document.createElement('div');
    modal.id = 'draftModal';
    modal.className = 'mode-confirm';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'closeBtn';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      outmodal.remove();
    });
    modal.appendChild(closeBtn);

    const hdrDiv = document.createElement('div');
    hdrDiv.id = 'dftMdl-Hdr';

    const dndhdDfbtn = document.createElement('div');
    dndhdDfbtn.className = 'dndhd-dfbtn dMd-Hd listSection';
    const backBtn = document.createElement('button');
    backBtn.id = 'dmd-backBtn';
    backBtn.className = 'btn btn-outline-secondary btn-sm listSection';
    backBtn.textContent = '戻る';
    backBtn.addEventListener('click', () => {
      modal.classList.remove('mode-list');
      modal.classList.add('mode-confirm');
    });
    dndhdDfbtn.appendChild(backBtn);
    const hdrSaveBtn = document.createElement('button');
    hdrSaveBtn.id = 'hdrSaveBtn';
    hdrSaveBtn.className = 'btn btn-outline-secondary btn-sm';
    hdrSaveBtn.textContent = '保存';
    hdrSaveBtn.addEventListener('click', () => {
      saveDraft().then(() => renderList());
    });
    dndhdDfbtn.appendChild(hdrSaveBtn);
    hdrDiv.appendChild(dndhdDfbtn);

    const listSectionHdr = document.createElement('div');
    listSectionHdr.id = 'listSection-Hdr';
    listSectionHdr.className = 'dMd-Hd listSection';
    const delAllBtn = document.createElement('button');
    delAllBtn.id = 'delAllBtn';
    delAllBtn.className = 'btn btn-outline-secondary btn-sm';
    delAllBtn.textContent = '一括削除';
    delAllBtn.addEventListener('click', () => {
      if (confirm('すべての下書きを削除してもよろしいですか？')) {
        localStorage.removeItem(STORAGE_KEY);
        renderList();
      }
    });
    listSectionHdr.appendChild(delAllBtn);
    hdrDiv.appendChild(listSectionHdr);

    modal.appendChild(hdrDiv);

    const bdDiv = document.createElement('div');
    bdDiv.id = 'dftMdl-bd';

    const confirmSec = document.createElement('div');
    confirmSec.id = 'confirmSection';
    confirmSec.className = 'confirmSection dMd-bd';
    const pConfirm = document.createElement('p');
    pConfirm.textContent = '下書きに保存しますか？';
    confirmSec.appendChild(pConfirm);

    const nameInput   = document.querySelector('#resform input[name="name"]');
    const currentName = nameInput?.value || '';
    if (currentName.includes('#')) {
      const tripWarning = document.createElement('div');
      tripWarning.id = 'tripWarning';
      tripWarning.className = 'alert alert-warning';
      tripWarning.textContent =
        '注意：名前欄に「#」が含まれています。\n' +
        '下書きを保存後、他のスクリプトから保存場所を参照されると、トリップが漏れる可能性があります。';
      tripWarning.style.whiteSpace = 'pre-line';
      confirmSec.appendChild(tripWarning);
    }
    bdDiv.appendChild(confirmSec);

    const listSec = document.createElement('div');
    listSec.id = 'listSection';
    listSec.className = 'listSection dMd-bd';
    bdDiv.appendChild(listSec);

    modal.appendChild(bdDiv);

    const ftrDiv = document.createElement('div');
    ftrDiv.id = 'dftMdl-ftr';

    const confirmFtr = document.createElement('div');
    confirmFtr.id = 'confirmSection-ftr';
    confirmFtr.className = 'confirmSection dMd-ft';

    const yesBtn = document.createElement('button');
    yesBtn.id = 'yesBtn';
    yesBtn.className = 'btn btn-primary btn-sm';
    yesBtn.textContent = 'はい';
    yesBtn.addEventListener('click', () => {
      saveDraft().then(() => outmodal.remove());
    });
    confirmFtr.appendChild(yesBtn);

    const histBtn = document.createElement('button');
    histBtn.id = 'histBtn';
    histBtn.className = 'btn btn-outline-primary btn-sm';
    histBtn.textContent = '下書き一覧';
    histBtn.addEventListener('click', () => {
      modal.classList.remove('mode-confirm');
      modal.classList.add('mode-list');
      renderList();
    });
    confirmFtr.appendChild(histBtn);

    ftrDiv.appendChild(confirmFtr);
    modal.appendChild(ftrDiv);

    outmodal.appendChild(modal);
    document.body.appendChild(outmodal);

    renderList();
  };

  const toggleMode = mode => {
    const m = document.getElementById('draftModal');
    if (!m) return;
    m.className = mode;
    if (mode === 'mode-list') renderList();
  };

const renderList = () => {
  const container = document.getElementById('listSection');

  container.innerHTML = ''; 
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loadingIndicator';
  loadingIndicator.textContent = '読み込み中…';
  container.appendChild(loadingIndicator);

  setTimeout(() => {
    container.innerHTML = '';

    const ds = getDrafts();
    if (!ds.length) {
      const p = document.createElement('p');
      p.textContent = '下書きはありません。';
      container.appendChild(p);

      const spinner = document.getElementById('loadingIndicator');
      if (spinner) spinner.remove();
      return;
    }

    ds.forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'draftItem';

      const info = document.createElement('span');
      info.className = 'drafts';

      const breadcrumb = document.createElement('span');
      breadcrumb.className = 'df-breadcrumb';

      const raw = d.category || "";
      const cat = raw.trim();

      if (!cat) {
        const spanTop = document.createElement("span");
        spanTop.className = "df-category";

        const a = document.createElement("a");
        a.href = "https://bbs.animanch.com/";
        a.textContent = "Top";
        spanTop.appendChild(a);
        breadcrumb.appendChild(spanTop);

      } else {
        const catIdStr = String(cat);
        const match = categories.find(c => c.id === catIdStr);

        if (match) {
          const spanCategoryLink = document.createElement("span");
          spanCategoryLink.className = "df-category";

          const a = document.createElement("a");
          a.href = `https://bbs.animanch.com/category/${catIdStr}/`;
          a.textContent = match.label;
          spanCategoryLink.appendChild(a);
          breadcrumb.appendChild(spanCategoryLink);

        } else {
          const spanCategory = document.createElement("span");
          spanCategory.className = "df-category";

          const a = document.createElement("a");
          a.href = "https://bbs.animanch.com/";
          a.textContent = cat;
          spanCategory.appendChild(a);
          breadcrumb.appendChild(spanCategory);
        }
      }

      if (d.board) {
        const spanBoard = document.createElement('span');
        spanBoard.className = 'df-board';
        const boardLink = document.createElement('a');
        boardLink.href = `https://bbs.animanch.com/board/${d.board}/`;
        boardLink.textContent = '📄';
        spanBoard.appendChild(boardLink);
        breadcrumb.appendChild(spanBoard);
      }

      info.appendChild(breadcrumb);

      if (d.cause) {
        const spanCause = document.createElement('span');
        spanCause.className = 'df-cause';
        spanCause.textContent = d.cause;
        info.appendChild(spanCause);
      }

      const resHeader = document.createElement('span');
      resHeader.className = 'df-resheader';

      if (d.name) {
        const spanName = document.createElement('span');
        spanName.className = 'df-name';
        spanName.textContent = d.name;

        if (d.trip) {
          const loadingSuffix = document.createElement('span');
          loadingSuffix.className = 'df-trip';
          loadingSuffix.textContent = '#…(復号中)…';
          spanName.appendChild(loadingSuffix);

          decryptTrip(d.trip).then(async (decrypted) => {
            if (decrypted !== null) {
              try {
                const tripOnly = await hitoricapJS(decrypted);
                loadingSuffix.textContent = tripOnly;
              } catch (e) {
                console.error("hitoricapJS error:", e);
                loadingSuffix.textContent = '#[復号失敗]';
              }
            } else {
              loadingSuffix.textContent = '#[復号失敗]';
            }
          });
        }

        resHeader.appendChild(spanName);
      }

      const spanDate = document.createElement('span');
      spanDate.className = 'df-date';
      spanDate.textContent = d.date;
      resHeader.appendChild(spanDate);

      info.appendChild(resHeader);

      const resBody = document.createElement('span');
      resBody.className = 'df-resbody df-text';
      const truncated = d.text.length > 100 ? d.text.slice(0, 100) + '…' : d.text;
      resBody.textContent = truncated;
      info.appendChild(resBody);

      info.addEventListener('click', () => {
        loadDraft(d);
        modalRemove();
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        const a = getDrafts();
        a.splice(i, 1);
        setDrafts(a);
        renderList();
      });

      item.appendChild(info);
      item.appendChild(delBtn);
      container.appendChild(item);
    });

    if (container.querySelector('.df-trip')) {
      const tripwarning = document.createElement('div');
      tripwarning.id = 'tripDiffWarning';
      tripwarning.className = 'alert alert-warning';
      tripwarning.textContent = '注意：一覧に表示されるトリップは実際のトリップと異なります。';
      container.insertBefore(tripwarning, container.firstChild);
    }

    const spinner = document.getElementById('loadingIndicator');
    if (spinner) spinner.remove();
  }, 0);
};

  const modalRemove = () => {
    const out = document.getElementById('outdraftModal');
    if (out) out.remove();
  };

  const insertDraftButton = () => {
    const ta = document.querySelector('#resform textarea[name="text"]');
    if (!ta) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'draftsave';
    btn.classList.add('btn', 'btn-light');
    btn.innerHTML = '<i class="bi bi-save"></i>'; // Bootstrap Icons の「save」アイコン
    btn.addEventListener('mouseover', () => (btn.style.opacity = '1'));
    btn.addEventListener('mouseout', () => (btn.style.opacity = '0.5'));
    btn.addEventListener('click', createModal);
    ta.parentNode.style.position = 'relative';
    ta.parentNode.appendChild(btn);
  };

  const hookErrorSave = () => {
    const btn = document.querySelector('#resform button#respost');
    if (!btn) return;
    btn.addEventListener('click', () => {
      setTimeout(() => {
        const modalBox = document.getElementById('modalBox');
        if (modalBox && getComputedStyle(modalBox).display === 'block') {
          saveDraft('ホスト規制');
        }
      }, 100);
    });
  };

  document.addEventListener('click', e => {
    const num = e.target.closest('.resheader .resnumber');
    if (!num) return;
    const li = num.closest('li');
    if (!li) return;
    document.getElementById('respopup')?.remove();
    const pop = document.createElement('div');
    pop.id = 'respopup';
    const headerCopy = li.querySelector('.resheader').cloneNode(true);
    const bodyCopy   = li.querySelector('.resbody').cloneNode(true);
    pop.appendChild(headerCopy);
    pop.appendChild(bodyCopy);
    document
      .querySelector('#resform .alert.alert-info.infotext')
      ?.insertAdjacentElement('afterend', pop);
  });

  window.addEventListener('load', () => {
    insertDraftButton();
    hookErrorSave();
  });
})();
