
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
                return; 
                var prefixLength = "http://".length;
                var href = a.attr("href") || "";
                var id = a.attr('id');
                var domains = plugin.domains;
                for(var i = 0, len = domains.length; i < len; ++i) {
                    var domain = domains[i];
                    if(href.indexOf(domain) === prefixLength) {
                        gapi.client.load("urlshortner","v1", function(){
                            gapi.client.urlshortner.url.get({"shortUrl":encodeURIComponent(href)}).execute(function(data){
                                if(data.error) {
                                    console.log('google API error ', data)
                                } else {
                                    var a = $('#'+id);
                                    a.attr('data-tiny-href', href);
                                    a.attr('href', data.org_url);
                                }
                            })
                        })
                    }
                }
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
                var href = a.attr("href") || "";
                var domains = plugin.domains;
                for(var i = 0, len = domains.length; i < len; ++i) {
                    var domain = domains[i];
                    if(href.indexOf(domain) === prefixLength) {
                        var url = parseUri(href);
                        var trans = plugin.transformations[domain] || plugin.transformations.standard;
                        var previewURL = trans.call(plugin.transformations, url);
                        var image = new Image();
                        image.src = previewURL;
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
        plugins.googl,
        plugins.imagePreview
    ];
})()
