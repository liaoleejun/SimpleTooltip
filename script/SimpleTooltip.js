/**
 * Copyright liaoleejun@gmail.com.
 *
 * 始于智, 成于简. 一个优秀的Tooltip的修养:
 *   1. Tooltipcontent的位置要挨着Tooltip出现
 *   2. Tooltipcontent支持HTML标签, 这样就可以支持文本, 图片, 音频, 视频, 超链接等各种
 *   富文本
 *   3. Tooltipcontent支持字符串overflow断行
 *   4. Tooltipcontent支持宽度自适应, max-width
 *   5. Tooltipcontent的超链接点击在新标签页打开
 *   6. Tooltipcontent支持自动朝向 (跟着鼠标, 然后只要考虑上下, 这是跟着光标的的)
 *   7. 支持离开Tooltip保持悬浮几百毫秒, 支持进入Tooltipcontent保持悬浮几百毫秒
 *   8. Tooltip折行而不是换行, 即span形式
 *   9. 引用编号如何不在开头出现. white-space: nowrap;
 *  10. 引用编号不会换行, 但是描述可以换行. tooltip换行问题, Tooltipcontent换行问题.
 *  11. 最大宽度应该是用户设置的与页面允许的值, 二者中的较小值
 *  12. 可能需要点动画过渡显示Tooltipcontent
 *
 * Tooltip是否换行, 即Tooltip是一行, 还是多行显示:
 *   实现了Tooltip多行显示 :)
 *
 * Tooltipcontent是否带箭头:
 *   1. 带箭头
 *   2. 不带箭头
 *   选择了不带箭头的实现方式.
 *
 * Tooltipcontent的显示位置:
 *   暂且采用了较简单直观, 固定的方式
 *   1. 单行的Tooltip, 采用默认右下角, 再根据左墙, 底墙, 右下角的墙角三者的是否会碰壁来
 *      做调整;
 *   2. 多行的Tooltip, 采用默认右上角 (暂时这么个逻辑), 再根据是否会碰到底墙来做调整.
 *
 * 本js文件可能的微小缺陷:
 *   Tooltipcontent的位置是通过offsetParent()累加计算得到的, 可能会有1到2个像素的位差,
 *   但是1到2个像素的位差, 对于计算机屏幕来说真的是千分之一的位差了, 完全不足为虑呀! 目前
 *   尚未找到更好的方法.
 */


// tooltip timeout
ttTimeout = 150;


/**
 * 监听class为tooltip的元素的鼠标悬浮事件, 浮现Tooltipcontent
 *
 * <xxx class="tooltip" data-ref="foo">
 * <xxx>
 * 一般是:
 * <span class="tooltip" data-ref="foo">
 * <span>
 * 正确显示Tooltipcontent, 只要两个参数: 位置边界矩形, 内容.
 *   位置边界矩形由this计算得到, 内容由data-ref指向得到
 */
$(document).ready(function () {
    let enterTooltipTimer;
    let leaveTooltipTimer;
    let leaveTooltipcontentTimer;

    // 鼠标进入与离开tooltip时的事件监听
    $(".tooltip").mouseenter(function () {
        let _this = this;
        // let _event = event;

        // 清除鼠标离开Tooltip, Tooltipcontent计时
        clearTimeout(leaveTooltipTimer);
        clearTimeout(leaveTooltipcontentTimer);
        // 开始鼠标进入逻辑
        enterTooltipTimer = setTimeout(function () {
            // 清除已有Tooltipcontent
            // 为什么mouseenter时要做这一步清除? 因为mouse一进入, leaveTooltipTimer,
            // leaveTooltipcontentTimer计时就立马被清除, 就不会删除屏幕上的
            // Tooltipcontent, 所以要加上这一步来清除
            removeTooltipcontent();
            // 生成当前Tooltipcontent
            createTooltipcontent(_this);
        }, ttTimeout);
    }).mouseleave(function () {
        // 清除鼠标进入Tooltip计时
        clearTimeout(enterTooltipTimer);
        leaveTooltipTimer = setTimeout(function () {
            removeTooltipcontent();
        }, ttTimeout);
    });

    // 鼠标进入与离开Tooltipcontent时的事件监听
    // 使用jQuery on方法, 使用了event delegation概念
    $(document.body).on("mouseenter", ".tooltipcontent", [],
        function () {
            clearTimeout(leaveTooltipTimer);
        }).on("mouseleave", ".tooltipcontent", [],
        function () {
            leaveTooltipTimer = setTimeout(function () {
                removeTooltipcontent();
            }, ttTimeout);
        });
});


