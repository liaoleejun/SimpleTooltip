/**
 * 目标是形成这种形状:
 * <span class="tooltip" data-ref="foo">
 * <span>
 *
 * 过程是把
 * <span data-ct="foo">
 * <span>
 * 转变成
 * <span class="tooltip" data-ref="foo">
 *     <a href="#aaa">[1]</a>
 * </span>
 *
 * 或者把
 * <span data-dt="foo">
 * <span>
 * 转变成
 * <span class="tooltip" data-ref="foo">
 * </span>
 */
$(document).ready(function () {
    // 1.a 引用排序: 按照引用在 HTML 文档中出现顺序, 把引用的 data-ref 生成无重复值的
    //     数组 citesOrdered
    // let cites = $('.cite');
    let cites = $("[data-ct]");
    let citesOrdered = []; // citesOrdered 是由 data-ref 构成的无重复数组，按照在
                           // HTML文档中出现的顺序
    for (let i = 0; i < cites.length; i++) {
        let dataRef = cites[i].getAttribute('data-ct');
        // array push only if not exist
        citesOrdered.indexOf(dataRef) === -1 ? citesOrdered.push(dataRef) :
                                       console.log(dataRef + " already exists");

        // Add the class name "tooltip", 因为SimpleTooltip.js是以类名为tooltip来选择的
        cites[i].classList.add("tooltip");
        $(cites[i]).attr("data-ref", dataRef);
    }

    // 1.b 描述排序: 按照引用在 HTML 文档中出现顺序, 把引用的 data-ref 生成无重复值数
    //     组 descsOrdered
    let descs = $("[data-dt]");
    let descsOrdered = [];
    let descsConceptOrdered = [];
    for (let i = 0; i < descs.length; i++) {
        let dataRef = descs[i].getAttribute('data-dt');
        let concept = descs[i].innerHTML;
        // array push only if not exist
        descsOrdered.indexOf(dataRef) === -1 ? descsOrdered.push(dataRef) : console.log(dataRef + " already exists");
        descsConceptOrdered.indexOf(concept) === -1 ? descsConceptOrdered.push(concept) : console.log(concept + " already exists");

        // Add the class name "tooltip", 因为SimpleTooltip.js是以类名为tooltip来选择的
        descs[i].classList.add("tooltip");
        $(descs[i]).attr("data-ref", dataRef);
    }

    // 2. 把 HTML 文档中的引用, 按照上一步生成的数组的顺序给标上号; 同时,
    //     生成 SimpleTooltip.js 支持的HTML元素
    for (let i = 0; i < cites.length; i++) {
        let dataRef = cites[i].getAttribute('data-ct');
        // 给引用标上号（注意数组是从0开始下标，所以加1）
        let num = citesOrdered.indexOf(dataRef) + 1;
        cites[i].innerHTML = '<a>[' + num + ']</a>'; // cites[i].innerHTML = '[' + num + ']';
        // 引用设置锚点
        cites[i].firstChild.setAttribute('href', '#' + dataRef);
    }

    // 3.a 生成排好序的 Cite list
    $(document.body).append("<div><h2>References</h2><ol id='cites'></ol></div>");
    for (let i = 0; i < citesOrdered.length; i++) {
        let id = citesOrdered[i];
        let ttt = document.createElement('li');
        ttt.appendChild(document.getElementById(id));
        document.getElementById("cites").appendChild(ttt);
    }

    $(document.body).append("<div><h2>Descriptions</h2><ul id='descs'></ul></div>");
    // 3.b 生成排好序的 Descs list
    for (let i = 0; i < descsOrdered.length; i++) {
        let id = descsOrdered[i];
        let ttt = document.createElement('li');
        ttt.innerHTML = "<b>" + descsConceptOrdered[i] + "</b>: ";
        ttt.appendChild(document.getElementById(id));
        document.getElementById("descs").appendChild(ttt);
    }
});
