/**
 * Copyright liaoleejun@gmail.com
 *
 * 一个优秀的Tooltip的修养:
 *   1. 计算 Tooltiptext的位置, 要求是要挨着Tooltip
 *   2. Tooltiptext支持HTML标签, 即支持文本, 图片, 音频, 视频, 超链接等等各种富文本
 *   3. Tooltiptext支持字符串overflow断行
 *   4. Tooltiptext支持宽度自适应, max-width
 *   5. Tooltiptext支持自动朝向 (跟着鼠标, 然后只要考虑上下, 这是跟着光标的的)
 *   6. 支持离开Tooltip保持悬浮几百毫秒, 支持进入Tooltiptext保持悬浮几百毫秒
 *   7. Tooltip折行而不是换行, 即span形式
 *   8. 引用编号如何不在开头出现. white-space: nowrap;
 *   9. 引用编号不会换行, 但是描述可以换行
 *  10. 可能需要点动画过渡显示Tooltiptext
 *  11. 最大宽度应该是用户设置的与页面允许的值, 二者中的较小值
 *
 * 本js文件可能的微小缺陷:
 *   Tooltiptext的位置是计算得到的, 会不会有1到2个像素的位差
 */


let enterTooltipTimer;
let leaveTooltipTimer;
let leaveTooltiptextTimer;
let i = 0;
let j = 0;
let k = 0;
let l = 0;

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
 * 获取HTML元素的位置边界矩形 (x, y, h, w)
 * @param element
 * @returns {{x: number, y: number, h: number, w: number}}
 *
 * Stolen from https://stackoverflow.com/a/1480137/7843026
 */
function getElementBoundingRect(element) {
    // get an element absolute position on the page by cumulative offset
    let _element = element;
    let top = 0, left = 0;
    do {
        top += _element.offsetTop  || 0;
        left += _element.offsetLeft || 0;
        _element = _element.offsetParent;
    } while(_element);

    let x = left;
    let y = top;

    // get width and height
    let rect = element.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;

    return {
        x: x,
        y: y,
        h: h,
        w: w
    };
}


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
 * @param tooltipRect
 * @param tooltiptextDim
 */
function determinateTooltiptextXY(tooltipRect, tooltiptextDim) { // TODO 应该传入tootip 和 tooltiptext, 因为除了Rect和Dim 外还需要其他参数比如border, margin, 咦, 是不是有个函数可以包含这些?
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
 * <div class="tooltip" data-ref="xxx" ...>
 * <div>
 *
 * 正确显示tooltiptext, 只要两个参数: 位置边界矩形, 内容.
 *   位置边界矩形由this计算得到, 内容由data-ref指向得到
 */
$(document).ready(function () {
    $(".tooltip").mouseenter(function () {
        /**
         * 位置, tooltip 与 tooltiptext的位置边界矩形 {x, y, w, h}
         *
         * tooltiptext 默认放置在 tooltip 右下角, 因为我感觉这是最佳视角, 只要顺着文章
         * 往下读即可, 如果 tooltip 右下角长度或宽度不够宽裕, 那么再通过tooltip的边界矩
         * 形的中心来判断哪个方位最宽裕, 选择最宽裕的那个方位, 所以下面代码块是 tooltiptext
         * 放置在右下角的边界矩形
         */
        console.log("i: " + i++);
        let _this = this;
        let tooltipRect = getElementBoundingRect(_this); // tooltip 边界矩形 (x, y, h, w)

        clearTimeout(leaveTooltipTimer); // 结束"离开"状态
        clearTimeout(leaveTooltiptextTimer); // 结束"离开"状态
        enterTooltipTimer = setTimeout(function(){

            let element = $(".tooltiptext")[0];
            if (element === undefined) {
                /**
                 * 内容, 即tooltiptext.
                 *
                 * tooltiptext 来自 tooltip 的属性data-ref的值
                 */
                let tooltiptext = document.createElement("div");
                let dataRef = $(_this).attr("data-ref");
                tooltiptext.innerHTML = $("#" + dataRef).html();
                $(tooltiptext).attr("class", "tooltiptext");
                // $(tooltiptext).css({
                //     "left": tooltipRect.x + "px",
                //     "top": (tooltipRect.y + tooltipRect.h) + "px"
                // });
                $("body").append(tooltiptext);

                let tooltiptextW = $(tooltiptext).width();
                let tooltiptextH = $(tooltiptext).height();
                let tooltiptextDim = {
                    w: tooltiptextW,
                    h: tooltiptextH
                };
                let tooltiptextComputed = determinateTooltiptextXY(tooltipRect, tooltiptextDim);
                $(tooltiptext).css({
                    "left": tooltiptextComputed.x + "px",
                    "top": tooltiptextComputed.y + "px"
                });
            }
        }, 1000);
    }).mouseleave(function () {
        console.log("j: " + j++);
        clearTimeout(enterTooltipTimer); // 结束"进入"状态
        leaveTooltipTimer = setTimeout(function () {
            let element = $(".tooltiptext")[0];
            if (element !== undefined) {
                element.parentNode.removeChild(element);
            }
        }, 1000);

        $('.tooltiptext').mouseenter(function () {
            console.log("k: " + k++);
            clearTimeout(leaveTooltipTimer);
        }).mouseleave(function () {
            console.log("l: " + l++);

            leaveTooltipTimer = setTimeout(function () {
                let element = $(".tooltiptext")[0];
                if (element !== undefined) {
                    element.parentNode.removeChild(element);
                }
            }, 1000);
        });
    });
});
