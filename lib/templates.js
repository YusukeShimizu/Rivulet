//load files to render the template(the underscore.js way)  

(function(){ 
    var templates = {}; 
    var fs = require("fs");
    var pathToFile = __dirname + "/../views/templates/";

    fs.readdir(pathToFile,function(err,files){
        debugger;
        if(err){
            throw new Error("Couldn't access pass "+ pathToFile);
        }
        files.forEach(function(file){
            var template = fs.readFileSync(pathToFile + file);
            if(!template) {
                throw new Error("Couldn't read file "+file);
            }
            template = template.toString();
            templates[file.slice(0,-5)] = template;
        });
    });

    module.exports = templates;
})();
