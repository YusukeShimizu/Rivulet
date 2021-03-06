// setting for setting dialog

(function(){
    var settingsDialog = {}; 
    //use underscore.js
    var visible = false;

    function hide(){
        visible = false;
        $("#settings").removeClass("show");
    }

    // make this globally accesible
    settingsDialog.hide = function(){
        hide();
    }

    function show(){
        visible = true;
        $("#settings").addClass("show");
        if($("#mainstatus").hasClass("show")){
            $("#mainstatus").removeClass("show");
        }
    }

    function draw(){
        var template = _.template(templates.settingDialog);
        var html = template({
            settings: settings,
            helpers: helpers
        });
        //set inner html
        $("#settings").html(html);
    }
    //when the settings change
    $(document).bind("settings:set", function(){
        if(visible){
            draw();
        }
    });

    settingsDialog.init = function bind(){
        // a is child  
        $("#header").on("click",".settings > a", function(e){
            //avoid original event
            e.preventDefault();   
            if(visible){
                hide();
            }else{
                draw();
                show();
            }
        });

        // listen for changes on the settings
        $("#header").on("change","#settingsForm input.setting,#settingsForm select.setting",function(){
            var input = $(this);
            var name = this.name;
            var checked = input.is(":checkbox") ? this.checked: input.val();
            var parts = name.split(/\./);
            var namespace = parts[1];
            var key = parts[2];
            settings.set(namespace,key,checked);
        });

        $("#header").on("click","#settingsForm .close",hide);
    };

    window.settingsDialog = settingsDialog;
})()
