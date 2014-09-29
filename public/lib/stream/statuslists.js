/* 
 *  list of status
 */

(function(){
    var statuslists = {};
    var TWEET_MAX_LENGTH = 140;
    var replyFormTemplate;
    // get or make a form
    function getReplyForm(li){
        var form = li.find("form.status");
        //no form,create it
        if(form.length == 0){
            replyFormTemplate = _.template(templates.status); 
            li.find("div.status").append(replyFormTemplate({
                tweet: li.data("tweet"),
                helpers: helpers
            }));
            form = li.find("form.status");
            var textarea = form.find("[name=status]");
            textarea.data("init-val", textarea.val());
            textarea.focus();
            form.bind("status:send", function () {
                form.trigger("close");
            });
            form.bind("close", function () {
                form.hide();
                li.removeClass("form");
            });
        }
        li.addClass("form");
        return form;
    }

    // Sets status textarea text and sets caret or selection.
    function setCaret(form, text, start, end) { 
        var textarea = form.find("[name=status]");
        if(!text) {
            text = textarea[0].value
        }
        textarea.val(text);
        textarea.focus();
        if(start == null) {
            start = text.length;
        }
        if(end == null) {
            end = start
        }
        textarea[0].setSelectionRange(start, end);
    }

    plugins = {
        // reply form inside tweet
        observe: {
            func: function observe (stream){

                function shortenDirectMessagePrefix(val) {
                    return val.replace(/^d\s+\@?\w+\s/, ""); // remove direct message prefix
                }

                // when the user hit escape
                $(document).bind("key:escape",function(e){
                    var target = $(e.target);
                    if(target.is(":input") && target.closest("form.status").length > 0){
                        target.trigger("close");
                    }
                });
                $(document).delegate("form.status .close", "click", function (e) {
                    e.preventDefault();
                    $(this).trigger("close");
                });
                // submit event
                $(document).on("submit","form.status",function(e){
                    var form = $(this);
                    var status = form.find("[name=status]");
                    var val = status.val();
                     // too long for Twitter
                    if(val.length > TWEET_MAX_LENGTH) return false;

                    // make the actual request
                    restAPI.update('update',val,function(data,status){
                        if(status == 'success'){
                            var textarea = form.find("textarea");
                            var val = textarea.data("init-val") || "";
                            textarea.val(val);
                            form.trigger("status:send");
                        } else {
                            alert("Posting the tweet failed. Sorry :(");
                        }
                    });
                    return false;
                });

                var last;
                function updateCharCount (e) {
                    var val = e.target.value;
                    val = shortenDirectMessagePrefix(val);
                    var length = val.length;
            
                    if(length != last) {
                        var text = TWEET_MAX_LENGTH - length;
                        if(text < 0) {
                            text = '<span class="toolong">'+text+'</span>'
                        }
                        else if(text < 20) {
                            text = '<span class="warn">'+text+'</span>'
                        }
                        $(e.target).closest("form").find(".characters").html( text );
                        last = length;
                    }
                }
          
                $(document).delegate("form.status [name=status]", "keyup change paste", updateCharCount)
          
                // update count every N millis to catch any changes, though paste, auto complete, etc.
                $(document).delegate("form.status [name=status]", "focus", function (e) {
                    updateCharCount(e)
                    var textarea = $(e.target);
                    var interval = textarea.data("charUpdateInterval");
                    if(interval) {
                        clearInterval(interval);
                    }
                    textarea.data("charUpdateInterval", setInterval(function () { updateCharCount(e) }, 200));
                    textarea.trigger("status:focus", [textarea]);
                })
                $(document).delegate("form.status [name=status]", "blur", function (e) {
                    var interval = $(e.target).data("charUpdateInterval");
                    if(interval) {
                        clearInterval(interval);
                    }
                })
            }
        },
        // Shorten URLs in statuses
        shortenURLs: {
            func: function shortenURLs (stream) {
                var RE = streamPlugins[7].GRUBERS_URL_RE;
          
                // listen to click on the shortenURLs buttons
                $(document).delegate("form.status .shortenURLs", "click", function (e) {
                    e.preventDefault();
                    var form = $(this).closest("form.status");
                    var input = form.find("[name=status]");
                    var matches = input.val().match(RE);
                    if(matches) {
                        matches.forEach(function(longURL) {
                            if(longURL.length > "http://j.mp/aYYiOl".length) {
                                // make the actual request
                                restAPI.shortenURL('shortenURL',longURL,function(shortURL,status){
                                    if(status == "success"){
                                        var text = input.val();
                                        // replace actual status text
                                        text = text.replace(longURL, shortURL);
                                        input.val(text);
                                        input.focus();
                                    }else{
                                         console.log("failed. Sorry :(" + longURL);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        },
        replyForm: {
            func: function replyForm (stream) {
                $(document).on("click","#stream .actions .reply",function (e) {
                    var li = $(this).parents("li");
                    var tweet = li.data("tweet");
                    var form = getReplyForm(li);
                    form.show();
            
                    var author = tweet.data.user.screen_name;
                    var ats = ["@"+author];
                    tweet.mentions.forEach(function (at) {
                        if(at != author && at != stream.user.screen_name) {
                            ats.push("@"+at);
                        }
                    })
                });
            }
        },
        // The old style retweet, with the ability to comment on the original text
        quote: {
            func: function quote (stream) {
                $(document).delegate("#stream .quote", "click", function (e) {
                    var li = $(this).parents("li");
                    var tweet = li.data("tweet");
                    var form = getReplyForm(li);
                    form.find("[name=in_reply_to_status_id]").val(""); // no reply
                    var text = tweet.data.text + " /via @"+tweet.data.user.screen_name
            
                    form.show();
                    setCaret(form, text);
                })
            }
        },
        // Click on retweet button.Candy only interested in normal retweet
        retweet: {
            func: function retweet (stream) {
                $(document).delegate("#stream .actions .retweet", "click", function (e) {
                    if(confirm("Do you really want to retweet?")) {
                        var button = $(this);
                        var li = button.parents("li");
                        var tweet = li.data("tweet");
                        var id = tweet.data.id;
              
                        restAPI.post('retweet',id,function(data,status){
                            if(status == 'success'){
                                button.hide();
                                $(document).trigger("status:retweet")
                            }
                        });
                    }           
                })
            }
        },
        // Click on delete button
        deleteStatus: {
            func: function deleteStatus (stream) {
                $(document).delegate("#stream .actions .delete", "click", function (e) {
                    var button = $(this);
                    var li = button.parents("li");
                    var tweet = li.data("tweet");
                    var id = tweet.data.id;
            
                    if(!tweet.deleted) {
                        if(confirm('Do you really want to delete this tweet?')) {
                            restAPI.post('delete',id,function(data,status){
                                if(status == "success"){
                                    $(document).trigger("status:delete");
                                    button.remove();
                                }
                            });
                        }
                    }
                })
            }
        },
        // Click on favorite button
        favorite: {
            func: function favorite (stream) {
            $(document).delegate("#stream .actions .favorite", "click", function (e) {
                var li = $(this).parents("li");
                var tweet = li.data("tweet");
                var id = tweet.data.id;
            
                if(!tweet.data.favorited) {
                    restAPI.post('favorite',id,function(data,status){
                        if(status == "success"){
                            $(document).trigger("status:favorite")
                            tweet.data.favorited = true;
                            li.addClass("starred");
                        }
                     });
                 } else {
                    restAPI.post('unfavorite',id,function(data,status){
                        if(status == "success"){
                            $(document).trigger("status:favorite")
                            tweet.data.favorited = true;
                            li.removeClass("starred");
                        }
                    });
                }
            })
        }
    }
    }

    statuslists = [
        plugins.observe,
        plugins.shortenURLs,
        plugins.replyForm,
        plugins.quote,
        plugins.retweet,
        plugins.deleteStatus,
        plugins.favorite
    ];


    window.statuslists = statuslists;
})()
