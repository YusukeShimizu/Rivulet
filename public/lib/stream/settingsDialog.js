/* 
 *  list of Module for setting dialog
 */

(function(){
    var settingsDialog = {};    

    settingsDialog.init = function(){
        var $template = $('#settingDialog_template').html()
        var template = _.template($template);
        var html = template({
            helpers: "helpers"
        });
        
        $("#settings").html(html);
    }
    window.settingsDialog = settingsDialog;
})()
