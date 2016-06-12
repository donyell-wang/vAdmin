/**
* Created by wangdy-a on 2016/02/16.
*/
avalon.ready(function () {

    var advanceVM = avalon.define({
        $id: "demo_advance_vm",
        demo_advance_1_click:'',
        demo_advance_2_click:'',
        demo_advance_3_click:'',
        page_name:'',
        event_name:''
    });

    advanceVM.$watch("demo_advance_1_click", function () {
        advanceVM.page_name="Advance 1";
        advanceVM.event_name="advance 1 ";
    });
    advanceVM.$watch("demo_advance_2_click", function () {
        advanceVM.page_name="Advance 2";
        advanceVM.event_name="advance 2 ";
    });
    advanceVM.$watch("demo_advance_3_click", function () {
        advanceVM.page_name="Advance 3";
        advanceVM.event_name="advance 3 ";
    });

    //init
    !function(){

    }();

    avalon.scan();

});
