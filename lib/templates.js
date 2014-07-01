//load files to render the template(the underscore.js way)  

(function(){
    var templates = {};
    templates.settingDialog = (function(){
        var filename = __dirname + "/../views/templates/settingDialog.html";
        var text = require("fs").readFileSync(filename);
        if(!text) {
            throw new Error("Couldn't read config file "+filename);
        }
        return text;
    })();
    templates.tweet = (function(){
        var filename = __dirname + "/../views/templates/tweet.html";
        var text = require("fs").readFileSync(filename);
        if(!text) {
            throw new Error("Couldn't read config file "+filename);
        }
        return text;
    })();
    module.exports = templates;
})();


