$(function () {
    //鼠标移入导航改变状态
    $('.common-header-nav').on('mouseenter', 'li', function () {
        $('.common-header-nav a').removeClass();
        $(this).find('a').addClass('active-tab');
    });

    //banner底部滚动带
    //为了调试方便，定时器时间间隔设置得较短
    //大型网站方法多的话还需要考虑下面这俩变量的问题
    var timer = setInterval(function () {
        roller('carousel');
    }, 1000);

    //保存当前滚动方向
    var currentDire = 'r';

    //滚动带按钮点击控制方向
    $('#carousel-leftBtn').click(function () {
        //如果先执行一次roller函数（把下面的注释打开），在快速多次点击方向按钮之后滚动条会异常。而不先执行一次roller函数（把下面一行注释掉）则点击按钮后会停顿，定时器时间到了之后滚动条才会继续滚动
        //正常使用应该不会出现快速多次点击一个方向的方向按钮，故而还是把注释打开
        //先执行一次还是有bug，点击方向按钮时会出现越界和奇怪的运动的问题
        //roller('l');
        clearInterval(timer);
        timer = setInterval(function () {
            roller('carousel', 'l');
        }, 1000);
        currentDire = 'l';
    });

    $('#carousel-rightBtn').click(function () {
        //roller('r');
        clearInterval(timer);
        timer = setInterval(function () {
            roller('carousel', 'r');
        }, 1000);
        currentDire = 'r';
    });

    $('#carousel-leftBtn,#carousel-rightBtn').on('mousedown mouseup', function (event) {
        event.preventDefault();
        $(this).toggleClass('banner-btn-active');
    });


    //鼠标移入暂停，移出继续。
    $('.banner-list').on('mouseenter', function () {
        clearInterval(timer);
    }).on('mouseleave', function () {
        //当前问题：鼠标移入移出之后没法保持当前滚动方向
        //timer = setInterval(function (currentDire) {
        //已解决，roller外层嵌套函数不需要传入currentDire参数。

        timer = setInterval(function () {
            roller('carousel', currentDire);
        }, 1000);
    });


    //大部分图片错位...原因尚未知...而且直接整个body应用的话二维码及一些装饰的图片也会被放大...
    //$('body').on('mouseover','img', function () {
    //    showPic($(this));
    //}).on('mouseout','img', function () {
    //        removeImg();
    //    });

    //只有这两个部分的图片显示正常，图片放大模糊问题需要跟设计师沟通（获取合适分辨率原图），同时需要考虑哪些照片需要大图（性能问题）。
    $('.portrait-list,.workshow-main').on('mouseover', 'img', function () {
        showPic($(this));
    }).on('mouseout', 'img', function () {
        removeImg();
    });

});

//滚动条滚动函数
var dbUlDone = false;
//这个全局变量用于第一次执行时将滚动带子元素复制一份，目前想到去掉这个全局变量的方法就是在编写html的时候就直接把ul里的li复制一遍，而不用再用js生成。
//或者每次调用这个函数之前先自行把li复制一遍（比较傻）
//依次传入父元素id，子元素classname，及滚动方向l/r（不传默认r）
//虽然大部分时候应该都是用ul和li，不过还是写成兼容div样式，不然可以省去第二个参数。
//改写，如果是ul+li结构，可直接传入父元素id及滚动方向l/r(不传默认r)，如果是div结构，则需要传入父元素id、子元素className及滚动方向l/r（不传默认r）。
//ie中animation不生效的原因：
//需要先在css中给出left:0;或者先设置$parent.css('left',0);否则IE的left会是auto，见本函数最后animation（第147行）、index.less第104/105行。

