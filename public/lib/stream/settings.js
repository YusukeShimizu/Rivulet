/* 
 *  Settings for app.
 *  Settings use namespaces which should be short strings describing component.
 *  Code needs to "register" namespaces and key.
 *  By providing labels, defaultValues and possible values,auto generate a UI.
 */

(function(){
    var settings = {};
    var settingsData;
    var defaultSettings = {};
    var subscriptions = {};

    //save to localstorage
    function persist(){
        if(window.localStorage){
            init();
            window.localStorage["streamie.settings"] = JSON.stringify(settingsData);
        }
    }

    //namespaces inside the settings
    function Namespace(name,label,settingsData){
        this.name = name;
        this.label = label;
        this.settingsData = settingsData;
    }
    Namespace.prototype = {
        keys: function(){
            return Object.keys(this.settingsData).sort();
        }
    };

    function notify(namespace,key,value){
        //value change
        $(document).trigger("settings:set",[namespace,key,value]);
        if(subscriptions[namespace] && subscriptions[namespace][key]) {
        subscriptions[namespace][key].forEach(function (cb) {
          cb(value, namespace, key);
        })
      }
    }

    //init settings from localStorage
    (function init(){
        if(settingsData){
            return;
        }
        if(window.localStorage){
            var val = window.localStorage["stream.settings"];
            if(val){
                settingsData = JSON.parse(val);
            }else{
                settingsData = {};
            }
        }else{
            console.log("need localStorage");
            settingsData = {};
        }
    })()

    //register a namespace for UI
    settings.registerNamespace = function(name,label){
        if(defaultSettings[name]) {
          throw new Error("Namespace already exists: "+name);
        }
        defaultSettings[name] = new Namespace(name, label, {});
    };

    //register a key in a namespace and give it a label
    settings.registerKey = function(namespace,key,label,defaultValue,values){
        // grobal object
        var self = this;
        if(!defaultSettings[namespace]){
            throw new Error("Unknown namespace" + namespace);
        }
        if(!key || !label || typeof defaultValue == "undefined") {
          throw new Error("Please provide all these parameters");
        }       
        defaultSettings[namespace].settingsData[key] = {
          label: label,
          defaultValue: defaultValue,
          values: values // possible values
        };
        
        // initial notification
        $(document).bind("streamie:init:complete", function () {
          notify(namespace, key, self.get(namespace, key));
        });
    }

    //the key changes
    settings.subscribe = function(namespace,key,cb){
        if(!subscriptions[namespace]){
            subscriptions[namespace] = {};
        }
        if(!subscriptions[namespace][key]){ 
            subscriptions[namespace][key] = [];
        }
        subscriptions[namespace][key].push(cb);
    }
    
    //settings key in a namespace
    settings.get = function(namespace,key){
        //return settings
        if(namespace in settingsData && key in settingsData[namespace]){
            return settings[namespace][key];
        }
        //return defaultValue
        if(namespace in defaultSettings && key in defaultSettings[namespace].settingsData){
            return defaultSettings[namespace].settingsData[key].defaultValue;
        }
        //not registered in the namespace
        console.log("[settings] key "+key+" not found in namespace "+namespace);
        return null;
    }

    //set a key in namespace
    settings.set = function(namespace,key,value){
        var ns = settingsData[namespace];
        if(!ns){
            ns = settings[namespace] = {};
        }
        ns[key] = value;
        notify(namespace,key,value);
        console.log("[settings] set "+namespace+"."+key+" = "+value);
        //retain settings in lacalstrage
        persist();
    }

    //return sorted list of namespace
    settings.namespaces = function(){
        var namespaces = Object.keys(defaultSettings).sort().map(function (name) {
            return defaultSettings[name];
        });
        return namespaces;
    }
    //Direct access to all settings and settingsData
    window.settings = settings;
})()
