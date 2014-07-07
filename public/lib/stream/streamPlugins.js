/* 
 * list of plugins for timeline processing 
 */

(function(){

    settings.registerNamespace("filter", "Filter");
    settings.registerKey("filter", "longConversation", "Filter long (more than 3 tweets) conversations of others",  false);
    settings.registerNamespace("stream", "Stream");
    settings.registerKey("stream", "showRetweets", "Show Retweets",  true);
    settings.registerKey("stream", "keepScrollState", "Keep scroll level when new tweets come in",  true); 

    plugins = {
        //turns retweet into something similar to tweets
        handleRetweet: {
            func: function handleRetweet(tweet){
                if(tweet.retweeted_status){
                    if(settings.get("stream","showRetweets")){
                        var orig = tweet;
                        tweet.data = tweet.retweeted_status;
                        tweet.retweet = orig;
                    }else{
                        console.log(JSON.stringify(tweet,null," "));
                        return;
                    }
                }
                this();
            }
        },
        // only show tweet, though streaming api send any oher kind of data
        tweetsOnly: {
            func: function tweetsOnly(tweet,stream){
                if(tweet.text != null){
                    tweet.created_at = new Date(tweet.created_at);
                    this();
                }else{
                }
            }
        },

        //set the template
        template: {
            func: function template(tweet,stream){
                tweet.template = _.template(templates.tweet);
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
                stream.canvas().prepend(tweet.node);
                this();
            }
        },
        //render image to canvas
        canvasImage: {
            func: function canvasImage (image){
                tweet.node.find('canvas[data-src]').each(function(){
                    var canvas = this;
                    var src = canvas.getAttribute('data-src');
                    var ctx = canvas.getContext('2d');
                    var img = new Image;
                    img.src = src;
                    img.onload = function() {
                        ctx.drawImage(img,0,0,canvas.width,canvas.height);
                    }
                });
                this();
            }
        }
    }
    window.streamPlugins = [
        plugins.handleRetweet,
        plugins.tweetsOnly,
        plugins.template,
        plugins.renderTemplate,
        plugins.prepend
    ];
})()
