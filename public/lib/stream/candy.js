/*
 * Main entry point for candy
 * "start" method gets called when the initial dependencies are loaded.
 * Candy always have jQuery and underscore.js everwhere
 */

//The immediate function pattern to make modules 
(function(){
    var candy = {};

    candy.start = (function(){
        //using jquery
        $(function(){
            // initPlugins are loaded when the page is loaded
            initplugins.init();

            var connect = function(data){
                //data always be JSON
                data = JSON.parse(data);
                //if login, candy start the twitter
                if(data.action == "auth_OK"){
                    console.log(data)
                    $("#about").hide();
                    $("#header").show();
                }
                else{
                }
            }
            //connect to the backend system
            var socket = client.connect(connect);
        })
    })()

    // set namespace to global object 
    window.candy = candy;
})()
