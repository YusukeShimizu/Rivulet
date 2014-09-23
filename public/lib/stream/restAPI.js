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
        }else{
            request = "candy can't handle this method :" + method;
        }
        return request;
    }

    function handler(method,data,callback){
        // make the actual request
        $.ajax({
            type: 'POST',
            url: '/post',
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
        handler(method, data, callback);
    }
    window.restAPI = restAPI;
})()
