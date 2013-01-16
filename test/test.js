if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

Lazy.debug = true;
var parent = Object.create({
    init: function () {
        console.log('parent.init');
        this.setupStuff();
    },
    setupStuff: function () {
        console.log('parent.setupStuff');
    },
    render: function () {
        console.log('parent.render');
    }
});

var child = Lazy.lazy('init', Object.create(parent));
console.log('calling init');
child.init();
console.log('calling render');
child.render();
console.log('calling init');
child.init();