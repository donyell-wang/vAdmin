/**
 * Created by xiongc on 2015/11/4.
 */
var KKXZJS = KKXZJS || {};
KKXZJS.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null)
        return decodeURIComponent(r[2]); return null; //返回参数值
};
//从用户icon字段中取用户头像地址
KKXZJS.getIconFromList = function (list,idx) {//list:字段，idx:序号(0-32px,1-48px,2-120px,3-200px)
    var iconList = list.replace(/"/g,'');
    iconList = iconList.replace(/\\/g,'');
    iconList = iconList.slice(1,iconList.length-1);
    iconList = iconList.split(',');

    if(idx !== undefined){
        return iconList[idx];
    }else{
        return iconList[0];
    }
};
KKXZJS.subString = function (str, len, hasDot) {
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex,"**").length;
    for(var i = 0;i < strLength;i++)
    {
        singleChar = str.charAt(i).toString();
        if(singleChar.match(chineseRegex) != null)
        {
            newLength += 2;
        }
        else
        {
            newLength++;
        }
        if(newLength > len)
        {
            break;
        }
        newStr += singleChar;
    }

    if(hasDot && strLength > len)
    {
        newStr += "...";
    }
    return newStr;
};
KKXZJS.ISIEBrowser = function(){
    var brName = navigator.userAgent.toLowerCase();
    return (/msie/i.test(brName) || /trident\/7.0/i.test(brName)) && !/opera/.test(brName);
    //return navigator.userAgent.toLowerCase().indexOf("msie 8.0") != "-1" || navigator.userAgent.toLowerCase().indexOf("msie 9.0") != "-1" || navigator.userAgent.toLowerCase().indexOf("msie 10.0") != "-1" || navigator.userAgent.toLowerCase().indexOf("msie 11.0") != "-1"   ? true : false;
};
//验证用户是否登录，若未登录跳转至登录页面，若已登录写入全局、返回值为用户信息
KKXZJS.validateUser = function(returnURL ,isLogin, isNotLogin){//登陆后跳转至returnURL
    var userInfo,
        DA;

    isLogin = isLogin || function(result){
            //yes
            userInfo = result;
            localStorage.setItem("KKXZ_LOGINACCOUNT",JSON.stringify(result));

            var _app = window.app = window.app || {};
            _app.userInfo = result;
        };
    isNotLogin = isNotLogin || function(){
            //no
            window.localStorage.clear();
            window.location.href = "/page/login.html?ReturnUrl=" + returnURL;
        }
    DA = {
        getUserInfo: function(callback, errorCallback) {
            var rqObj = {
                url:"/account/getUserInfo.action",
                type:"get",
                async: false,
                contentType: "application/json; charset=utf-8",
                success:callback,
                error:errorCallback
            }
            KKXZJS.ajax.request(rqObj);
        }
    };

    DA.getUserInfo(isLogin,isNotLogin);

    if(userInfo){
        return userInfo;
    }else{
        return false;
    }
};
KKXZJS.getLocalUser = function(){
    var account =  localStorage.getItem("KKXZ_LOGINACCOUNT");
    if(account){
        account = $.parseJSON(account);
        return account;
    }
    return;
};
KKXZJS.ajax = function(){
    var status = {
        408: "请求超时",
        400: "400错误：请求失败",
        403: "403错误：禁止访问",
        404: "404错误：资源未找到",
        500: "500错误：服务器内部错误",
        503: "5500错误：服务器不可用",
        401: "请先登录，跳转中...",
        'unauthorized': '用户未登录或登录信息已过期，请重新登录'
    };
    var err = function (xhr, code, err) {
        KKXZJS.utils.showMsg(status[code] || err.error_msg || status[xhr.status]);
        if (err == 'Unauthorized' || code == 401 || xhr.status == 401 ){
            setTimeout(function(){
                window.location.href="/console/widgets/common/login/login.html?ReturnUrl="+window.location.href;
            },1000);
        }
    };
    var url = function (url) {
        return url + ((url.indexOf('?') < 0) ? '?' : '&') + 'ts=' + new Date().getTime();
    };
    return {
        request: function (opts) {
            if(!opts.url)
                return;
            var successFn = opts.success || void 0;
            var error = opts.error || err;
            var type = (opts.type && opts.type.toUpperCase() === "POST") ? "POST" : "GET";
            var result = $.ajax({
                type: type,
                async: opts.async === false ? false : true,
                url: url(opts.url),
                timeout: opts.timeout || 600000,
                dataType: opts.dataType || "json",
                contentType: "application/json; charset=utf-8",
                data: (type === "POST") ? (opts.data && opts.data.constructor == String) ? opts.data : JSON.stringify(opts.data) : (opts.data || undefined),
                beforeSend: function (XMLHttpRequest) {
                    //ShowLoading();
                },
                success: function (data, xhr) {
                    if (data) {
                        if (data.success) {
                            if (successFn) {
                                successFn(data.data, opts.callbackArgs);
                            }
                        } else {
                            error(xhr, data.error_code, data);
                        }
                    }
                    else if (successFn) {
                        successFn(opts.callbackArgs);
                    }
                },
                complete: function (XMLHttpRequest, textStatus) {
                    //HideLoading();
                },
                error:error
            });
            var response;
            var isJson = typeof (result.responseJSON) == "object";
            if (isJson) {
                return result.responseJSON;
            }

            try {
                if (result && result.responseJSON) {
                    response = eval("(" + result.responseJSON + ")");
                }
                else {
                    response = eval("(" + result.responseText + ")");
                }
            } catch (e) {
                response = result.responseJSON;
            }

            return response;
        },
        loadHTML: function (opts) {
            var error = opts.error || err;
            var callcack = opts.success || void 0;
            var success = function (t) {
                var arr = t.match(/<body[^>]*>([\s\S.]*)<\/body>/i), s;
                if (arr == null) {
                    s = t;
                }
                else {
                    s = arr[0];
                    s = s.substr(6, s.length - 13);
                }
                callcack(s);
            };
            $.ajax({
                url: url(opts.url),
                success: success,
                failure: error,
                async: opts.async === false ? false : true,
                dataType: 'text'
            });
        },
        //跨域载入html
        loadHTML_CORS: function(opts){
            var error = opts.error || err;
            var callback = opts.success || void 0;
            var success = function (t) {
                //var arr = t.match(/<body[^>]*>([\s\S.]*)<\/body>/i), s;
                //if (arr == null) {
                //    s = t;
                //}
                //else {
                //    s = arr[0];
                //    s = s.substr(6, s.length - 13);
                //}
                //callcack(s);
                callback(t);
            };

            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                // 此时即支持CORS的情况
                // 检查XMLHttpRequest对象是否有“withCredentials”属性
                // “withCredentials”仅存在于XMLHTTPRequest2对象里
                $.ajax({
                    url: url(opts.url),
                    xhrFields: {
                        withCredentials: false
                    },
                    async:true,
                    crossDomain: true,
                    success: success,
                    error:error
                });

            } else if (window.XDomainRequest) {

                // 否则检查是否支持XDomainRequest，IE8和IE9支持
                // XDomainRequest仅存在于IE中，是IE用于支持CORS请求的方式
                xdr = new XDomainRequest();
                if (xdr){
                    xdr.onerror = error;
                    xdr.ontimeout = error;
                    //xdr.onprogress = progres;
                    xdr.onload = function(){
                        callback(xdr.responseText);
                    };
                    //xdr.timeout = opts.timeout || 600000;
                    xdr.open("get", url(opts.url));
                    xdr.send();
                }
                else
                {
                    KKXZJS.utils.showMsg('请升级浏览器版本');
                }

            } else {
                // 否则，浏览器不支持CORS
                KKXZJS.utils.showMsg('请升级浏览器版本');
            }
        }
    };
}();

