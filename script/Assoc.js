/**
 * 关联子元素, 并添加上该子元素。
 *
 * <div class="desc" tttid="xxx">
 *     CONCEPT
 * </div>
 * 变成:
 * <div class="desc tooltip" tttid="xxx">
 *     CONCEPT
 *     <div class="tooltip-text">CONCEPT-DESCRIPTION</div>
 * </div>
 *
 * <div class="cite" tttid="yyy">
 * </div>
 * 变成:
 * <div class="cite tooltip" tttid="yyy">
 *     <a href="#aaa">[1]</a>
 *     <div class="tooltip-text">HTML-ELEMENT</div>
 * </div>
 */
$(document).ready(function () {
    /**
     * 1.a 引用排序: 按照引用在 HTML 文档中出现顺序, 把引用的 tttid 生成无重复值数组 citesOrdered
     */
    let cites = $('.cite');
    let citesOrdered = []; // citesOrdered 是由 tttid 构成的无重复数组，按照在HTML文档中出现的顺序
    for (let i = 0; i < cites.length; i++) {
        let tttid = cites[i].getAttribute('tttid');
        // Add the class name "tooltip", 因为SimpleTooltip.js是以类名为tooltip来选择的
        cites[i].classList.add("tooltip");
        // array push only if not exist
        citesOrdered.indexOf(tttid) === -1 ? citesOrdered.push(tttid) : console.log(tttid + " already exists");
    }

    /**
     * 1.b 描述排序: 按照引用在 HTML 文档中出现顺序, 把引用的 tttid 生成无重复值数组 descsOrdered
     */
    let descs = $('.desc');
    let descsOrdered = [];
    for (let i = 0; i < descs.length; i++) {
        let tttid = descs[i].getAttribute('tttid');
        // Add the class name "tooltip", 因为SimpleTooltip.js是以类名为tooltip来选择的
        descs[i].classList.add("tooltip");
        // array push only if not exist
        descsOrdered.indexOf(tttid) === -1 ? descsOrdered.push(tttid) : console.log(tttid + " already exists");
    }

    /**
     * 2.a 把 HTML 文档中的引用, 按照上一步生成的数组的顺序给标上号; 同时,
     *    生成 SimpleTooltip.js 支持的HTML元素
     */
    for (let i = 0; i < cites.length; i++) {
        let tttid = cites[i].getAttribute('tttid');
        // 给引用标上号（注意数组是从0开始下标，所以加1）
        let num = citesOrdered.indexOf(tttid) + 1;
        cites[i].innerHTML = '<a>[' + num + ']</a>'; // cites[i].innerHTML = '[' + num + ']';
        // 引用设置锚点
        cites[i].firstChild.setAttribute('href', '#' + tttid);

        // 生成 SimpleTooltip.js 支持的HTML元素
        let ttt = document.createElement('div');
        ttt.setAttribute("class", "tooltip-text");
        ttt.innerHTML = document.getElementById(tttid).innerHTML;
        cites[i].appendChild(ttt);
    }

    /**
     * 2.b 把 HTML 文档中的描述生成 SimpleTooltip.js 支持的HTML元素
     */
    for (let i = 0; i < descs.length; i++) {
        let tttid = descs[i].getAttribute('tttid');
        // 生成 SimpleTooltip.js 支持的HTML元素
        let ttt = document.createElement('div');
        ttt.setAttribute("class", "tooltip-text");
        ttt.innerHTML = document.getElementById(tttid).innerHTML;
        descs[i].appendChild(ttt);
    }

    /**
     * 3.a 生成排好序的 Cite list
     */
    for (let i = 0; i < citesOrdered.length; i++) {
        let id = citesOrdered[i];
        let ttt = document.createElement('li');
        ttt.appendChild(document.getElementById(id));
        document.getElementById("cites").appendChild(ttt);
    }

    /**
     * 3.b 生成排好序的 Descs list
     */
    for (let i = 0; i < descsOrdered.length; i++) {
        let id = descsOrdered[i];
        let ttt = document.createElement('li');
        ttt.appendChild(document.getElementById(id));
        document.getElementById("descs").appendChild(ttt);
    }
});
