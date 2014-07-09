/*
 * Main entry point for this app
 * "start" method gets called when the initial dependencies are loaded.
 * I always have jQuery and underscore.js everwhere
 */

//The immediate function pattern to make modules 
(function(){
    var stream = {};
    var initial = true;
    var stream = new tweetstream.Stream(settings);

    stream.start = (function(){

        //using jquery
        $(function(){
            //stream use plugins with asynchronous way
            stream.addPlugins(streamPlugins);
            //stream.addLinkPlugins(linkPlugins);
            //App don't maintain any important state
            location.hash = "";

            var connect = function(data){
                //data always be JSON
                data = JSON.parse(data);
                //user is now connected and authorization was fine
                if(data.action == "auth_OK"){
                    console.log(data)
                    $("#about").hide();
                    $("#header").show();
                    $(document).bind("tweet:first", function () {
                        $("#content .logo").hide();
                    });
                    stream.user = data.info;
                    if(initial){
                        initial = false;
                        // initPlugins are loaded when the page is loaded
                        // use method without object
                        initPlugins.forEach(function(plugin){
                            plugin.func.call(function(){},stream,plugin);
                        });
                        //allocate templates
                        window.templates = data.templates;
                        //init settingsdialog
                        settingsDialog.init();
                        //notify any settings
                        $(document).trigger("streamie:init:complete");
                    }
                }else if(data.tweet){
                    // We actually received a tweet. Let the stream process it
                    var tweet = {};
                    tweet.data = data.tweet;
                    stream.process(tweet);
                }else{
                    console.log(data);
                }
            }
            //connect to the backend system
            var socket = client.connect(connect);
        })
    })()
})()
