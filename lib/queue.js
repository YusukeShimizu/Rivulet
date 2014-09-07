/*
  A Module that exposes a message queue. One can subscribe to channels and receive
  callbacks when someone publishes messages to these channels
*/

var Subscribers = {};

// Subscription objects are returned by the subscribe function.
function Subscription (channels, cb) {
    this.channels = channels;
    this.cb = cb;
}

// Call this method to unsubscribe a subscription
Subscription.prototype.unsubscribe = function () {
    var cb   = this.cb;
    this.channels.forEach(function (channel) {
        var subs = Subscribers[channel];
        if(subs) {
            var filtered = subs.filter(function (s) {
                return s !== cb;
            });
            if(filtered.length === 0) {
                delete Subscribers[channel]
            } else {
                Subscribers[channel] = filtered;
            }
        }
    })
}

// Subscribe to a channel or an array of channels
// listenerCB will be fired when an event is published to one of the channels.
exports.subscribe = function (channels, listenerCB) {
    if(typeof listenerCB != "function") {
        throw new Error("subscribe needs a callback parameter");
    }
    if(typeof channels == "string") {
        channels = [channels];
    }
    channels.forEach(function (channel) {
        var subs = Subscribers[channel];
        if(!subs) {
            subs = Subscribers[channel] = [];
        }
        subs.push(listenerCB);
    })
    return new Subscription(channels, listenerCB);
}

// Publish an event of data to a channel
// Returns the number of subscribers the event was published to
exports.publish = function (channel, data) {
    var subs = Subscribers[channel];
    if(subs) {
        for(var i = 0, len = subs.length; i < len; ++i) {
            subs[i](data, channel);
        }
        return subs.length;
    }
    return 0;
}

function ok(bool, msg) {
    if(bool) {
        console.log("OK "+msg);
    } else {
        console.log("OK "+msg);
    }
}

