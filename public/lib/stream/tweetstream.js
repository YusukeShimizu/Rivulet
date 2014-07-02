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
        process: function(tweet){
            jQuery.each(streamPlugins,function(key,plugin){
                plugin.call(function(){},tweet,plugin);
            });
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
