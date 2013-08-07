(function(D, W){
    var APP = {},
        noop = function(){},
        dummyStyle = D.createElement('div').style,
        vendor = (function () {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return '';
        })(),
        vendorUpperCase = vendor.toUpperCase(),
        vendorLowerCase = vendor.toLowerCase(),
        cssVendor = vendor ? '-' + vendorLowerCase + '-' : '',
        has3d = vendor + 'Perspective' in dummyStyle,
        hasTouch = 'ontouchstart' in W,
        hasPointer = 'on' + vendorLowerCase + 'pointerdown' in W,
        useMouse = (!hasTouch && !hasPointer),
        /** 屏幕变化事件 */
        viewChangeEvt = 'onorientationchange' in W ? 'orientationchange' : 'resize',
        /** 按下事件 */
        downEvt = 'mousedown',
        /** 移动事件 */
        moveEvt = 'mousemove',
        /** 提起事件 */
        upEvt = 'mouseup',
        /** cancel事件 */
        cancelEvt = 'mouseout',
        /** 过渡完结事件 */
        transitionEndEvt = ({
            ''			: 'transitionend',
            'webkit'	: 'webkitTransitionEnd',
            'Moz'		: 'transitionend',
            'O'			: 'otransitionend',
            'ms'		: 'MSTransitionEnd'
        })[vendor],
        animationEndEvt = ({
            ''			: 'animationend',
            'webkit'	: 'webkitAnimationEnd',
            'Moz'		: 'animationend',
            'O'			: 'oanimationend',
            'ms'		: 'MSAnimationEnd'
        })[vendor],
        $win = $(W), $doc = $(D),
        winView = (function(){
            var obj = {
                width:0,
                height:0,
                scrollLeft:0,
                scrollTop:0
            };

            /*if('innerWidth' in W){
                 obj.getWidth = function(){ return W.innerWidth };
                 obj.getHeight = function(){ return W.innerHeight };
            }else{*/
                //直接使用documentElement的值，即除去滚动条的尺寸
                obj.getWidth = function(){ return D.documentElement.clientWidth };
                obj.getHeight = function(){ return D.documentElement.clientHeight };
            //}

            if('scrollY' in W){
                obj.getScrollLeft = function(){ return W.scrollX };
                obj.getScrollTop = function(){ return W.scrollY };
            }else{
                obj.getScrollLeft = function(){ return D.documentElement.scrollLeft };
                obj.getScrollTop = function(){ return D.documentElement.scrollTop };
            }

            return obj;
        })();

    !has3d && (D.documentElement.className += ' no3d');

    W.nextFrame = W.requestAnimationFrame ||
        W.webkitRequestAnimationFrame ||
        W.mozRequestAnimationFrame ||
        W.oRequestAnimationFrame ||
        W.msRequestAnimationFrame ||
        function(callback) { return setTimeout(callback, 1); };
    W.cancelFrame = W.cancelRequestAnimationFrame ||
        W.webkitCancelAnimationFrame ||
        W.webkitCancelRequestAnimationFrame ||
        W.mozCancelRequestAnimationFrame ||
        W.oCancelRequestAnimationFrame ||
        W.msCancelRequestAnimationFrame ||
        clearTimeout;

    //按下、移动、提起 事件兼容
    if(hasPointer){
        switch (vendorUpperCase) {
            case 'MS':
                downEvt = 'MSPointerDown';
                moveEvt = 'MSPointerMove';
                upEvt = 'MSPointerUp';
                cancelEvt = 'MSPointerCancel';
                break;
            default :
                downEvt = 'pointerdown';
                moveEvt = 'pointermove';
                upEvt = 'pointermove';
                cancelEvt = 'pointercancel';
                break;
        }
    }else if(hasTouch){
        downEvt = 'touchstart';
        moveEvt = 'touchmove';
        upEvt = 'touchend';
        cancelEvt = 'touchcancel';
    }

    //添加浏览器识别类名
    ;(function(){
        var os = {}, browser = {}, drivce = {},
            ua = W.navigator.userAgent, htmlClass = '', i, temp_version, temp_version_new,
            getVersion = function(version){
                return version ? (version = version.match(/^(\d+[._]?(?:\d+)?)/)) ? version[0].replace('.', '_') : '' : '';
            };

        //添加系统识别
        //Android
        if(/Android\s+([\d.]+)/.test(ua)){
            os.android = true;
            os.version = RegExp.$1;
        }
        if(/(?:iPad|iPhone).*OS\s([\d_]+)/.test(ua)){
            os.ios = true;
            os.version = RegExp.$1;
        }

        //添加设备识别
        //iPad
        /*if(/iPad.*OS\s([\d_]+)/.test(ua)){
             $drivce.iPad = true;
             $os.ios = true;
             $os.version = RegExp.$1;
         }
         //iPhone/iPod
         if(/iPhone\sOS\s([\d_]+)/.test(ua)){
             $drivce.iPhone = true;
             $os.ios = true;
             $os.version = RegExp.$1;
         }*/

        //添加浏览器识别（识别已遇到的并需区别的）
        //UC(非极速)
        if(/(?:UC|UCBrowser)[ /]([\d.]+)?/.test(ua)){
            browser.UC = true;
            browser.version = RegExp.$1;
        }
        //QQ
        if(/MQQBrowser\/([\d.]+)/.test(ua)){
            browser.MQQ = true;
            browser.version = RegExp.$1;
        }
        //chrome
        if(/Chrome\/([\d.]+)/.test(ua)){
            browser.chrome = true;
            browser.version = RegExp.$1;
        }
        //firefox
        if(/Firefox\/([\d.]+)/.test(ua)){
            browser.firefox = true;
            browser.version = RegExp.$1;
        }

        //os
        temp_version = os.version, temp_version_new = getVersion(temp_version);
        os.version = null;
        for(i in os){
            if(os[i]){
                htmlClass = htmlClass + ' ' + i + ' ' + i + '_' + temp_version_new.replace(/_\d*$/, '') + ' ' + i + '_' + temp_version_new;
            }
        }
        os.version = temp_version;

        //android平稳降级class
        if(os.android){
            (function(){
                var ver = +os.version.replace(/^(\d+(?:\.\d+)?).*/, '$1');
                if(ver <= 2.3){       ;
                    htmlClass = htmlClass + ' lteAndroid_2_3';
                    os['lteAndroid_2_3'] = true;
                    /*if(ver <= 2.2){
                        htmlClass = htmlClass + ' lteAndroid_2_2';
                        os['lteAndroid_2_2'] = true;
                    }
                    if(ver <= 2.1){
                        htmlClass = htmlClass + ' lteAndroid_2_1';
                        os['lteAndroid_2_1'] = true;
                    }*/
                }
            })();
        }

        //browser
        temp_version = browser.version, temp_version_new = getVersion(temp_version);
        browser.version = null;
        for(i in browser){
            if(browser[i]){
                htmlClass = htmlClass + ' ' + i + ' ' + i + '_' + temp_version_new.replace(/_\d*$/, '') + ' ' + i + '_' + temp_version_new;
            }
        }
        browser.version = temp_version;

        //drivce
        /*for(i in $drivce){
            if($drivce[i]){
                htmlClass = htmlClass + ' ' + i;
            }
        }*/

        D.documentElement.className = (D.documentElement.className + htmlClass).replace(/^\s+/, '');

        APP.os = os, APP.browser = browser, APP.drivce = drivce;
    })();

    //手势
    /**
     * @param {Object} obj
     * @param {Zepto|Jquery} obj.$area 移动区的外层，移动区的范围
     * @param {Zepto|Jquery} obj.$tar 需移动的目标
     * @param {String} obj.direct 手势方向，现有实现 horizontal(水平移动)
     * @param {Boolean} [obj.enable] 是否可用（可选，默认true）
     * @param {Function} [obj.downFn] 按下时需触发的函数（可选，默认空函数）
     * @param {Function} [obj.moveFn] 移动时需触发的函数（可选，默认空函数）
     * @param {Function} [obj.upFn] 提起时需触发的函数（可选，默认空函数）
     */
    var gesture = function(obj){
        !obj.downFn && (obj.downFn = APP.noop);
        !obj.moveFn && (obj.moveFn = APP.noop);
        !obj.upFn && (obj.upFn = APP.noop);
        obj.enable === undefined && (obj.enable = true);

        var $area = obj.$area, $tar = obj.$tar,
            sX = null, sY = null, dX = null, dY = null, time = 10000, lock = false,
            dirX = false, dirY = false,
            direct = 'none';

        var gestureCheckFn, gestureMoveFn, gestureUpFn;

        switch(obj.direct){
            //水平
            case 'horizontal':
                gestureCheckFn = function(e, abs_dX, abs_dY){
                    if(abs_dX > abs_dY){
                        e.preventDefault();
                        dirX = true;
                    }
                };
                gestureMoveFn = function(e){
                    if(dirX){
                        e.preventDefault();
                        obj.moveFn(e, dX, dY);
                    }
                };
                gestureUpFn = function(e){
                    if(dirX){
                        if (time < 400 || Math.abs(dX) > $tar.width() / 2) { //间隔时间和移动判断
                            direct = dX > 0 ? 'right' : 'left';
                        };
                    }
                };
                break;
            //垂直
            case 'vertical':
                gestureCheckFn = function(e, abs_dX, abs_dY){
                    if(abs_dY > abs_dX){
                        e.preventDefault();
                        dirY = true;
                    }
                };
                gestureMoveFn = function(e){
                    if(dirY){
                        e.preventDefault();
                        obj.moveFn(e, dX, dY);
                    }
                };
                gestureUpFn = function(e){
                    if(dirY){
                        if (time < 400 || Math.abs(dY) > $tar.height() / 2) { //间隔时间和移动判断
                            direct = dY > 0 ? 'down' : 'up';
                        };
                    }
                };
                break;
            //4方向
            case '4_direction':
                gestureCheckFn = function(e, abs_dX, abs_dY){
                    e.preventDefault();
                    if(abs_dX > abs_dY){
                        dirX = true;
                    }else{
                        dirY = true;
                    }
                }
                gestureMoveFn = function(e){
                    if(dirY || dirX){
                        e.preventDefault();
                        obj.moveFn(e, dX, dY);
                    }
                };
                gestureUpFn = function(e){
                    if(dirX){
                        if (time < 400 || Math.abs(dX) > $tar.width() / 2) { //间隔时间和移动判断
                            direct = dX > 0 ? 'right' : 'left';
                        };
                    }else if(dirY){
                        if (time < 400 || Math.abs(dY) > $tar.height() / 2) { //间隔时间和移动判断
                            direct = dY > 0 ? 'down' : 'up';
                        };
                    }
                };
                break;
            default:
                gestureCheckFn = function(e, abs_dX, abs_dY, obj){}
                break;
        };

        var moveFn = function (e) {
                var tar = e.targetTouches ? e.targetTouches[0] : e;
                dX = tar.pageX - sX;
                dY = tar.pageY - sY;
                if(lock){
                    var abs_dX = Math.abs(dX), abs_dY = Math.abs(dY);
                    if(abs_dX > 3 || abs_dY > 3){ //判断趋势，不能先preventDefault，会使所有移动都无效
                        gestureCheckFn(e, abs_dX, abs_dY);
                        lock = false;
                    }else{
                        e.preventDefault();
                    }
                }else{ gestureMoveFn(e); }
            },
            upFn = function (e) {
                $tar.off(moveEvt, moveFn);
                time = new Date().getTime() - time;
                gestureUpFn(e);
                $area.off(cancelEvt, cancelFn);
                obj.upFn(e, direct, dX, dY);
                sX = null, sY = null, dX = null, dY = null, time = 10000, lock = false, dirX = false, dirY = false,
                direct = 'none';
            },
            cancelFn = function(e){
                var t = e.relatedTarget;

                if (!t) {
                    upFn(e);
                    return;
                }

                while (t = t.parentNode) if (t === $area[0]) return;

                upFn(e);
            };

        $tar.on(downEvt, function(e){
            if(obj.enable){
                var tar = e.target, nodeName = tar.nodeName;
                if(nodeName !== 'INPUT' && nodeName !== 'TEXTAREA'){
                    lock = true;
                    var evt = e.targetTouches ? e.targetTouches[0] : e;
                    sX = evt.pageX;
                    sY = evt.pageY;
                    time = new Date().getTime();
                    obj.downFn(e);
                    $tar.on(moveEvt, moveFn).one(upEvt, upFn);
                    $area.on(cancelEvt, cancelFn);
                }
            }
        });

        //防止使用鼠标时，在拖动时遇到禁止拖动元素，会阻断move事件
        if(useMouse){
            var _hasMove = false;

            obj.$tar.on(downEvt, function(e){
                var tar = e.target, nodeName = tar.nodeName;
                if(nodeName !== 'INPUT' && nodeName !== 'TEXTAREA'){
                    _hasMove = false;
                    obj.$tar.one(moveEvt, function(e){ _hasMove = true; });
                    return false;
                }
            }).on('click', function(e){
                    if(_hasMove){ return false; }
                });
        }
    };

    //防止window下resize有2次
    var winViewSizeChangeMgr = (function(){
        var evtArr = [], evtArrLen = 0, docW = winView.getWidth(), docH = winView.getHeight(), i = 0,
            runAllEvt = function(){
                for(i = 0; i < evtArrLen; ++i){
                    evtArr[i](docW, docH);
                }
            },
            onResize = function(){
                var temp_winW = winView.getWidth(), temp_winH = winView.getHeight();
                if(docW !== temp_winW || docH !== temp_winH){
                    docW = temp_winW, docH = temp_winH;
                    winView.width = docW;
                    winView.height = docH;
                    evtArrLen > 0 && runAllEvt();
                }
            };

        winView.width = docW;
        winView.height = docH;

        $win.on(viewChangeEvt, APP.os.android ? function(){ setTimeout(onResize, 300) } : onResize);

        return {
            addEvt: function(cb){
                evtArr.push(cb);
                ++evtArrLen;
            },
            removeEvt: function(cb){
                for(var i = 0; i < evtArrLen; ++i){
                    if(cb === evtArr[i]){
                        evtArr.splice(i, 1);
                        --evtArrLen;
                    }
                }
            }
        }
    })();
    winView.addSizeChangeEvt = winViewSizeChangeMgr.addEvt;
    winView.removeSizeChangeEvt = winViewSizeChangeMgr.removeEvt;

    //
    W.APP = APP = $.extend(APP, {
        //urls: urls,
        //在浏览器识别时已定义 os:{}, browser:{}, drivce:{},
        has3d: has3d,
        hasTouch: hasTouch,
        hasPointer: hasPointer,
        useMouse: useMouse,
        vendor: vendor,
        cssVendor: cssVendor,
        downEvt : downEvt,
        moveEvt : moveEvt,
        upEvt : upEvt,
        cancelEvt : cancelEvt,
        transitionEndEvt : transitionEndEvt,
        animationEndEvt : animationEndEvt,
        noop : noop,
        jsBaseLib:jsBaseLib,
        winView: winView,
        gesture: gesture
    });

    //返回顶部
    $('#goTop').on('click', function(){ W.scrollTo(0,0); });

    if(APP.browser.UC){ //UC浏览器兼容
        $('body').on('click', 'a', function(e){ //a点击后，里面的所有内容变紫
            var self = this;
            self.href && !self.target && self.href.indexOf('javascript:') === -1 && (e.preventDefault(), location.href = self.href);
        });
    }
})(document, window);