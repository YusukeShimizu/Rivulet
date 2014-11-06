/* 
 * list of plugins for timeline processing 
 */

(function(){

    settings.registerNamespace("filter", "Filter");
    settings.registerKey("not work, for now", "longConversation", "Filter long (more than 3 tweets) conversations of others",  false);
    settings.registerNamespace("stream", "Stream");
    settings.registerKey("stream", "showRetweets", "Show Retweets",  true);
    settings.registerKey("stream", "keepScrollState", "Keep scroll level when new tweets come in",  true); 

    var Tweets = {};
    var Conversations = {};
    var ConversationCounter = 0;

    plugins = {
        // Twitter changed some of the IDs to have a second variant that is represented
        // as a string because JavaScript does not handle numbers above 2**43 well.
        stringIDs: {
            func: function stringIDs (tweet) {
                var data = tweet.data;
                data.id = data.id_str;
                data.in_reply_to_status_id = data.in_reply_to_status_id_str;
                if(data.retweeted_status) {
                    data = data.retweeted_status
                    data.id = data.id_str;
                    data.in_reply_to_status_id = data.in_reply_to_status_id_str;
                }
                this();
            }
        },
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
                    if(tweet.data.user.id == stream.user.id) {
                        tweet.yourself = true;
                    }
                    tweet.created_at = new Date(tweet.data.created_at);
                    this();
                }else{
                    if(tweet.data["delete"]) {
                        var del = tweet.data["delete"];
                        if(del.status) {
                            var tweet = Tweets[del.status.id_str];
                            $(document).trigger("tweet:delete", [ del, tweet ]);
                            if(tweet) {
                                tweet.deleted = true;
                                if(tweet.node) {
                                    tweet.node.addClass('deleted');
                                }
                            }
                        }
                    }
                }
            }
        },
        // marks a tweet whether we've ever seen it before using localStorage
        everSeen: {
            func: function everSeen (tweet, stream) {
                var key = "tweet"+tweet.data.id;
                if(window.localStorage) {
                    keyValueStore.Store("screen_names").set("@"+tweet.data.user.screen_name, 1);
                    if(window.localStorage[key]) {
                       tweet.seenBefore = true;
                    } else {
                        window.localStorage[key] = 1;
                    }
                    var data = tweet.retweet ? tweet.retweet : tweet.data;
                    var newest = stream.newestTweet();
                    if(data.id > newest) {
                        stream.newestTweet(data.id);
                    }
                }
                this();
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
        // group the tweet into conversation
        // by tracking the root node of conversation
        conversations: {
            func: function conversations(tweet, stream, plugin) {
                var id = tweet.data.id;
                var in_reply_to = tweet.data.in_reply_to_status_id;
                if(tweet.data._conversation) {
                    tweet.conversation = Conversations[id] = tweet.data._conversation
                }
                else if(Conversations[id]){
                    tweet.conversation = Conversations[id];
                }
                else if(Conversations[in_reply_to]){
                    tweet.conversation = Conversations[id] = Conversations[in_reply_to];
                }
                else{
                    tweet.conversation = Conversations[id] = {
                        index: ConversationCounter++,
                        tweets: 0,
                        authors: {}
                    };
                    if(in_reply_to){
                        Conversations[in_reply_to] = tweet.conversation;
                    }
                }
                tweet.conversation.tweets++;
                tweet.conversation.authors[tweet.data.user.screen_name] = true;

                tweet.fetchNotInStream = function(cb){
                    var in_reply_to = tweet.data.in_reply_to_status_id;
                    if(in_reply_to && "!Tweets[in_reply_to]"){
                        restAPI.use("reply", "/reply", in_reply_to, function(data){
                            if(data){
                                data._after = tweet;
                                data._conversation = tweet.conversation;
                                stream.process(data);
                                if(cb){
                                    cb(data);
                                }
                            }
                        })
                    }
                };
                this();
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
        // Format text to HTML hotlinking, links, things that looks like links, scree names and hash tags
        // Also filters out some more meta data and puts that on the tweet object. Currently: hashTags
        formatTweetText: {
            //from http://gist.github.com/492947 and http://daringfireball.net/2010/07/improved_regex_for_matching_urls
            GRUBERS_URL_RE: /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>??a?a?g?h?e?f]))/ig,
            SCREEN_NAME_RE: /(^|\W)\@([a-zA-Z0-9_]+)/g,
            HASH_TAG_RE:    /(^|\s)\#(\S+)/g,
            func: function formatTweetText (tweet, stream, plugin) {
                var text = tweet.textHTML;
                var urls;
                if(tweet.data.entities) {
                    urls = tweet.data.entities.urls; // Twitter sends parsed URLs through the new tweet entities.
                }
                text = text.replace(plugin.GRUBERS_URL_RE, function(url) {
                    var displayURL = url;
                    var targetURL = (/^\w+\:\//.test(url)?'':'http://') + url;
                    // Check if there is a URL entity for this. If yes, use its display and target URL.
                    urls.forEach(function(urlObj) {
                        if(urlObj.url == url) {
                            if(urlObj.display_url) {
                                displayURL = urlObj.display_url;
                            }
                            if(urlObj.expanded_url) {
                                targetURL = urlObj.expanded_url;
                            }
                        }
                    });
                    return '<a href="'+helpers.html(targetURL)+'">'+helpers.html(displayURL)+'</a>';
                })
					
                // screen names
                text = text.replace(plugin.SCREEN_NAME_RE, function (all, pre, name) {
                    return pre+'<a href="http://twitter.com/'+name+'" class="user-href">@'+name+'</a>';
                });
                // hash tags
                tweet.hashTags = [];
                text = text.replace(plugin.HASH_TAG_RE, function (all, pre, tag) {
                    tweet.hashTags.push(tag);
                    return pre+'<a href="http://search.twitter.com/search?q='+encodeURIComponent(tag)+'" class="tag">#'+tag+'</a>';
                });
                tweet.textHTML = text;
                this();
            }
        },
        // runs the link plugins
        executeLinkPlugins: {
            func: function executeLinkPlugins (tweet, stream) {
                var node = $("<div>"+tweet.textHTML+"</div>");
                var as = node.find("a");
          
                as.each(function () {
                    var a = $(this);
                    stream.linkPlugins.forEach(function (plugin) {
                        plugin.func.call(function () {}, a, tweet, stream, plugin);
                    })
                })
          
                tweet.textHTML = node.html();
                this();
            }
        },
        // Trigger a custom event to inform everyone about a new tweet
        newTweetEvent: {
            func: function newTweetEvent (tweet) {
                // { custom-event: tweet:new }
                if(!tweet.prefill) {
                    tweet.node.trigger("tweet:new", [tweet])
                }
                this();
            }
        },
        //when we insert the tweet
        keepScrollState: {
            WIN: $(window),
            func: function keepScrollState (tweet,stream, plugin) {
                var next = tweet.node.next();
                if(next.length > 0){
                    var height = next.offset().top - tweet.node.offset().top;
                    tweet.height = height;
                    if(settings.get("stream","keepScrollState")){
                        if(!tweet.prefill){
                            var win = plugin.WIN;
                            var cur = win.scrollTop();
                            var top = cur + height;
                            win.scrollTop(top);
                        }
                    }
                }
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
                if(tweet.past){
                    stream.canvas().append(tweet.node);
                }else{
                    stream.canvas().prepend(tweet.node);
                }
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
        plugins.stringIDs,
        plugins.handleRetweet,
        plugins.tweetsOnly,
        plugins.everSeen,
        plugins.mentions,
        plugins.avoidDuplicates,
        plugins.conversations,
        plugins.template,
        plugins.htmlEncode,
        plugins.formatTweetText,
        plugins.executeLinkPlugins,
        plugins.renderTemplate,
        plugins.prepend,
        plugins.keepScrollState,
        plugins.newTweetEvent,
        plugins.canvasImage
    ];
})()
