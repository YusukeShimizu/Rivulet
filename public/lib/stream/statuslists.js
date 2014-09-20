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
                    // post to twitter
                    $.ajax({
                        type: 'POST',
                        url: '/tweet',
                        data: {
                            'tweet': val
                        },
                        success: function(data){
                            var textarea = form.find("textarea");
                            var val = textarea.data("init-val") || "";
                            textarea.val(val);
                            // { custom-event: status:send }
                            form.trigger("status:send");
                        }
                    });

                    return false;
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
                        if(at != author && at != streamie.user.screen_name) {
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
                    // make text. TODO: Style should be configurable
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
              
                        // Post to twitter
                        $.ajax({
                            type: 'POST',
                            url: '/retweet',
                            data: {
                                'tweet_id': id
                            },
                            success: function(data){
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
                             $.ajax({
                                type: 'POST',
                                url: '/delete',
                                data: {
                                    'tweet_id': id
                                },
                                success: function(data){
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
                    $.ajax({
                        type: 'POST',
                        url: '/favorite',
                        data: {
                            'tweet_id': id
                        },
                        success: function(data){
                            $(document).trigger("status:favorite")
                            tweet.data.favorited = true;
                            li.addClass("starred");
                        }
                    });
                } else {
                     $.ajax({
                        type: 'POST',
                        url: '/unfavorite',
                        data: {
                            'tweet_id': id
                        },
                        success: function(data){
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
        plugins.replyForm,
        plugins.quote,
        plugins.retweet,
        plugins.deleteStatus,
        plugins.favorite
    ];


    window.statuslists = statuslists;
})()
