/* 
 *  Settings for app.
 *  Settings use namespaces which should be short strings describing component.
 *  Code needs to "register" namespaces and key.
 *  By providing labels, defaultValues and possible values,auto generate a UI.
 */

(function(){
    var settings = {};
    var defaultSettings = {};
    var subscriptions = {};
    var setting;

    //init settings from localStorage
    function init(){
        if(setting){
            return;
        }
        if(window.localStorage){
            var val = window.localStorage["stream.setting"];
            if(val){
                setting = JSON.parse(val);
            }else{
        setting = {};
            }
        }else{
            console.log("need localStorage");
            setting = {};
        }
    }

    window.settings = settings;
})()
