/**
 * Copyright liaoleejun@gmail.com.
 *
 * 始于智, 成于简. 一个优秀的Tooltip的修养:
 *   1. Tooltiptext的位置要挨着Tooltip出现
 *   2. Tooltiptext支持HTML标签, 这样就可以支持文本, 图片, 音频, 视频, 超链接等各种富文本
 *   3. Tooltiptext支持字符串overflow断行
 *   4. Tooltiptext支持宽度自适应, max-width
 *   5. Tooltiptext的超链接点击在新标签页打开
 *   6. Tooltiptext支持自动朝向 (跟着鼠标, 然后只要考虑上下, 这是跟着光标的的)
 *   7. 支持离开Tooltip保持悬浮几百毫秒, 支持进入Tooltiptext保持悬浮几百毫秒
 *   8. Tooltip折行而不是换行, 即span形式
 *   9. 引用编号如何不在开头出现. white-space: nowrap;
 *  10. 引用编号不会换行, 但是描述可以换行. tooltip换行问题, tooltiptext换行问题.
 *  11. 最大宽度应该是用户设置的与页面允许的值, 二者中的较小值
 *  12. 可能需要点动画过渡显示Tooltiptext
 *
 * Tooltiptext浮现位置:
 *
 *
 * 本js文件可能的微小缺陷:
 *   Tooltiptext的位置是通过offsetParent()累加计算得到的, 可能会有1到2个像素的位差, 但
 *   是1到2个像素的位差, 对于计算机屏幕来说真的是千分之一的位差了, 完全不足为虑呀! 目前尚
 *   未找到更好的方法.
 */


/**
 * TODO 获取"鼠标选中"的位置边界矩形 (x, y, h, w)
 */
function getSelectBoundingRect() {
    s = window.getSelection();
    oRange = s.getRangeAt(0);
    oRange.getBoundingClientRect();
    window.scrollY;
}


/**
 * Get element bounding rectangle, relative to the document page.
 * @param element
 * @returns {{w: (*|jQuery), x: (number|jQuery), h: (*|jQuery), y: (number|jQuery)}}
 */
function getRectRelativeToPage(element) {
    let x = $(element).offset().left; // Return the offset coordinates for the selected elements, relative to the document.
    let y = $(element).offset().top;
    let w = $(element).outerWidth(); // Return the width of an element (includes padding and border).
    let h = $(element).outerHeight(); // Return the height of an element (includes padding and border).
    return {x: x, y: y, w: w, h: h};
}


/**
 * 获取浏览器文档窗口大小
 * @returns {{w: number, h: number}}
 */
