// Candy use require.js for loading dependencies http://requirejs.org/  
    
(function(){
    var templates = {};
    templates.settingsDialog =  
        "<% var h = helpers.html; %>"
            + "<form id='settingsForm' action='#'>"
                + "<h2 class='h3'><%= h('Settings') %></h2>"
                + "<div class='namespaces'>"
                    + "<% settings.namespaces().forEach(function (ns) { %>"
                    + "<fieldset>"
                        + "<legend class='h4'><%=h(ns.name)%></legend>"
                        + "<% ns.keys().sort(function(a,b) { return ns.settingsData[b].label < ns.settingsData[a].label  }).forEach(function (key) { %>"
                        + "<% var value = settings.get(ns.name, key), name  = 'settingsData.'+ns.name+'.'+key; %>"
                        + "<% var values = ns.settingsData[key].values; %>"
                        + "<div class='formrow'>"
                        + "<label>"
                            + "<% if( typeof value == 'boolean' ){ %>"
                            + "<input name='<%=h(name)%>' id='<%=h(name)%>' class='setting' type='checkbox' <%= value ? 'checked' : ''  %> />"
                            + "<% }else if( jQuery.isPlainObject(values) ){ %>"
                            + "<select name='<%=h(name)%>' id='<%=h(name)%>' class='setting'>"
                                + "<% _.keys(values).forEach(function(x){ %>"
                                    + "<option value='<%=h(x)%>'  <%= (x == value) ? 'selected' : ''  %> ><%=h(values[x])%></option>"						
                                + "<% }); %>"
                            + "</select>"
                            + "<% }else{ %>"
                                + "<% console.assert(false); %>"
                            + "<% } %>"
                            + "<%= h(ns.settingsData[key].label) %>"
                        + "</label>"			
                        + "</div>"
                        + "<% });%>"
                    + "</fieldset>"
                    + "<% }); %>"
                + "</div>"
                + "<input type='button' value='Close' class='button close'>"
           + "</form>";

    templates.test =  "<% var h = helpers.html; %>" + "<h2 class='h3'><%= h('Settings') %></h2>";
    window.templates = templates;
})()