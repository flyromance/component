// Inspired by base2 and Prototype

var initializing = false;

// The base Class implementation (does nothing)
var Class = function () {};

// Create a new Class that inherits from this class
Class.extend = function (prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        prototype[name] = prop[name];
    }

    // The dummy class constructor
    function SubClass() {
        // All construction is actually done in the initialize method
        if (!initializing && this.initialize)
            this.initialize.apply(this, arguments);
    }

    SubClass.superclass = _super;

    // Populate our constructed prototype object
    SubClass.prototype = prototype;

    // Enforce the constructor to be what we expect
    SubClass.prototype.constructor = SubClass;

    // And make this class extendable
    SubClass.extend = arguments.callee;

    return SubClass;
};

module.exports = Class;
