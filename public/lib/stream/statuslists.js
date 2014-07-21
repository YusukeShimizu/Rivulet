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

    plugins = {
        // reply form inside tweet
        observe: {
            func: function observe (stream){
        
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
        }
    }

    statuslists = [
        plugins.observe,
        plugins.replyForm
    ];


    window.statuslists = statuslists;
})()
