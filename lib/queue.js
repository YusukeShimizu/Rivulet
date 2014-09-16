/*
  subscribe to channels and receive
  callbacks when someone publishes messages
*/

var Subscribers = {};

function Subscription (channels, cb) {
    this.channels = channels;
    this.cb = cb;
}

// unsubscribe a subscription
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
