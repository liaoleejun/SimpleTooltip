// 设置全部链接为新窗口打开

// 此函数，有问题。比如visibility: hidden;的tooltip时就会失效。不要写while(true)的js代码，会死机，cpu会转个不停

// 设置监听 click 事件看能否实现
$(document).ready(function (){
    function externalLinks() {
        for (let c = document.getElementsByTagName("a"), a = 0; a < c.length; a++) {
            let b = c[a];

            // all links open in new browser tag, except the link is the same hostname
            // b.getAttribute("href") && b.hostname !== location.hostname && (b.target = "_blank");

            // all links open in new browser tag, except the link is a bookmark
            b.getAttribute("href") && b.getAttribute("href").search(/#/i) !== 0 && (b.target = "_blank");
        }
    }
    externalLinks();
});

