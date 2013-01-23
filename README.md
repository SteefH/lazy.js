lazy.js
=======

lazy.js is a library that lets you easily create lazily initialized objects in
JavaScript.

Lazy initialization means that an object will be initialized at the moment of
its first use.  This can be beneficial in certain situations. An example can
be found at the end of this document.


Usage
-----

The lazy.js module exports a single function, `lazy()` (or `Lazy.lazy()` in
the global namespace when used without a module loader like RequireJS).

The function takes two arguments: the first is the name of the method that
will initialize the object, the second is the object you want to lazify. The
return value is the object itself.

```javascript

var o = {
    init: function () {
        // code that initializes the object's state,
        // with some really heavy lifting
    },
    foo: function () {
        // some other code
    },
    bar: function () {
        // some other code
    }
};

o = Lazy.lazy('init', o);

```

The `Lazy.lazy()` call replaces all methods of `obj` with wrapper functions,
with the exception of the one named in the first argument (`init` in the above
example). The method named in the first argument will be replaced with an
empty function.

After lazification of the object, calling one of its methods, eg. `foo()` or
`bar()` in the above example, will cause the execution of the object's
original initialization method before the actual wrapped method is called.
After initialization, the object's original methods are restored. In other
words: after the first time any method other than the initialization method of
a lazified object is called, the object method properties will have the same
values they had before the object was lazified.

```javascript

o.foo(); // calls original o.init(), restores methods, calls original o.foo()
o.bar(); // calls original o.bar()

```


Prototypal inheritance
----------------------

Using `lazy()` on a prototype object (of a constructor function or passed to
`Object.create()` in ECMAScript 5) will make each object that inherits from
this prototype lazily initialized as well.

```javascript

function Thing() { /* empty constructor */ };

Thing.prototype = Lazy.lazy('init', {
    init: function () {
        // code that initializes the object's state,
        // with some really heavy lifting
    },
    foo: function () {
        // some other code
    },
    bar: function () {
        // some other code
    }
});

var a = new Thing();
var b = new Thing();

a.foo(); // calls a.init(), restores methods on a, calls original a.foo()
a.bar(); // calls original a.bar()

b.bar(); // calls b.init(), restores methods on b, calls original b.bar()
b.foo(); // calls original b.bar()

```


Why this was made
-----------------

One of our clients had some performance issues in a JavaScript-heavy web
application we built for them a short while ago.  Simplified, this app is an
editor for lists of lists.  For each leaf item, each sublist, and the top
level list on the page, a separate JavaScript controller object is created,
resulting in a tree structure of controllers, like so:

    ListController
      |
      +- SubListController
      |    |
      |    +- ItemController
      |    |
      |    +- ItemController
      |    |
      |   ...
      |
      +- SubListController
      |    |
      |    +- ItemController
      |    |
      |   ...
      |
     ...


Actually, the controller tree of the app in question has more than three
levels, but I think you get the idea.  Now, on page load, the whole controller
tree gets initialized, from the root `ListController`, down each
`SubListController` branch to each `ItemController` leaf.  Profiling the app's
JavaScript showed that the `ItemController` objects were pretty CPU-heavy in
their initialization. Specifically, the initialization contains code to
provide for editing of the leaf items, and that turned out to be the main
performance bottleneck when a page with a big list of lists was loaded.

Making a big structural change in the app wasn't feasible within a limited
time frame, and apart from this bottleneck, the app performed nicely. Since
the item edit features aren't needed (or even shown) directly after page load,
but instead become active after user input, I guessed that lazy initialization
of these edit features might give a performance boost (and it did so,
substantially).  That's how this library came to be.
