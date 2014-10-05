(function(){
    var scriptsLoader = {};
    scriptsLoader.header = function(){ 
        //LESS - Leaner CSS v1.7.0 http://lesscss.org
        document.write('<script src="ext/less-1.7.0.min.js"></script>');
        //jQuery 2.1.1(http://jquery.com/)
        document.write('<script src="/js/jquery-2.1.1.js"></script>');
        //modernizr 1.5(http://modernizr.com/)
        document.write('<script src="ext/modernizr.js"></script>');
    };
    scriptsLoader.body = function(){
        //Underscore.js 1.6.0(http://underscorejs.org)
        document.write('<script src="/ext/underscore.js"></script>');
        document.write('<script src="/ext/cookie.js"></script>');
        //socket.io@version0.9.2(http://socket.io/)
        document.write('<script src="/socket.io/socket.io.js"></script>');
        //all modules
        document.write('<script src="/lib/stream/keyValueStore.js"></script>');
        document.write('<script src="/lib/stream/restAPI.js"></script>');
        document.write('<script src="/lib/stream/settings.js"></script>');
        document.write('<script src="/lib/stream/client.js"></script>');
        document.write('<script src="/lib/stream/initplugins.js"></script>');
        // document.write('<script src="/lib/stream/linkPlugins.js"></script>');
        document.write('<script src="/lib/stream/tracking.js"></script>');
        document.write('<script src="/lib/stream/statuslists.js"></script>');
        document.write('<script src="/lib/stream/streamPlugins.js"></script>');
        document.write('<script src="/lib/stream/settingsDialog.js"></script> ');
        document.write('<script src="/lib/stream/helpers.js"></script>');
        document.write('<script src="/lib/stream/tweetstream.js"></script>');
        document.write('<script src="/lib/stream/candy.js"></script>');
    };
    window.scriptsLoader = scriptsLoader;
})();
