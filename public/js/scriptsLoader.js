(function(){
    var scriptsLoader = {};
    scriptsLoader.header = function(){ 
        //LESS - Leaner CSS v1.7.0 http://lesscss.org
        document.write('<script src="ext/less-1.7.0.min.js"></script>');
        //jQuery 2.1.1(http://jquery.com/)
        document.write('<script src="/js/jquery-2.1.1.js"></script>');
    };
    scriptsLoader.body = function(){
        //Underscore.js 1.6.0(http://underscorejs.org)
        document.write('<script src="/ext/underscore.js"></script>'); 
        //Bootstrap v3.0.3 (http://getbootstrap.com)
        document.write('<script src="/bootstrap/js/bootstrap.js"></script>');
        //socket.ioÅ@version0.9.16(http://socket.io/)
        document.write('<script src="/socket.io/socket.io.js"></script>');
        //all modules
        document.write('<script src="/lib/stream/client.js"></script>');
        document.write('<script src="/lib/stream/initplugins.js"></script>');
        document.write('<script src="/template/templates.js"></script>');
        document.write('<script src="/lib/stream/settingsDialog.js"></script> ');
        document.write('<script src="/lib/stream/helpers.js"></script>');
        document.write('<script src="/lib/stream/candy.js"></script>');
    };
    window.scriptsLoader = scriptsLoader;
})();