/**
 * 设置全部链接为新窗口打开 (可选项, 本逻辑可以注释掉)
 * 此函数，是不有问题？比如visibility: hidden;的tooltip时就会失效。不要写while(true)的js代码，会死机，cpu会转个不停
 */
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


/**
 * Create tooltipcontent
 * @param tooltip
 */
function createTooltipcontent(tooltip) {
    // 在Body底部, 追加内容tooltipcontent;
    // 内容tooltipcontent来自tooltip的属性data-ref的值
    let tooltipcontent = document.createElement("div");
    let dataRef = $(tooltip).attr("href");
    tooltipcontent.innerHTML = $(dataRef).html();
    $(tooltipcontent).attr("class", "tooltipcontent");
    // 暂时不要tooltipcontent的箭头Arrow
    // $(tooltipcontent).append("<div class='arrowAbove'></div>" +
    //                       "<div class='arrowBelow'></div>");

    // $("body").append(tooltipcontent);
    $(tooltipcontent).hide().appendTo("body").fadeIn(100); // jQuery fade in
                                                           // effect

    // placeTooltipcontent
    placeTooltipcontent(tooltip, tooltipcontent);
}


/**
 * Remove tooltipcontent
 */
function removeTooltipcontent() {
    let element = $(".tooltipcontent")[0];
    if (element !== undefined) { // 为什么要做这一步判断? 因为首次鼠标悬浮到tooltip
                                 // 上, 还没有tooltipcontent, 如果不做这一步判断,
                                 // js会报错而终止继续执行
        element.parentNode.removeChild(element);
    }
}


/**
 * Place Tooltipcontent
 * 区分讨论tooltip是一行还是多行?
 *   如果是一行, 默认是放置在右下角, tooltip和tooltipcontent左边对齐, 然后判断是在窗口
 *   的底部, 右边, 右下角, 来做调整
 *   如果是多行, 默认是放置在tooltip的上面, 左上角, tooltip和tooltipcontent右边对齐,
 *   然后判断是否在窗口的底部, 来做调整. Note: 如果在是多行, 其实还可以根据鼠标进入的位置
 *   来放置tooltipcontent, 这里为了简单, 暂时不实现这样的逻辑; 其实负责, 应该有简单的级
 *   联模型来
 *   完成.
 * @param tooltip
 * @param tooltipcontent
 */
