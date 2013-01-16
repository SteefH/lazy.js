(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.Lazy = factory();
  }
}(this, function () {
    var log;
    function isFunction (x) {
        return typeof x === 'function';
    }
    if (console && isFunction(console.log)) {
        log = console.log.bind(console);
    } else {
        log = function (){ }; // noop
    }
    
    var Lazy = {
        debug: false,
        lazy: function (initializeName, obj) {
            var propertyName, property, wrappedMethods, initFunc;
            
            initFunc = obj[initializeName];
            wrappedMethods = {};
            
            function unwrapMethods (obj) {
                if (Lazy.debug) {
                     log(['unwrapping methods', wrappedMethods, obj]);
                }
                var methodName;
                obj[initializeName] = initFunc;
                for (methodName in wrappedMethods) {
                    if (wrappedMethods.hasOwnProperty(methodName)) {
                        obj[methodName] = wrappedMethods[methodName];
                    }
                }
            }
            
            function wrapMethod(wrappedMethodName, method) {
                if (Lazy.debug) {
                    log(['wrapping method ' + wrappedMethodName, obj]);
                }
                wrappedMethods[wrappedMethodName] = method;
                return function () {
                    if (Lazy.debug) {
                        log(['calling wrapped method ' + wrappedMethodName, obj]);
                    }
                    unwrapMethods(this);
                    initFunc.apply(this);
                    return method.apply(this, arguments);
                };
            }
            
            function wrapInitFunc() {
                return function () {
                    if (Lazy.debug) {
                        log(['noop init', obj]);
                    }
                };
            }
            
            
            for (propertyName in obj) {
                if (
                    propertyName === initializeName
                ) {
                    obj[propertyName] = wrapInitFunc();
                } else {
                    property = obj[propertyName];
                    if (isFunction(property)) {
                        obj[propertyName] = wrapMethod(propertyName, property);
                    }
                }
            }
            return obj;
        }
    };
    return Lazy;
}));


