/**
* Created by wangdy-a on 2016/02/16.
*/
avalon.ready(function () {
    var managerVm,
    test_data_general, test_data_publish;

    //init test data
    !function init() {
        $.getJSON('widgets/demos/articles/general_and_publish/test_data.json', function(data) {
            test_data_general = data;
        });
        test_data_publish = [];
    }();

    managerVm = avalon.define({
        $id: "demo_article_vm",
        articles_general_click:'',
        articles_publish_click:'',
        page_name:'',
        event_name:'',

        articlesItems:[],
        functionList:{
            edit:false,
            delete:false,
            confirmRelease:false,
            denyRelease:false
        },
        setData:function(data){
            // managerVm.articlesItems.clear();
            managerVm.articlesItems = data;
            if(!data ||  data.length === 0 ||  data.length <managerVm.pageSize)
            managerVm.noMorePage = true;
        },
        switchList:function(id){
            managerVm.clear();
            switch (id){
                case 'general':
                managerVm.setData(test_data_general);
                managerVm.setFuncEnable({
                    edit:true,
                    delete:true
                });
                break;
                case 'publish':
                managerVm.setData(test_data_publish);
                managerVm.setFuncEnable({
                    confirmRelease:true,
                    denyRelease:true
                });
                break;
            }
        },
        setFuncEnable:function (obj) {
            $.each(managerVm.functionList, function (key, val) {
                if(managerVm.functionList[key] === true && !(obj[key] && obj[key] === true) ){
                    managerVm.functionList[key] = false;
                }
                if(managerVm.functionList[key] === false && (obj[key] && obj[key] === true) ){
                    managerVm.functionList[key] = true;
                }
            });
        },
        clear:function(){
            managerVm.articlesItems=[];
        }
    });

    managerVm.$watch("articles_general_click", function () {
        managerVm.page_name="General";
        managerVm.event_name="General";
        managerVm.switchList('general');
    });
    managerVm.$watch("articles_publish_click", function () {
        managerVm.page_name="Publish";
        managerVm.event_name="Publish";
        managerVm.switchList('publish');
    });

    avalon.scan();

});