function placeTooltipcontent(tooltip, tooltipcontent) {
    // 获取在Body底部追加的tooltipcontent的宽, 高
    let tooltipcontentW = $(tooltipcontent).outerWidth(true);
    let tooltipcontentH = $(tooltipcontent).outerHeight(true);
    let tooltipRectRelToPage = getRectRelativeToPage(tooltip);
    let tooltipRectRelToView = tooltip.getBoundingClientRect();
    let windowWH = getWindowWH();
    let tooltipcontentLeft;
    let tooltipcontentTop;

    if (isOneline(tooltip)) {
        // 根据tooltipcontent的宽高和tooltip的边界矩形, 判定tooltipcontent的left,
        // top
        tooltipcontentLeft = tooltipRectRelToPage.x;
        tooltipcontentTop = tooltipRectRelToPage.y + tooltipRectRelToPage.h + 3;

        // 根据tooltip边界矩形(相对于文档)以及视窗大小, 来调整tooltipcontent

        if (tooltipRectRelToView.left + tooltipcontentW > windowWH.w &&
            tooltipRectRelToView.bottom + tooltipcontentH < windowWH.h
        ) {
            tooltipcontentLeft = tooltipRectRelToPage.x + tooltipRectRelToPage.w
                - tooltipcontentW;
            tooltipcontentTop = tooltipRectRelToPage.y + tooltipRectRelToPage.h
                             + 3;
        }
        if (tooltipRectRelToView.bottom + tooltipcontentH > windowWH.h &&
            tooltipRectRelToView.left + tooltipcontentW < windowWH.w
        ) {
            tooltipcontentLeft = tooltipRectRelToPage.x;
            tooltipcontentTop = tooltipRectRelToPage.y - tooltipcontentH - 3;

        }
        if (tooltipRectRelToView.left + tooltipcontentW > windowWH.w &&
            tooltipRectRelToView.bottom + tooltipcontentH > windowWH.h
        ) {
            tooltipcontentLeft = tooltipRectRelToPage.x + tooltipRectRelToPage.w
                - tooltipcontentW;
            tooltipcontentTop = tooltipRectRelToPage.y - tooltipcontentH - 3;
        }
    }

    if (! isOneline(tooltip)) {
        // 根据tooltipcontent的宽高和tooltip的边界矩形, 判定tooltipcontent的left,
        // top
        tooltipcontentLeft = tooltipRectRelToPage.x + tooltipRectRelToPage.w
            - tooltipcontentW;
        tooltipcontentTop = tooltipRectRelToPage.y - tooltipcontentH;

        if (tooltipRectRelToView.top - tooltipcontentH < 0) {
            tooltipcontentLeft = tooltipRectRelToPage.x + tooltipRectRelToPage.w
                - tooltipcontentW;
            tooltipcontentTop = tooltipRectRelToPage.y + tooltipRectRelToPage.h;
        }
    }

    $(tooltipcontent).css({
        "left": tooltipcontentLeft + "px",
        "top": tooltipcontentTop + "px"
    });
}


/**
 * A wonderful method of determine element is oneline or not
 *
 * 搜遍了网上问答, 网络博客, 总结一条思路是先获取元素的Top, left, width, height信息, 再
 * 获取line-height, 然后前者除以后者来获取行数, 行高没有非常可信靠谱的方法, 包括网友的
 * computeStyleValue的方法, 这个方法在Chrome下会返回normal. 后面, 还查找了normal是多
 * 少 * px的字体 https://developer.mozilla.org/en-US/docs/Web/CSS/line-height, 一
 * 般normal默认是1.2倍, 但是这都不靠谱呀. 最后, 突然想到的试探法, 人为先增加空格, 根据这
 * 个空格得出行高, 再删除这个空格, 是不是非常巧妙?!
 * $("elem").append("<span id='elem-append-childd'>&nbsp;</span>");
 * $("elem").prepend("<span id='bar-prepend-childd'>&nbsp;</span>");
 * $("elem").height();
 * $("elem-append-childd").height();
 * @param element
 */
function isOneline(element) {
    $(element).append("<span id='elem-append-childd'>&nbsp;</span>");
    let elemAppendChildd = $('#elem-append-childd');
    let elemAppendChilddHeight = elemAppendChildd.height();
    elemAppendChildd.remove();
    let elemHeight = $(element).height();
    return !!(Math.round(elemHeight / elemAppendChilddHeight) === 1);
}


/**
 * Get element bounding rectangle, relative to the document page.
 * @param element
 * @returns {{w: (*|jQuery), x: (number|jQuery), h: (*|jQuery),
 *            y: (number|jQuery)}}
 */
function getRectRelativeToPage(element) {
    let x = $(element).offset().left; // Return the offset coordinates for the
                                      // selected elements, relative to the
                                      // document.
    let y = $(element).offset().top;
    let w = $(element).outerWidth(true); // Return the width of an element
                                         // (includes padding border and
                                         // margin).
    let h = $(element).outerHeight(true); // Return the height of an element
                                          // (includes padding border and
                                          // margin).
    return {x: x, y: y, w: w, h: h};
}


/**
 * 获取浏览器文档窗口宽高
 * @returns {{w: number, h: number}}
 */
function getWindowWH() {
    let windowWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    let windowHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    return {
        w: windowWidth,
        h: windowHeight
    }
}