KKXZJS.utils = KKXZJS.utils||{};
KKXZJS.utils = function(){
    var sDlgHtml ='<div class="modal-dialog" aria-hidden="true" >'
        + '<div class="modal-content cdlg_content cdlg_no_radius">'
        + '<div class="modal-header cdlg_header">'
        + '<button type="button" class="close cdlg_close"><span aria-hidden="true">&times;</span></button>'
        + '<h4 class="modal-title cdlg_title" id="myModalLabel"></h4>'
        + '</div>'
        + '<div class="modal-body cdlg_body" ></div>'
        + '<div class="modal-footer cdlg_footer">'
        + '<button type="button" class="btn cbtn_ok btn-ok">确定</button>'
        + '<button type="button" class="btn cbtn_cancel btn-cancel">取消</button>'
        + '</div>'
        + '</div>'
        + '</div>';
    var htmlElm, alertElm;

    var init = function(params){
        var dlgElm;
        if(params === undefined){
            params={};
        }
        return createDlg(params);
        //$(htmlElm).find(".modal-content").draggable({
        //    handle: ".modal-header",
        //    cursor: "default",
        //});
    };
    var createDlg = function(o){
        if (!this.dlgElm) {
            this.dlgElm = document.createElement('div');
            this.dlgElm.className = 'modal fade';
            this.dlgElm.tabindex = '-1';
            this.dlgElm.innerHTML = sDlgHtml;
            document.body.appendChild(this.dlgElm);
            $(this.dlgElm).attr("role", "dialog");
            $(this.dlgElm).attr("aria-labelledby","myModalLabel");
        }
        if (typeof o === 'string') {
            o = { message: o }
        }
        o.closeOnHeader = o.closeOnHeader || true ;

        $(this.dlgElm).find('.modal-title').html( o.title || '提示');
        //if(o.src){
        //    $(this.dlgElm).find('.modal-body').load(o.src, function(){
        //        if(o.avalon && avalon)
        //            avalon.scan();
        //    });
        //}
        if(o.html)
            $(this.dlgElm).find('.modal-body').append(o.html);
        else if(o.message)
            $(this.dlgElm).find('.modal-body').html(o.message);

        if(o.btnCancel){
            $(this.dlgElm).find('.btn-cancel').html(o.btnCancel);
        }else{
            if(o.btnCancel=='')
                $(this.dlgElm).find('.btn-cancel').remove();
        }

        if(o.width){
            if(String(o.width).indexOf('px') == -1){
                $(this.dlgElm).find('.modal-dialog').css('max-width',o.width);
            }else{
                $(this.dlgElm).find('.modal-dialog').css('max-width',o.width+'px');
            }
        }

        if(o.height){
            if(String(o.height).indexOf('px') == -1){
                $(this.dlgElm).find('.modal-body').css('height',o.height);
            }else{
                $(this.dlgElm).find('.modal-body').css('height',o.height+'px');
            }
        }

        $(this.dlgElm).find('.btn-ok').html(o.btnOk || '确定');

        if(!o.closeOnHeader){
            $(this.dlgElm).find('.modal-header .close').remove;
        }
        //htmlElm = this.dlgElm;
        addActions(o);
        return this.dlgElm;
    };
    var addActions = function(o){
        var callback_ = o.callback;
        var elm = $(this.dlgElm);
        var hideDlgOk= function(){
            $(elm).modal('hide');
            if (callback_) callback_(true);
        }
        var hideDlgCancel = function(){
            $(elm).modal('hide');
            if (callback_) callback_(false);
        }
        $(this.dlgElm).find('.modal-footer .btn-ok').unbind().click(hideDlgOk);
        $(this.dlgElm).find('.modal-footer .btn-cancel').unbind().click(hideDlgCancel);
        $(this.dlgElm).find('.modal-header .close').unbind().click(hideDlgCancel);
    };
    var updateContent = function(o){
        if(!o)
            return;

        if (typeof o === 'string') {
            o = { message: o }
        }
        if ( o.title )
            $(this.dlgElm).find( '.modal-title').html(o.title);
        if ( o.html )
            $(this.dlgElm).find('.modal-body').html(o.html);
        else if(o.message)
            $(this.dlgElm).find('.modal-body .inner_msg .title').html(o.message);

        if(o.callback)
            addActions(o);
    };
    var showDlg = function(o){
        jQuery(this.dlgElm).modal('show');
    }

    return{
        showConfirm:function(o){
            if (typeof o === 'string') {
                o = { message: o }
            }
            if(!htmlElm) {
                o.title = o.title || '请确认';
                o.btnOk = o.btnOk || '确认';
                o.btnCancel = o.btnCancel || '取消';
                o.width = 402;
                o.html = '<div class="cmsg_body">'
                    +'<div class="inner_msg">'
                    +'<span class="glyphicon glyphicon-info-sign icon" aria-hidden="true"></span>'
                    +'<h4 class="title">'+o.message+'</h4>'
                    +'</div>'
                    +'</div>';
                htmlElm = init(o);
            };
            var dlgElm = htmlElm;
            updateContent(o);
            showDlg();
        },
        showAlert:function(o){
            if (typeof o === 'string') {
                o = { message: o }
            }
            if(!alertElm) {
                o.title = o.title || '错误 ';
                o.btnOk = o.btnOk || '确认';
                o.btnCancel = o.btnCancel || '';
                o.width = 402;
                o.html = '<div class="cmsg_body">'
                    +'<div class="inner_msg">'
                    +'<span class="glyphicon glyphicon-remove-sign icon" aria-hidden="true" style="color:#FF3F3F"></span>'
                    +'<h4 class="title">'+o.message+'</h4>'
                    +'</div>'
                    +'</div>';
                alertElm = init(o);
            };
            var dlgElm = alertElm;
            updateContent(o);
            showDlg();
        }
    }
}();
KKXZJS.utils.showMsg = function(){
    var timer,hintElm,hintcallback;
    var hideHint = function () {
        $('.hint-mask').removeClass('in');
        $(".message-hint").animate({top:"-32px"},function(){
                $(".message-hint").hide();
                $('.hint-mask').remove();
            }
        );
        if (hintcallback) hintcallback();
    };
    var showHint = function(o){
        var tempmsg,tempbgc;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        if(o.callback)
            hintcallback = o.callback;
        var show = function () {
            $(hintElm).find('.message-body').html(tempmsg);
            $(hintElm).find('.message-body').css('background',tempbgc);
            $(".message-hint").show();
            if(o.mask === true)
                $('.hint-mask').addClass('in');
            $(".message-hint").animate({top:"0px"});

            if(!o.autoClose||o.autoClose === true )
                timer = setTimeout(hideHint,2500);
            else if(o.autoClose === false)
            /* empty */;
            else {
                timer = setTimeout(hideHint, Number(o.autoClose));
            }
        };
        if (!hintElm) {
            hintElm = document.createElement('div');
            hintElm.className = 'message-hint';
            hintElm.innerHTML = '<div class="message-body"><span class="inner"></span></div>';
            hintElm.style.top = '-32px';
            document.body.appendChild(hintElm);
        }
        if(o.mask === true)
            $('body').append('<div class="modal-backdrop fade hint-mask"></div>');

        switch ( o.type ){
            //区分hint类型
            case 'hint':
            case 'hint-info':
                tempmsg = '<span class="glyphicon glyphicon-info-sign icon" aria-hidden="true"></span><span class="text">'+ o.message +'</span>';
                tempbgc = '#F49918';
                break;
            case 'hint-success':
                tempmsg = '<span class="glyphicon glyphicon-ok-sign icon" aria-hidden="true"></span><span class="text">'+ o.message +'</span>';
                tempbgc = '#75BC0F';
                break;
            case 'hint-error':
                tempmsg = '<span class="glyphicon glyphicon-remove-sign icon" aria-hidden="true"></span><span class="text">'+ o.message +'</span>';
                tempbgc = '#F49918';
                break;
            default:
                tempmsg = '<span class="glyphicon glyphicon-info-sign icon" aria-hidden="true"></span><span class="text">'+ o.message +'</span>';
                tempbgc = '#F49918';
                break;
        }
        hintElm.style.display = 'block';
        show();
    };
    return function(o){
        hintcallback = null;
        if(!o)
            return;
        if (typeof o === 'string') {
            o = {
                type:'hint-info',
                message: o,
                autoClose: 3000
            }
        }
        showHint(o);
    }
}();
//通用框使用方法
//KKXZJS.utils.showConfirm('你确定还要试?');
//KKXZJS.utils.showAlert('不能再试了');
//KKXZJS.utils.showMsg('别试了，没有用的');
//KKXZJS.utils.getArticleList = function () {
//
//}();


//增加过滤器
if(!avalon.filters.dateCVT){
    avalon.filters.dateCVT = function (str){
        if(str != null){
            var reldate = new Date(str);
            if(reldate == 'Invalid Date')
                return str||'未知';
            return reldate.toLocaleDateString();
        }else{
            return '';
        }
    }
}

Date.prototype.format = function(format)
{
 var o = {
 "M+" : this.getMonth()+1, //month
 "d+" : this.getDate(),    //day
 "h+" : this.getHours(),   //hour
 "m+" : this.getMinutes(), //minute
 "s+" : this.getSeconds(), //second
 "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
 "S" : this.getMilliseconds() //millisecond
 }
 if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
 (this.getFullYear()+"").substr(4 - RegExp.$1.length));
 for(var k in o)if(new RegExp("("+ k +")").test(format))
 format = format.replace(RegExp.$1,
 RegExp.$1.length==1 ? o[k] :
 ("00"+ o[k]).substr((""+ o[k]).length));
 return format;
}
