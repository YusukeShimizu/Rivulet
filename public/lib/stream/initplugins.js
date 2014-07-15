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
        //when location.hash change set the class of html body
        hashState: {
            ScrollState :{},
            StyleAppend :{},
            func : function hashState(stream,plugin){
                var win = $(window);
                function change(){
                    var val = location.hash.replace(/^\#/, "");
                    $("body").attr("class",val);
                    var scrollState = plugin.ScrollState[val || "all"];
                    if(scrollState != null){
                        win.scrollTop(scrollState);
                    }
                    if(!plugin.StyleAppend[val] && val != "all") {
                        plugin.StyleAppend[val] = true;
                        var className = val.replace(/[^\w-]/g, "");
                        // to hide everything besides things tagged with the current state
                        var style = '<style type="text/css" id>'+
                            'body.'+className+' #content #stream li {display:none;}\n'+
                            'body.'+className+' #content #stream li.'+className+' {display:block;}\n'+
                            '</style>';
                        style = $(style);
                        $("head").append(style);
                    }
                }   
                win.bind('hashchange', change);
                change();
                var scrollTimer;
                function scrollTimeout() {
                    window.Streamie_Just_Scrolled = false;
                }
                win.bind("scroll", function () {
                    plugin.ScrollState[location.hash.replace(/^\#/, "") || "all"] = win.scrollTop();
                    window.Streamie_Just_Scrolled = true;
                    clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(scrollTimeout, 1000);
                });
            }
        },

        // click item activate
        navigation: {
            func: function navigation(stream,plugin){
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
            func: function personalizeForCurrentUser (stream,plugin) {
                //display screenname
                $("#currentuser-screen_name").text("@"+stream.user.screen_name);
            }
        }
    }
    window.initPlugins = [
        plugins.hashState,
        plugins.navigation,
        plugins.personalizeForCurrentUser
    ];
})()
