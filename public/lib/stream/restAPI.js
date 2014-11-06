/* 
 *  Calling of all twitter APIs         
 */

(function(){
    var restAPI = {};

    function makeRequest(method,data){
        var request = {};
        //update dtatus
        if(method == 'tweet'){
            request.query = "/statuses/update.json?status="+ data;
        //favorite 
        }else if(method == 'favorite'){
            request.query = "/favorites/create.json?id="+escape(data);
        //destroy favorite
        }else if(method == 'unfavorite'){
            request.query = "/favorites/destroy.json?id="+escape(data);
        //destroy tweet
        }else if(method == 'delete'){
            request.query = "/statuses/destroy/"+escape(data)+".json";
        //retweet
        }else if(method == 'retweet'){
            request.query = "/statuses/retweet/"+escape(data)+".json";
        //other call
        }else if(method == 'update'){
            request.query = data;
        }else if(method == 'userTimeline'){
            request.query = '/statuses/home_timeline.json';
            request.count = data;
        }else if(method == 'oldTimeline'){
            request.query = '/statuses/home_timeline.json';
            request.max_id = data;
        }else if(method == 'userMention'){
            request.query = '/statuses/mentions_timeline.json';
        }else if(method == 'shortenURL'){
            request.query = data;
        }else if(method == 'reply'){
            request.query = '/statuses/show.json';
            request.id = data;
        }else{
            request.query = 'We cant handle this method';
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
            async: true,
            url: url,
            data: {
                'request': makeRequest(method,data)
            },
            timeout : 10000,
            success: callback,
            error: error
        });
    };

    restAPI.use = function (method, route, data, callback) {
        // data can be left out
        if(typeof data == "function") { 
            callback = data;
            data = null;
        }
        handler(method,route, data, callback);
    }
    window.restAPI = restAPI;
})()
