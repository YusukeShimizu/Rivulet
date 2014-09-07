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
        // allocate templates
        templates: {
            func : function templates(stream,plugin){
                window.templates = stream.templates;
            }
        },
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
                $("#meta").on("click",".logout",function (e) {
                    //Cancel only the default action
                    e.preventDefault();
                     // delete cookie
                    cookie.set("token", "");
                    location.reload();
                });
                // main header
                $("#header").on("click","#mainnav a",function(e){
                    var a = $(this);
                    a.blur();
                    var li = a.closest("li");
                    // special case for new tweet
                    if(li.hasClass("add")) { 
                        e.preventDefault();
                        if($("#mainstatus").hasClass("show")) {
                            $("#mainstatus").removeClass("show");
                        } else {
                            $("#mainstatus").addClass("show");
                            // Needs to be aligned after the .slide transition. Setting focus immeditately
                            // delays the transition by about 2 seconds in Chrome.
                            setTimeout(function() {
                                $("#mainstatus").find("[name=status]").focus();
                            }, 500); 
                        }
                    }
                    if(li.hasClass("activatable")) { 
                        a.closest("#mainnav").find("li").removeClass("active");
                        li.addClass("active")
                    }
                    $("#mainstatus").bind("status:send", function () {
                        $("#mainstatus").removeClass("show");
                    });
                });
            }
        },
        personalizeForCurrentUser: {
            func: function personalizeForCurrentUser (stream,plugin) {
                //display screenname
                $("#currentuser-screen_name").text("@"+stream.user.screen_name);
            }
        },
        settingsDialog: {
            func : function settingsDialog(stream,plugin){
                //init settingsdialog
                window.settingsDialog.init();
            }
        }
    }
    window.initPlugins = [
        plugins.templates,
        plugins.hashState,
        plugins.navigation,
        plugins.personalizeForCurrentUser,
        plugins.settingsDialog
    ];
})()
