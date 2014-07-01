/* 
 * list of plugins for timeline processing 
 */

(function(){

    settings.registerNamespace("filter", "Filter");
    settings.registerKey("filter", "longConversation", "Filter long (more than 3 tweets) conversations of others",  false);
    settings.registerNamespace("stream", "Stream");
    settings.registerKey("stream", "showRetweets", "Show Retweets",  true);
    settings.registerKey("stream", "keepScrollState", "Keep scroll level when new tweets come in",  true); 

    var streamPlugins = {};
    var template = {};
    //set the template
    streamPlugins = {
        template: {
            func: function renderTemplate(tweet,stream){
                tweet.template = _.template(template.tweet);
                this();
            }
        },
        renderTemplate: {
            func: function renderTemplate(tweet,stream){
                tweet.html = tweet.template({
                    stream: stream,
                    tweet: tweet,
                    helpers: helpers
                });
                this();
            }
        },
        //put the tweet into the stream
        prepend: {
            func: function prepend(tweet,stream){
                var previous_node = tweet.node;
                tweet.node = $(tweet.html);
                //give access
                tweet.node.data("tweet",tweet);
                stream.canvas().prpend(tweet.node);
                this();
            }
        }
    }
    window.streamPlugins = streamPlugins;
})()
