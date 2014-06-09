/* 
 *  list of plugin for initialization
 */

(function(){
    var initplugins = {};
    
    initplugins = {
        // click item activate
        navigation: function navigation(plugin){
            // mainstatus 
            $("#mainstatus").on("close",function(){
                if($("#mainstatus").hasclass("show")){
                    $("#mainstatus").removeClass("show");
                }
            });
            // Logout button
            $("#meta").delegate(".logout", "click", function (e) {
                //Cancel only the default action
                e.preventDefault();
                //connect server
                client.send({
                    action: "logout" 
                });
                location.reload();
            });
        }
    }
    window.initplugins = initplugins;
})()
