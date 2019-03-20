/* Hashcode polyfill */
(function () {
    String.prototype.hashCode = function () {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
            chr = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
})();

/* CustomEvent polyfill */
(function () {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

/* EventTarget implementation */
(function () {
    var EventTarget = function () {
        this.listeners = {};
    };

    EventTarget.prototype.listeners = null;
    EventTarget.prototype.addEventListener = function (type, callback) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    };

    EventTarget.prototype.removeEventListener = function (type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    };

    EventTarget.prototype.dispatchEvent = function (event) {
        if (!(event.type in this.listeners)) {
            return true;
        }
        var stack = this.listeners[event.type].slice();

        for (var i = 0, l = stack.length; i < l; i++) {
            stack[i].call(this, event);
        }
        return !event.defaultPrevented;
    };

    /* Call this to apply EventTarget functionality to a Custom JS Object */
    window.eventify = function (obj) {
        var eventTarget = new EventTarget();

        function delegate(method) {
            obj[method] = eventTarget[method].bind(eventTarget);
        }

        [
            "addEventListener",
            "dispatchEvent",
            "removeEventListener"
        ].forEach(delegate, obj);
    };
})();