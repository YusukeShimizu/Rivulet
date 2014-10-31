
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
        imagePreview: {
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
        plugins.imagePreview
    ];
})()
