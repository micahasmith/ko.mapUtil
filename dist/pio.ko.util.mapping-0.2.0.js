/*! PIO.ko.util.mapping - v0.2.0 - 2013-05-06
* https://github.com/micahasmith/ko.mapUtil
* Copyright (c) 2013 Micah Smith; Licensed MIT */
var PIO = PIO || {};
PIO.util = PIO.util || {};
PIO.util.ko = PIO.util.ko || {};
PIO.util.ko.mapUtil = (function (ko, _) {
    var ctor = function () {
        var self = this,

            mapProxy = function (opts){
                return function (source, destination) {
                    return self.map(_.defaults({ source: source, destination: destination },opts));
                };
            },
            funcOptsProxy = function(func,opts){
                return function (source){
                    return func(_.defaults({source:source},opts));
                };
            },

            mapMany = function (opts) {
            var n = opts.source,
                d = opts.destination,
                p = opts.predicate,
                re = opts.recurse || true,
                b = opts.builder || function (i) { return i; },
                m = opts.mapper || mapProxy(opts),
                hasPred = Boolean(p),
                //default predicate?
                //not sure this would work
                dp = function () { return false; },
                addIn = [];

            //make sure destination exists
            if (!d) d = [];

            //make sure destination is obsArray
            if (!(ko.isObservable(d) && _.isArray(d())))
                d = ko.observableArray(d);

            //if no predicate, clear the dest, start over
            if (!hasPred)
                d.removeAll();

            

            //if the destination already includes items
            if (d().length) {
                //foreach item in the source
                _.forEach(n, function (item) {
                    //build out the item
                    var bItem = b(item);
                    //see if its already in the destination
                    var match = _(d()).find(function (i) { return p(i, bItem); });
                    //if so, map the data in
                    if (match)
                        m(bItem, match);
                        //if not, build it and add it to the "add later" list
                    else
                        addIn.push(bItem);
                });
                //add in the add later list
                _(addIn).forEach(function (i) { d.push(i); });

            } else {
                //build out an all new list, add it to the dest
                _(n).forEach(function (i) { d.push(b(i)); });
            }

            return d;
        };

        //builds out a ko representation of the object
        this.build = function (options) {
            var o = options.destination || {},
                s = options.source,
                re = options.recurse || true;

            _.forEach(s, function (val, key) {
                if (_.isFunction(val)) {
                    //je ne sais
                } else if (_.isArray(val)) {
                    //TODO optimize to use prototype-based obj/member reuse when iterating over array
                    if (val.length === 0) {
                        o[key] = ko.observableArray([]);
                    } else {
                        if (re && (_.isObject(val[0]) || _.isPlainObject(val[0]))) {
                            o[key] = ko.observableArray(_.map(val, function (sval) {
                                return self.build(_.defaults({ source: sval }, options));
                            }));
                        } else {
                            o[key] = ko.observableArray(val);
                        }

                    }
                } else if (_.isPlainObject(val) || _.isObject(val)) {
                    if (re)
                        o[key] = self.build(_.defaults({ source: val }, options));
                    else
                        o[key] = ko.observable(val);

                }  else {
                    o[key] = ko.observable(val);
                }
                
            });
            o.__kom=true;
            return o;
        };



        //only maps observables! not other obj props
        this.map = function (options) {
            var nItem = options.source,
                oItem = options.destination,
                recurse = Boolean(options.recurse || true),
                sb = options.build,
                b = options.builder;

            //ensure __kom
            if(sb===false)
                b = function(i){return i;};
            else
            {
                if(options.builder)
                    b = function(o){ var t = options.builder(o); t.__kom=true; return t;};
                else
                    b = funcOptsProxy(self.build, _.defaults({oItem:{}},options) );
            }


            if (_.isArray(nItem) ||
                (ko.isObservable(nItem) && _.isArray(nItem())))
                return mapMany(options);

            if(!_.has(nItem,"__kom"))
                nItem = b(nItem);

            if(!oItem) return b(oItem);

            _.forEach(nItem, function (val, key) {
                if (!_.has(oItem, key)) return;

                var getter, setter,
                    funcGetter = function (f) { return f(); },
                    propGetter = function (f) { return f; },
                    funcSetter = function (nv, v) { nv(v); };

                if (_.isFunction(val)) {
                    if (ko.isWriteableObservable(val)) {
                        getter = funcGetter;
                        setter = funcSetter;
                    }
                } else if (_.isObject(val)) {
                    //recurse
                    if(recurse)
                        self.map(_.defaults({ source: nItem[key], destination: oItem[key] }, options));
                }


                if (Boolean(getter) && Boolean(setter)) {
                    setter(oItem[key], getter(nItem[key])); 
                }
            });
        };




    };
    return new ctor();

}(ko, _));