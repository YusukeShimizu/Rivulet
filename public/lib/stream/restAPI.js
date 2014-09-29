/* 
 *  Calling of all twitter APIs         
 */

(function(){
    var restAPI = {};

    function makeRequest(method,data){
        var request;
        //update dtatus
        if(method == 'tweet'){
            request = "/statuses/update.json?status="+ data;
        //favorite 
        }else if(method == 'favorite'){
            request = "/favorites/create.json?id="+escape(data);
        //destroy favorite
        }else if(method == 'unfavorite'){
            request = "/favorites/destroy.json?id="+escape(data);
        //destroy tweet
        }else if(method == 'delete'){
            request = "/statuses/destroy/"+escape(data)+".json";
        //retweet
        }else if(method == 'retweet'){
            request = "/statuses/retweet/"+escape(data)+".json";
        //other call
        }else if(method == 'update'){
            request = data;
        }else if(method == 'userTimeline'){
            request = '/statuses/home_timeline.json';
        }else if(method == 'userMention'){
            request = '/statuses/mentions_timeline.json';
        }else if(method == 'shortenURL'){
            request = data;
        }else{
            request = 'We cant handle this method';
        }
        return request;
    }

    function handler(method,url,data,callback){
        var error = function (xhr, status, errorThrown) {
            console.log("[Twitter RestAPI Error] Status '"+xhr.statusText+"' URL: "+url+" Request Data "+ data); 
            callback.apply(this, arguments); 
        };
        // make the actual request
        $.ajax({
            type: 'POST',
            async: false,
            url: url,
            data: {
                'request': makeRequest(method,data)
            },
            timeout : 10000,
            success: callback,
            error: error
        });
    };

    // make post requests
    restAPI.post = function (method, data, callback) {
        // data can be left out
        if(typeof data == "function") { 
            callback = data;
            data = null;
        }
        handler(method,'/post', data, callback);
    }
    // make update requests
    restAPI.update = function (method, data, callback) {
        // data can be left out
        if(typeof data == "function") { 
            callback = data;
            data = null;
        }
        handler(method,'/update', data, callback);
    }
    restAPI.timeline = function (method, data, callback) {
        // data can be left out
        if(typeof data == "function") { 
            callback = data;
            data = null;
        }
        handler(method,'/timeline', data, callback);
    }
    restAPI.shortenURL = function (method, data, callback) {
        // data can be left out
        if(typeof data == "function") { 
            callback = data;
            data = null;
        }
        handler(method,'/shortenURL', data, callback);
    }
    window.restAPI = restAPI;
})()
