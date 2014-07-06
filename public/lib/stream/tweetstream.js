/* 
 * Represent the stream of tweets  
 */

(function(){
    var tweetstream = {};
    
    //I do not use require.js...
    tweetstream.Stream = function Stream(settings){
        this.settings = settings;
        this.plugins = [];
        this.linkPlugins = [];
    }

    tweetstream.Stream.prototype = {
        //authorized user
        user:{
            screen_name: null,
            user_id:null
        },

        // register more plugins for stream processing
        addPlugins: function (plugins) {
            this.plugins.push.apply(this.plugins, plugins);
        },
          
        // register more plugins for link processing
        addLinkPlugins: function (plugins) {
            this.linkPlugins.push.apply(this.linkPlugins, plugins);
        },

        //the newest tweet user ever seen
        newestTweet: function(newID){
            if(newID){
                window.localStorage.newestTweet = newID;
            }
            //10 base numbering system
            return parseInt(window.localStorage.newestTweet || 0, 10);
        },

        //where we draw
        canvas: function(){
            return $("#stream");
        },

        //go through the list of plugins for a tweet
        //this process anable asynchronous things while processing a tweet
        process: function (tweet) {
            var that = this;
            var i = 0;
            function next () {
                var plugin = that.plugins[i++];
                if(plugin) {
                    plugin.func.displayName = plugin.name;
                    plugin.func.call(next, tweet, that, plugin)
                }
            }
            next();
        },

        reprocess: function(tweet){
            tweet.StreamDirty = true;
            this.process(tweet);
            tweet.streamDirty = false;
        },
        //count is icremented in the streamPlugin
        count:0

    };
    window.tweetstream = tweetstream;
})()
