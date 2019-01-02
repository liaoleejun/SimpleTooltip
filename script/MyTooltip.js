var leaveTimer;
var enterTimer;

$(".tooltip").mouseenter(function() {
    var that = this;
    var tooltiptext = $(that).find('div')[0];
    var tooltiptextMaxWidth = 400;

    /* 临时创建元素, 内容等同于tooltiptext的内容, 以此来测算tooltiptext的宽度 */
    var el = document.createElement("div");
    el.style.display = "inline-block";
    el.innerHTML = tooltiptext.innerHTML;
    el.setAttribute("id", "temp-for-tooltip-text");
    document.body.appendChild(el);
    var tempWidth = document.getElementById('temp-for-tooltip-text').offsetWidth;
    if (tempWidth > tooltiptextMaxWidth) {
        document.getElementById('temp-for-tooltip-text').style.width = tooltiptextMaxWidth + "px";
    }
    var h = document.getElementById('temp-for-tooltip-text').offsetHeight;
    console.log(h);
    /* 删除临时创建的元素 */
    var element = document.getElementById("temp-for-tooltip-text");
    element.parentNode.removeChild(element);

    /*
     * 根据临时创建的元素得到的临时宽度，来判断宽度：
     * 若实际小于tooltiptextMaxWidth，则以实际宽度为准，反之，则设置长度为tooltiptextMaxWidth
     */
    var w;
    if (tempWidth < tooltiptextMaxWidth) {
        w = tempWidth;
        tooltiptext.style.width = tempWidth + "px";
    } else {
        w = tooltiptextMaxWidth;
        tooltiptext.style.width = tooltiptextMaxWidth + "px";
    }

    /* 根据鼠标悬浮点，来判断显示tooltiptext：是否需要在上部，是否需要margin */
    var rect = that.getBoundingClientRect();
    var windowWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    var windowHeight = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    console.log(rect.top, rect.right, rect.bottom, rect.left);

    if (windowHeight - rect.bottom < h) { // 如果鼠标悬浮点距离浏览器底部的长度不足以承载tooltiptext高度
        that.childNodes[1].style.bottom = "100%";
    }
    console.log(windowWidth - rect.right);
    if (windowWidth - rect.right < w) {
        that.childNodes[1].style["margin-left"] = "-" + tooltiptextMaxWidth + "px";
    }

    enterTimer = setTimeout(function(){
        $(".tooltip-text").css("display", "none"); // 所有的class为tooltip-text的隐藏
        $(tooltiptext).css("display", "block");
        // $('#thumbs div').removeClass('hovered');
        // $('#thumbs div').removeClass('hoveredYellow');
        // $(that).addClass('hovered');
    }, 300);
    clearTimeout(leaveTimer);
});

$(".tooltip").mouseleave(function() {
    var that = this;
    var tooltiptext = $(that).find('div')[0];
    leaveTimer = setTimeout(function() {
        // tooltiptext.attr("display", "none");
        // $(tooltiptext).css("display", "block");
        $(".tooltip-text").css("display", "none"); // 所有的class为tooltip-text的隐藏
        $(tooltiptext).css("display", "none");
        // tooltiptext.attr("display", "none");
        // $('#thumbs div').removeClass('hovered');
        // $('#thumbs div').removeClass('hoveredYellow');
        // $(that).addClass('hoveredYellow');
    }, 300);
    clearTimeout(enterTimer);
});