function roller(parentId, childrenCls, direction) {
    var cParentId = '#' + parentId,
        cChildrenCls = '.' + childrenCls;

    var $children,
    //children_width↓
        children_w,
        $parent,
        parent_w,
    //parent_left↓
        parent_l,
        dire;


    if (direction) {
        dire = direction;
    } else {
        dire = 'r'
    }

    if (childrenCls == 'r' || childrenCls == 'l') {
        dire = childrenCls;
        $children = $(cParentId).find('li');
    } else if (childrenCls == undefined) {
        $children = $(cParentId).find('li');
    } else {
        $children = $(cParentId).find(cChildrenCls);
    }

    children_w = parseInt($children.width());
    $parent = $(cParentId);

    //检查Ul是否已复制，已复制则跳过。
    if (!dbUlDone) {
        $parent.append($children.clone())
            .css('width', children_w * $children.length * 2);
        dbUlDone = true;
    }

    parent_w = parseInt($parent.css('width'));
    parent_l = parseInt($parent.css('left'));

    //当第一张图在滚动带最左边而且滚动带在向左滚时，点击向右按钮，会出现空白，待修复
    //if (parent_l <= -parent_w / 2 ) {
    //已修复，判断条件需要加上dire == 'l'
    if (parent_l <= -parent_w / 2 && dire == 'l') {
        $parent.css('left', 0);
        parent_l = parseInt($parent.css('left'));
    } else if (parent_l >= 0 && dire == 'r') {
        $parent.css('left', -parent_w / 2);
        parent_l = parseInt($parent.css('left'));
    }

    if (dire == 'l') {
        parent_l -= children_w;
    } else if (dire == 'r') {
        parent_l += children_w;
    } else {
        //保持默认向右滚
        parent_l += children_w;
    }
    //parent_l = parseInt($parent.css('left'));
    $parent.animate({'left': parent_l}, 'slow'
        //, function () {console.log($parent.css('left'));} //auto
    );

}

//放大图片函数
function showPic($img) {
    var imgSrc = $img.attr('src');
    var imgWidth = $img.width();
    var imgHeight = $img.height();

    $('<span id="newTriangle"></span>').prependTo('body');
    $('<img id="showImg">').prependTo('body');

    //prop('src'):http://localhost:63342/demo4/img/portrait-list-1.jpg
    //attr('src):img/portrait-list-1.jpg
    $('#showImg').attr('src', imgSrc).css({
        'position': 'absolute',
        'width': parseInt(imgWidth * 1.5),
        'height': parseInt(imgHeight * 1.5),
        'left': parseInt($img.offset().left + imgWidth / 2 - imgWidth * 1.5 / 2),
        'top': parseInt($img.offset().top - imgHeight - imgHeight * 1.5 - 10 - 16),
        'z-index': 99,
        'border': '5px solid #e5e5e5'
    });
    $('#newTriangle').css({
        'position': 'absolute',
        'width': 0,
        'height': 0,
        'left': parseInt($img.offset().left + imgWidth / 2 - 16 / 2),
        'top': parseInt($img.offset().top - 16),
        'border-left': '16px solid transparent',
        'border-top': '16px solid #e5e5e5',
        'border-right': '16px solid transparent',
        'display': 'inline-block',
        'z-index': 99
    });
}
//
function removeImg() {
    $('#showImg').remove();
    $('#newTriangle').remove();
}
//setInterval("fun()",1000); 这种调用报未定义，在全局我们已经说过了 。我们可以把带引号的参数理解为 可执行代码 。而setInterval现在把以引号包括的可执行代码进行处理。就像eval一样给予执行。
//相当于把fun()放到 最外面的全局环境中执行了。而如果fun()函数是写在window.onload内的话，就会访问不到fun()函数本身从而报错。


//尝试superSlide插件
//打开index.less的935-977行、index.html的53-60、83-103、105行及下面这段js
//jQuery(".banner-list-mask").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:true,vis:4,delayTime:500});
//delayTime是运动时间，而不是间隔时间
//经测试，hd里没有ul也可以正常工作，修改一下样式应该可以实现和原本一样的效果（除了滚到头会回滚到第一张外）。




