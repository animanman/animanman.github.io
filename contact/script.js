const postIframeHeight = () => {
    const height = document.documentElement.offsetHeight;
    window.parent.postMessage({ iframeHeight: height }, 'https://zawazawa.jp/animamman');
};

window.addEventListener('DOMContentLoaded', () => {
    postIframeHeight();
});

window.addEventListener('resize', () => {
    postIframeHeight();
});

window.addEventListener('message', (e) => {
    if (e.data.hasOwnProperty('iframeHeight')) { 
        const iframe = document.getElementById('InlineFrameContact'); // resizableIframeはiframeのID名に置き換える
        iframe.style.height = `${e.data.iframeHeight}px`;
    }
});
