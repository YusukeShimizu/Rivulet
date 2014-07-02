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
    //set the template
    streamPlugins = {
        template: function renderTemplate(tweet,stream){
            tweet.template = _.template(templates.tweet);
        },
        renderTemplate: function renderTemplate(tweet,stream){
            tweet.html = tweet.template({
                stream: stream,
                tweet: tweet,
                helpers: helpers
            });
        },
        //put the tweet into the stream
        prepend: function prepend(tweet,stream){
            var previous_node = tweet.node;
            tweet.node = $(tweet.html);
            //give access
            tweet.node.data("tweet",tweet);
            stream.canvas().prpend(tweet.node);
        }
    }
    window.streamPlugins = streamPlugins;
})()
