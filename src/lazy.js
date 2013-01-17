(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.Lazy = factory();
    }
}(this, function () {
    return {
        lazy: function (initializeName, obj) {
            var propertyName, property, wrappedMethods, initFunc;

            initFunc = obj[initializeName];
            wrappedMethods = {};

            function unwrapMethods(obj) {
                var methodName;
                obj[initializeName] = initFunc;
                for (methodName in wrappedMethods) {
                    if (wrappedMethods.hasOwnProperty(methodName)) {
                        obj[methodName] = wrappedMethods[methodName];
                    }
                }
            }

            function wrapMethod(wrappedMethodName, method) {
                wrappedMethods[wrappedMethodName] = method;
                return function () {
                    unwrapMethods(this);
                    initFunc.apply(this);
                    return method.apply(this, arguments);
                };
            }

            function wrapInitFunc() {
                return function () { /* noop */ };
            }

            for (propertyName in obj) {
                if (propertyName === initializeName) {
                    obj[propertyName] = wrapInitFunc();
                } else {
                    property = obj[propertyName];
                    if (typeof property === 'function') {
                        obj[propertyName] = wrapMethod(propertyName, property);
                    }
                }
            }
            return obj;
        }
    };
}));
