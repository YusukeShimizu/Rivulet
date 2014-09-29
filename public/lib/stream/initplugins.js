/* 
 *  list of plugin for initialization
 */

(function(){
   
    //register settings
    settings.registerNamespace("curation", "curation");
    settings.registerNamespace("not work, for now", "not work, for now")
    settings.registerKey("not work, for now", "curation_timeline", "show curated timeline(the Candy way)",  true);
    settings.registerNamespace("notifications", "Notifications");
    settings.registerKey("notifications", "tweets", "Notify for new tweets (yellow icon)",  true);
    settings.registerKey("notifications", "mentions", "Notify for new mentions (green icon)",  true);
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
                    window.Just_Scrolled = false;
                }
                win.bind("scroll", function () {
                    plugin.ScrollState[location.hash.replace(/^\#/, "") || "all"] = win.scrollTop();
                    window.Just_Scrolled = true;
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
                    if($("#mainstatus").hasClass("show")){
                        $("#mainstatus").removeClass("show");
                    }
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
        signalNewTweets: {
            func: function signalNewTweets(){
                var win = $(window);
                var dirty = win.scrollTop() > 0;
                var newCount = 0;

                function redraw(){
                    var signal = newCount > 0 ? "("+newCount+")":"";
                    document.title = document.title.replace(/^(?:\(\d+\) )*/, signal);
                }

                win.bind("scroll", function () {
                    dirty = win.scrollTop() >0;
                    if(!dirty){
                        newCount = 0;
                        setTimeout(function(){
                            $(document).trigger("tweet:unread",[newCount]);
                            $(document).trigger("notify:tweet:unread",[newCount]);
                        },0);
                    }
                });
                $(document).bind("notify:tweet:unread",function(){
                    redraw();
                });
                $(document).bind("tweet:new",function(e,tweet){
                    newCount++;
                    $(document).trigger("tweet:unread", [newCount, tweet.mentioned]);
                });
            }
        },
        // change unread event into notify
        throttableNotifactions: {
            func: function throttableNotifactions () {
                $(document).bind("tweet:unread", function (e, count, isMention) {
                    function notify() {
                        $(document).trigger("notify:tweet:unread", [count, isMention]);
              
                        if(settings.get('notifications', 'sound')) {
                            var audio = $('<audio />')
                            audio.attr({
                                src: '/sounds/new_tweet.wav',
                                autoplay: true
                            });
                            audio.hide();
                            audio.bind('ended', function() {
                                audio.remove()
                            });
           
                            $('body').append(audio)
                        }
                    }
                    if(isMention) {
                        if(settings.get("notifications", "mentions")) {
                            notify();
                        }              
                    } else {
                        if(settings.get("notifications", "tweets")) {
                            notify();
                        }
                    }
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
        },
        // listen to keyboard events and translate them to semantic custom events
        keyboardShortCuts: {
            func: function keyboardShortCuts () {
          
                function trigger(e, name) {
                    $(e.target).trigger("key:"+name);
                }
          
                $(document).keyup(function (e) {
                    if(e.keyCode == 27) { // escape
                        trigger(e, "escape")
                    }
                })
            }     
        },
                // display state in the favicon
        favicon: {        
            func: function favicon (stream, plugin) {
                var importantActive = false;
                $(document).bind("notify:tweet:unread", function (e, count, isMention) {
                    var url;
                    if(count > 0) {
                        url =  "images/candy-unread.ico";
                        if(isMention) {
                            url = "images/candy-mention.ico";
                            importantActive = true;
                        } else {
                            if(importantActive) { // we should not change away
                                return;
                            }
                        }
                    } else {
                        importantActive = false;
                        url = "images/candy-empty.ico"; 
                    }
                    // remove the current favicon. Just changing the href doesnt work.
                    var favicon = $("link[rel~=icon]")
                    favicon.remove();
                    // put in a new favicon
                    $("head").append($('<link rel="shortcut icon" type="image/x-icon" href="'+url+'" />'));
                })
            }
        },
        currentTimelines: {
            func: function currentTimelines(stream,plugin) {
                restAPI.timeline('userTimeline',function(data,status){
                    if(status == "success"){
                        data.forEach(function(tweet){
                            tweet.data = tweet;
                            stream.process(tweet);      
                        });
                    }else{
                        alert("Refresh! (3)can't get current timeLine.Sorry :(");
                    }
                });
                
                /* What is the best way to show mentions?
                restAPI.timeline('userMention',function(data){
                    data.forEach(function(tweet){
                        tweet.data = tweet;
                        stream.process(tweet);      
                    });
                })
                */
            }
        }
    }
    window.initPlugins = [
        plugins.templates,
        plugins.hashState,
        plugins.navigation,
        plugins.signalNewTweets,
        plugins.throttableNotifactions,
        plugins.personalizeForCurrentUser,
        plugins.settingsDialog,
        plugins.keyboardShortCuts,
        plugins.currentTimelines
    ];
})()
