// setting for setting dialog

(function(){
    var settingsDialog = {}; 
    //use underscore.js
    var test =templates.settingsDialog; 
    var template = _.template(templates.test);
    var visible = false;
    
    function hide(){
        visible = false;
        $("#settings").removeClass("show");
    }

    function show(){
        visible = true;
        $("#settings").addClass("show");
        var test =  $("#settings").addClass("show");
    }

    function draw(){
        var html = template({
            //settings: settings,
            helpers: helpers
            //text:text.get
        });
        //set inner html
        $("#settings").html(html);
    }
    //when the settings change
    $(document).on("setting:set", function(){
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
        $("#header").on("change","#settingForm input.setting,#settingsForm select.setting",function(){
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
