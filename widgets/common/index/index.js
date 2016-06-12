/**
 * Created by Daniel Wang on 2015/11/2.
 */
avalon.ready(function () {
    var mainVM,
        VADMIN_VM_IDS = [ "vadmin_main_vm", "vadmin_navi_vm" ];

    //the main VM used
    mainVM = avalon.define({
        $id: "vadmin_main_vm",
        //options on the control panel
        options:[],
        //the template loading sign
        loading:true,
        //record the event name
        clickEvent:'',
        //template path
        widgetURL:'widgets/common/parts/default_widget/default_widget.html',
        //as the name
        setOptions:function (data) {
            mainVM.options = data;
        },
        //called after ms-include-src template rendered complete
        postProcess:function () {
            mainVM.loading = false;
            if(mainVM.clickEvent){
                mainVM.$fire(mainVM.clickEvent);
            }
        },
        //will be called whatever menu cliced on the control panel
        clickOption:function (item) {
            //switch template page
            if( item.path && item.path != mainVM.widgetURL ){
                mainVM.loading = true;
                //clean up vms saved in avalon.vmodels，in case of any exceptions
                if(avalon.vmodels){
                    for ( var vm_id in avalon.vmodels){
                        if ( avalon.vmodels.hasOwnProperty(vm_id) ){
                            //except of vms of vadmin
                            if ( VADMIN_VM_IDS.indexOf(vm_id) == -1 ){
                                delete avalon.vmodels[vm_id];
                            }
                        }
                    }
                }
                //change the template
                mainVM.widgetURL = item.path;
                //record the event which will be fired after including complete
                if(item.aliasID){
                    mainVM.clickEvent = 'all!' + item.aliasID + '_click';
                }else{
                    mainVM.cickEvent = '';
                }
            }else{
                //broadcast the event
                if(item.aliasID){
                    mainVM.$fire('all!' + item.aliasID + '_click');
                }
            }
            //change the style of btn
            $('.submenu').find('li').removeClass('chosen');
    		$(this).addClass('chosen');

            //optimize for mobile device
            if(document.body.clientWidth < 768){
                if(!$('.control-panel').hasClass('hide-left')){
                    $('.control-panel').addClass('hide-left');
                    $('.control-panel .accordion-menu').fadeOut();
                }
            }
        },
        //show and hide the control panel
        toggleControlPanel:function () {
            if($('.control-panel').hasClass('hide-left')){
                $('.control-panel').removeClass('hide-left');
                $('.control-panel .accordion-menu').fadeIn();
            }else{
                $('.control-panel').addClass('hide-left');
                $('.control-panel .accordion-menu').fadeOut();
            }
        }
    });
    avalon.scan();

    //init with config data
    !function init() {
        //load config data using Json file, you can also use data requested from Server
        $.getJSON('config.json', function(data) {
            var _console = window._console = window._console || {};
            _console.CONFIG = data;
            mainVM.setOptions(data);
        });
    }();
});
