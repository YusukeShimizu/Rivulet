
/* 
 * transform the link or images in tweet
 * short URL expanding, image preview
 */

(function(){
    var linkPlugins = {};
    var index = 0;

    var plugins = {
        id: {
            func: function expandURL(a, tweet, stream, plugin) {
                a.attr('id', 'href' + index++);
            }
        },
        setKey: {
            func: function setKey(){
                // We assume that these can be public so they are in the repo.
                gapi.client.setApiKey("AIzaSyBuYtjU-oCGPo355j8xMoz6fxNkvE8gfg0");
            }
        },
        googl: { 
            func: function expandURL(a, tweet, stream, plugin) {
                // disable for JSConf
                //return; 
                var prefixLength = "http://".length;
                var href = a.attr("href") || "";
                var id = a.attr('id');
                gapi.client.load("urlshortener","v1", function(){
                    gapi.client.urlshortener.url.get({"shortUrl":href}).execute(function(data){
                        if(data.error) {
                            console.log('google API error ', data)
                        } else {
                            var a = $('#'+id);
                            a.attr('data-tiny-href', href);
                            a.attr('href', data.longUrl);
                        }
                    })
                })
            }
        },
        imagePreview: {
            transformations: {
                standard: function (url) {
                    return "http://"+url.host+"/show/thumb"+url.path;
                },
                yfrog: function (url) {
                    return "http://"+url.host+url.path+".th.jpg";
                },
                "i.imgur.com": function (url) {
                    var path = (url.path || "").replace(/(?:.jpg)?$/, "s.jpg");
                    return "http://"+url.host+path;
                },
                "imgur.com": function (url) {
                    return this["i.imgur.com"](url);
                }
            },
            domains: ["img.ly", "twitpic.com", "yfrog", "imgur.com", "i.imgur.com"],
            func: function imagePreview (a, tweet, stream, plugin) { // a is a jQuery object of the a-tag
                var prefixLength = "http://".length;
                for (key in tweet.data.entities){
                    if(key == "media"){
                        var media = tweet.data.entities.media[0];
                        var href = media.media_url;
                        var image = new Image();
                        image.src = href;
                        var div = $('<span class="image-preview"/>');
                        div.append(image)
                        a.addClass("image").append(div);
                    }
                }
            }
        }
    }
    window.linkPlugins = [
        plugins.id,
        plugins.setKey,
        //plugins.googl,
        plugins.imagePreview
    ];
})()
