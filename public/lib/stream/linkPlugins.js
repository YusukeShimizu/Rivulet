
/* 
 * transform the link or images in tweet
 * short URL expanding, image preview
 */

(function(){
    var linkPlugins = {};
    var index = 0;

    plugins = {
        id: {
            func: function expandURL(a, tweet, stream, plugin) {
                a.attr('id', 'href' + index++);
            }
        },
        expandURL: { 
            func: function expandURL(a, tweet, stream, plugin) {
                // disable for JSConf
                return; 
                var prefixLength = "http://".length;
                var href = a.attr("href") || "";
                var id = a.attr('id');
                restAPI.use('expandURL','/expandURL',encodeURIComponent(href),function(data,status){
                    if(status == 'success'){
                        if(data) {
                            var a = $('#'+id);
                            a.attr('data-tiny-href', href);
                            a.attr('href', data.org_url);
                        } else {
                            console.log('Untiny error ', data)
                        }
                    }
                });
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
        //plugins.id,
        //plugins.expandURL,
        plugins.imagePreview
    ];
})()
