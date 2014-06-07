/*
 * Main entry point for candy
 * "start" method gets called when the initial dependencies are loaded.
 * We always have jQuery and underscore.js everwhere
 */

(function(){
    var candy = {};
   
    candy.start = (function(){
        //write less with jquery
        $(function(){

            //connect to the backend system
            var connect = function(data){
                //data always be JSON
                data = JSON.parse(data);
                //if login, candy start the twitter
                if(data.action == "auth_OK"){
                    console.log(data)
                    $("#about").hide();
                    $("#header").show();
                }
            }
            var socket = client.connect(connect);
        })
    })()
    window.candy = candy;
})()
