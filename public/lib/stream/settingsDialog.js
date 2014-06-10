// setting for setting dialog

(function(){
    var settingsDialog = {}; 
    //use underscore.js
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
            helpers: "helpers"
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
    }

    window.settingsDialog = settingsDialog;
})()
