/* 
 *  list of plugin for initialization
 */

(function(){
    var initplugins = {};

    // click item activate
    function navigation(){
        // Logout button
        $("#meta").delegate(".logout", "click", function (e) {
            //Cancel only the default action by using .preventDefault().
            e.preventDefault();
            //connect server
            client.send({
                action: "logout" 
            });
            location.reload();
        });
    }

    initplugins.init = function(){
        navigation();
    }
    window.initplugins = initplugins;
})()
