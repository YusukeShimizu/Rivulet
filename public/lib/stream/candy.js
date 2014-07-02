/*
 * Main entry point for this app
 * "start" method gets called when the initial dependencies are loaded.
 * I always have jQuery and underscore.js everwhere
 */

//The immediate function pattern to make modules 
(function(){
    var candy = {};
    var initial = true;
    var stream = new tweetstream.Stream(settings);

    candy.start = (function(){
        //using jquery
        $(function(){
            var connect = function(data){
                //data always be JSON
                data = JSON.parse(data);
                //user is now connected and authorization was fine
                stream.user = data.info;
                if(data.action == "auth_OK"){
                    console.log(data)
                    $("#about").hide();
                    $("#header").show();
                    if(initial){
                        initial = false;
                        // initPlugins are loaded when the page is loaded
                        // use method without object
                        jQuery.each(initPlugins,function(key,plugin){
                            plugin.call(function(){},stream,plugin);
                        });
                        //allocate templates
                        window.templates = data.templates;
                        //init settingsdialog
                        settingsDialog.init();
                        //notify any settings
                        $(document).trigger("streamie:init:complete");
                    }
                }else if(data.tweet.text){
                    // We actually received a tweet. Let the stream process it
                    var data = data.tweet;
                    stream.process(data);
                }else{
                    console.log(data);
                }
            }
            //connect to the backend system
            var socket = client.connect(connect);
        })
    })()
})()