function getWindowDim() {
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


/**
 * 判定 tooltiptext 方位
 *
 * 个人偏好是先右边, 先下边. 所以, 优先顺序是右下 > 右上 > 左下 > 左上; 如果按照这个优先
 * 顺序去选择方位, 都不满足, 那么就默认放在右下角, 因为我测试了右下角会自动递增文档的宽度
 * 长度, 而负数的px, 不会扩展 HTML 窗口的长度和宽度 (是不是用right, bottom可以向左上角
 * 自动扩展, 还没测试这个想法, 不过凭直觉不会有负向扩展, 而且向右下角扩展应该是最自然的扩
 * 展. 不对, 如果设置过长, 应该把宽度自动缩小为body的百分之80%, 不过, 我目前这样可以保证
 * 在PC窗口正常运行, 而且 Tooltiptext 应该不至于达到这个离谱的程度, 通常都会限制在400px
 * 以内以方便阅读) 个人习惯偏好可能因人而异, 因时而异, 因地而异. 我的偏好是先右边, 先下边,
 * 因为我觉得在右下方, 比较好连续阅读.
 * 位置, tooltip 与 tooltiptext的位置边界矩形 {x, y, w, h}
 *
 * tooltiptext 默认放置在 tooltip 右下角, 因为我感觉这是最佳视角, 只要顺着文章
 * 往下读即可, 如果 tooltip 右下角长度或宽度不够宽裕, 那么再通过tooltip的边界矩
 * 形的中心来判断哪个方位最宽裕, 选择最宽裕的那个方位, 所以下面代码块是 tooltiptext
 * 放置在右下角的边界矩形
 * @param tooltipRect
 * @param tooltiptextDim
 */
function determineTooltiptextXY(tooltipRect, tooltiptextDim) { // TODO 应该传入tooltip 和 tooltiptext, 因为除了Rect和Dim 外还需要其他参数比如border, margin, 咦, 是不是有个函数可以包含这些?
    let windowDim = getWindowDim();
    // 优先考虑能否在 tooltip 的右下角放下 tooltiptext
    if (tooltipRect.x + tooltiptextDim.w < windowDim.w && tooltipRect.y + tooltiptextDim.h < windowDim.h) {
        return {
            x: tooltipRect.x,
            y: tooltipRect.y + tooltipRect.h
        }
    // 其次考虑能否在 tooltip 的右上角放下 tooltiptext
    } else if (tooltipRect.x + tooltiptextDim.w < windowDim.w && tooltiptextDim.h < tooltipRect.y) {
        return {
            x: tooltipRect.x,
            y: tooltipRect.y - tooltiptextDim.h - 10 // TODO 自动获取tooltiptext的padding, border等等
        }
    // 再次考虑能否在 tooltip 的左下角放下 tooltiptext
    } else if (tooltipRect.x + tooltipRect.w < windowDim.w && tooltipRect.y + tooltipRect.h + tooltiptextDim.h < windowDim.h)  {
        return {
            x: tooltipRect.x + tooltipRect.w - tooltiptextDim.w,
            y: tooltipRect.y + tooltipRect.h
        }
    // 再再次考虑能否在 tooltip 的左上角放下 tooltiptext
    } else if (tooltipRect.x > tooltiptextDim.w && tooltipRect.y > tooltiptextDim.h) {
        return {
            x: tooltipRect.x + tooltipRect.w - tooltiptextDim.w,
            y: tooltipRect.y - tooltiptextDim.h - 10 // TODO 自动获取tooltiptext的padding, border等等
        }
    // 最后, 如果四个方位都无法放下, 那么就默认放在右下角, 因为右下角是正的px, 会自动扩展
    // HTML 文档的宽度和高度. 其他方位的是负的px, 超过 HTML 文档的部分不会自动扩展 HTML
    // 文档的宽度和高度
    } else {
        return {
            x: tooltipRect.x,
            y: tooltipRect.y + tooltipRect.h
        }
    }
}


/**
 * 监听class为tooltip的元素的鼠标悬浮事件, 浮现tooltiptext
 * <xxx class="tooltip" data-ref="yyy" ...>
 * <xxx>
 *
 * 正确显示tooltiptext, 只要两个参数: 位置边界矩形, 内容.
 *   位置边界矩形由this计算得到, 内容由data-ref指向得到
 */
$(document).ready(function () {
    let enterTooltipTimer;
    let leaveTooltipTimer;
    let leaveTooltiptextTimer;

    /**
     * 鼠标进入与离开tooltip时的事件监听处理
     */
    $(".tooltip").mouseenter(function () {
        clearTimeout(leaveTooltipTimer); // 鼠标"离开"Tooltip不到指定时间间隔, 不算离开
        clearTimeout(leaveTooltiptextTimer); // 鼠标"离开"Tooltiptext不到指定时间间隔, 不算离开
        let _this = this;
        let tooltipRect = getRectRelativeToPage(_this); // tooltip 相对于HTML PAGE的边界矩形 (x, y, h, w)
        enterTooltipTimer = setTimeout(function(){
            let element = $(".tooltiptext")[0];
            if (element === undefined) {
                /**
                 * 追加内容tooltiptext, 在Body底部
                 * 内容tooltiptext来自tooltip的属性data-ref的值
                 */
                let tooltiptext = document.createElement("div");
                let dataRef = $(_this).attr("data-ref");
                tooltiptext.innerHTML = $("#" + dataRef).html();
                $(tooltiptext).attr("class", "tooltiptext");
                $("body").append(tooltiptext);

                /**
                 * 获取tooltiptext的宽, 高
                 * 根据在Body底部追加内容tooltiptext实现
                 */
                let tooltiptextW = $(tooltiptext).width();
                let tooltiptextH = $(tooltiptext).height();
                let tooltiptextDim = {
                    h: tooltiptextH,
                    w: tooltiptextW
                };
                /**
                 * 判定tooltiptext的left和top
                 * 根据tooltiptext的宽高以及tooltip边界矩形信息(相对于文档), 来判定
                 */
                let tooltiptextDetermined = determineTooltiptextXY(tooltipRect, tooltiptextDim);
                $(tooltiptext).css({
                    "left": tooltiptextDetermined.x + "px",
                    "top": tooltiptextDetermined.y + "px"
                });
            }
        }, 500);
    }).mouseleave(function () {
        clearTimeout(enterTooltipTimer); // 结束"进入"状态
        leaveTooltipTimer = setTimeout(function () {
            let element = $(".tooltiptext")[0];
            if (element !== undefined) {
                element.parentNode.removeChild(element);
            }
        }, 500);
    });

    /**
     * 鼠标进入与离开tooltiptext时的事件监听处理
     * 使用jQuery on方法, 使用了event delegation概念
     */
    $(document.body).on('mouseenter', '.tooltiptext', [],function () {
        clearTimeout(leaveTooltipTimer);
    }).on('mouseleave', '.tooltiptext', [], function () {
        leaveTooltipTimer = setTimeout(function () {
            let element = $(".tooltiptext")[0];
            if (element !== undefined) {
                element.parentNode.removeChild(element);
            }
        }, 500);
    });
});
