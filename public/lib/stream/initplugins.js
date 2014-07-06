/* 
 *  list of plugin for initialization
 */

(function(){
   
    //register settings
    settings.registerNamespace("general", "General");
    settings.registerKey("general", "showTwitterBackground", "Show my background from Twitter",  false);
    settings.registerNamespace("notifications", "Notifications");
    settings.registerKey("notifications", "tweets", "Notify for new tweets (yellow icon)",  true);
    settings.registerKey("notifications", "mentions", "Notify for new mentions (green icon)",  true);
    settings.registerKey("notifications", "direct", "Notify for new direct messages (blue icon)",  true);
    settings.registerKey("notifications", "sound", "Play a sound for new tweets",  false);

    var plugins = {
        // click item activate
        navigation: {
            func: function navigation(plugin){
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
        },
        personalizeForCurrentUser: {
            func: function personalizeForCurrentUser (stream) {
                //display screenname
                $("#currentuser-screen_name").text("@"+stream.user.screen_name);
            }
        }
    }
    window.initPlugins = [
        plugins.navigation,
        plugins.personalizeForCurrentUser
    ];
})()
