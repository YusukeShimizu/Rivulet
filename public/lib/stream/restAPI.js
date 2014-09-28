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
        }else{
            request = 'We cant handle this method';
        }
        return request;
    }

    function handler(method,url,data,callback){
        // make the actual request
        $.ajax({
            type: 'POST',
            url: url,
            data: {
                'request': makeRequest(method,data)
            },
            success: callback 
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
    window.restAPI = restAPI;
})()
