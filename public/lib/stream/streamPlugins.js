/* 
 * list of plugins for timeline processing 
 */

(function(){

    settings.registerNamespace("filter", "Filter");
    settings.registerKey("not work, for now", "longConversation", "Filter long (more than 3 tweets) conversations of others",  false);
    settings.registerNamespace("stream", "Stream");
    settings.registerKey("stream", "showRetweets", "Show Retweets",  true);
    settings.registerKey("not work, for now", "keepScrollState", "Keep scroll level when new tweets come in",  true); 

    var Tweets = {};

    plugins = {
        //turns retweet into something similar to tweets
        handleRetweet: {
            func: function handleRetweet(tweet){
                if(tweet.data.retweeted_status){
                    if(settings.get("stream","showRetweets")){
                        var orig = tweet.data;
                        tweet.data = tweet.data.retweeted_status;
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
                if(tweet.data.text != null){
                    if(stream.count == 0) {
                        $(document).trigger("tweet:first");
                    }
                    stream.count++;
                    tweet.created_at = new Date(tweet.data.created_at);
                    this();
                }else{
                }
            }
        },
        // find all mentions in a tweet. set tweet.mention to true 
        mentions : {
            regex: /(^|\W)\@([a-zA-Z0-9_]+)/g,
            func : function mentions (tweet,stream,plugin){
                var screen_name = stream.user.screen_name;
                tweet.mentions = [];
                tweet.data.text.replace(plugin.regex,function(match,pre,name){
                    if(name == screen_name){
                        tweet.mentioned = true;
                    }
                    tweet.mentions.push(name);
                    return match;
                });
                this();
            }
        },
        // if a tweet with the name id is in the stream already, do not continue
        avoidDuplicates: {
            func: function avoidDuplicates (tweet, stream) {
                var id = tweet.data.id;
                if(Tweets[id] && tweet.streamDirty) {
      	            this();
      	        } else if(Tweets[id]) {
                // duplicate detected -> do not continue;
                } else {
                    Tweets[id] = tweet;
                    this();
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
        //to avoid xss atacks
        htmlEncode: {
            func: function htmlEncode (tweet, stream, plugin) {
                var text = tweet.data.text;
                text = helpers.htmlDecode(text);
                text = helpers.htmlEncode(text);
                tweet.textHTML = text;
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
            func: function canvasImage (tweet){
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
        plugins.mentions,
        plugins.avoidDuplicates,
        plugins.template,
        plugins.htmlEncode,
        plugins.renderTemplate,
        plugins.prepend,
        plugins.canvasImage
    ];
})()
