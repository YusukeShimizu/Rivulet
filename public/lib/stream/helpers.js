/* 
 *  inputs will define here to avoid XSS.underscore.js do not auto complete
 */

(function(){
    var helpers = {};
    var EN_AMP_RE = /&/g;
    var EN_LT_RE  = /</g;
    var EN_GT_RE  = />/g;
    var EN_QUOT_RE = /"/g;
    var EN_SINGLE_RE = /'/g;    

    helpers.htmlEncode = function htmlEncode(text){
        text = "" + text;
        text = text.toString().replace(EN_AMP_RE,"&amp;");
        text = text.replace(EN_LT_RE, "&lt;");
        text = text.replace(EN_GT_RE, "&gt;");
        text = text.replace(EN_QUOT_RE, "&quot;");
        text = text.replace(EN_SINGLE_RE, "&#39;");
        return text;
    }

    var DE_GT_RE = /\&gt\;/g;
    var DE_LT_RE = /\&lt\;/g;
    var DE_QUOT_RE = /\&quot\;/g;
    var DE_SINGLE_RE = /\&#39\;/g;

    helpers.htmlDecode = function htmlDecode(text){
        text = ""+text;
        text = text.toString().replace(DE_GT_RE, ">");
        text = text.replace(DE_LT_RE, "<");
        text = text.replace(DE_QUOT_RE, '"');
        text = text.replace(DE_QUOT_RE, '"');
        text = text.replace(DE_SINGLE_RE, '\'');
        return  text;
    }
    // backward compatibility API
    helpers.html = helpers.htmlEncode;
    window.helpers = helpers;
})()
