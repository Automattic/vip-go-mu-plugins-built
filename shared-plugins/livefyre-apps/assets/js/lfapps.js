var Livefyre = Livefyre || {};
Livefyre.LFAPPS = Livefyre.LFAPPS || {};

Livefyre.LFAPPS.eventListeners = [];

Livefyre.LFAPPS.lfExtend = function(a, b) {
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
};

//add new listener for a specific app, eventName and callback
Livefyre.LFAPPS.addEventListener = function(app, eventName, callback) {
    Livefyre.LFAPPS.eventListeners.push({app:app, eventName:eventName, callback:callback});
};

//get jsevent listeners for a specific app
Livefyre.LFAPPS.getAppEventListeners = function(app) {
    var events = [];
    if(Livefyre.LFAPPS.eventListeners.length > 0) {
        for(var i = 0; i<Livefyre.LFAPPS.eventListeners.length; i++) {
            var eventObj = Livefyre.LFAPPS.eventListeners[i];
            if(eventObj.app === app) {
                events.push(eventObj);
            }
        }
    }
    return events;
};