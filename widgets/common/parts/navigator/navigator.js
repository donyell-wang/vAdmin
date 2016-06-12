/**
 * Created by wangdy-a on 2015/11/20.
 */
avalon.ready(function () {

    var naviVM = avalon.define({
        $id: "vadmin_navi_vm",
        loginState:false,
        userName:'',
        userIcon:'',
        userMsgCount:0,
        account:function(){
            //do things here
        },
        logOut:function(){
            //do things here
        }
    });

    //init
    !function(){
        //some test data, you may fetch data from server
        naviVM.userName = 'Daniel';
        naviVM.userIcon = "/resources/images/default-icon.jpg";
        naviVM.userMsgCount = 3;
        naviVM.loginState=true;
    }();

    avalon.scan();

});
