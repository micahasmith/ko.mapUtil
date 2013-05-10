/*! PIO.util.ko.maputil - v1.0.0 - 2013-05-09
* https://github.com/micahasmith/ko.mapUtil
* Copyright (c) 2013 Micah Smith; Licensed MIT */
var PIO = PIO || {};
PIO.util = PIO.util || {};
PIO.util.ko = PIO.util.ko || {};
PIO.util.ko.mapUtil = (function (ko, _) {
    var ctor = function () {
        var self = this,

            funcOptsProxy = function (func, opts) {
                return function (source) {
                    return func(_.defaults({ source: source }, opts));
                };
            },
            shouldIgnore = function (ig, key) {
                if (ig && _.contains(ig, key)) return true;
                return false;
            },
            getSubOptions = function (newOptions, objOptions, globalOptions) {
                return _.defaults(_.defaults(newOptions, objOptions), globalOptions);
            },

            getOptionsForChild = function(key,value,options){
                if(options && options[key])
                    return _.defaults({source:val})
            },
            
            isObsArray = function (item) {
                return ko.isObservable(item) && _.isArray(item());
            },
            isPrimitive = function(i){
                return _.isString(i) 
                    || _.isDate(i)
                    || _.isNumber(i)
                    || _.isRegExp(i)
                    || _.isBoolean(i)
                    && !( 
                        _.isObject(i) 
                        );
            },
            getMapManyBuild = function(o){
                var s = o.source;
                if(isPrimitive(s))
                    return s;
                return self.build(o);
            },


            mapMany = function (opts) {
                var n = opts.source,
                    d = opts.destination,
                    so = opts.options || {},
                    p = so.matchPredicate,
                    re = so.recurse || true,
                    ig = so.ignore ,
                    hasPred = Boolean(p),
                    addIn = [];


                //console.group("mapMany(): entered on,",opts);
                //make sure destination exists
                if (!d) d = [];

                //make sure destination is obsArray
                if (!isObsArray(d)){
                    //console.log("mapMany(): making an observableArray of ",d);
                    d = ko.observableArray(d);
                } 

                if(n && isObsArray(n)) {
                    n = ko.utils.unwrapObservable(n);
                }

                //console.log('mapMany(): source is ',n);

                //if no predicate, clear the dest, start over
                if (!hasPred){
                    //console.log("mapMany(): no items, clearing observableArray of ",d);
                    d.removeAll();
                }



                //if the destination already includes items
                if (d().length) {
                    //foreach item in the source
                    _.forEach(n, function (item) {
                        //console.log('mapMany(): working on new item',item);
                        //build out the item
                        var bItem = getMapManyBuild({source:item, options:so["items"] || {} });
                        //see if its already in the destination
                        var match = _(d()).find(function (i) { return p(i, bItem); });
                        //if so, map the data in
                        if (match)
                            self.map({source:bItem, destination:match, options:so["items"] || {} });
                            //if not, build it and add it to the "add later" list
                        else
                            addIn.push(bItem);
                    });
                    //add in the add later list
                    _(addIn).forEach(function (i) { d.push(i); });

                } else {
                    //build out an all new list, add it to the dest
                    _(n).forEach(function (i) { 
                        //console.log('mapMany(): working on new item',i);
                        var bItem = getMapManyBuild({source:i, options:so["items"] || {} });
                        d.push(bItem); 
                    });
                }

                //console.log('mapMany(): returning ',d);
                //console.groupEnd();
                return d;
            };

        //builds out a ko representation of the object
        this.build = function (options) {
            var o = options.destination || {},
                s = options.source,
                so = options.options || {},
                re = so.recurse || true,
                ig = so.ignore,
                b1 = so.preBuild,
                b2 = so.postBuild;

            //console.group('build(): entered on ',options);
            if(Boolean(s.__kom))
                return s;

            if(b1){
                //console.log('build(): calling prebuild');
                o = b1(o);
                if(!o)
                    throw new Error('prebuild function did not return a value');
            }

            _.forEach(s, function (val, key) {
                //console.log('build(): working on ',key,val);
                if (shouldIgnore(ig, key)) {
                    //console.log("build(): ignoring ",key);
                    return;
                }

                if (_.isFunction(val) && ko.isWriteableObservable(val)) {
                    //console.log('build(): a function',key);
                    o[key] = val;
                    //je ne sais
                } else if (_.isArray(val)) {
                    //TODO optimize to use prototype-based obj/member reuse when iterating over array
                    if (val.length === 0) {
                        o[key] = ko.observableArray([]);
                    } else {
                        if (re && (_.isObject(val[0]) || _.isPlainObject(val[0]))) {
                            //console.log('build(): recursing into array items under ',key);
                            o[key] = ko.observableArray(_.map(val, function (sval) {
                                return self.build(
                                    {source:sval, options: so[key] || {}}
                                );
                            }));

                        } else {
                            //console.log('build(): assigning ',key,' value ',val);
                            o[key] = ko.observableArray(val);
                        }

                    }
                } else if (_.isPlainObject(val) || _.isObject(val)) {
                    //console.log('build(): is object ',key);
                    if (re)
                        o[key] = self.build({source:val, options: so[key] || {}});
                    else
                        o[key] = ko.observable(val);

                } else {
                    //console.log('build(): is primitive ',key);
                    o[key] = ko.observable(val);
                }

            });
            o.__kom = true;
            o.__komId = Math.random();
            if(b2){
                //console.log('build(): calling postbuild');
                o = b2(o);
                if(!o)
                    throw new Error('postbuild function did not return a value')
            }
            //console.log('build():returning ',o);
            //console.groupEnd();
            return o;
        };



        //only maps observables! not other obj props
        this.map = function (options) {
            var source = options.source,
                oItem = options.destination,
                so = options.options || {},
                build = function() {
                    return self.build({source:source,options:so});
                },
                recurse = so.recurse || false,
                ignore = so.ignore || [];

            //console.group("map(): entered on ",options);

            if(ignore) ignore.push('__kom');

            if (_.isArray(source) ||
                isObsArray(source))
            {
                //console.log('is an array/observableArray');
                return mapMany(options);
            }

            // return if there's no mapping to be done
            // (this was just a build req, no destination)
            if (!oItem) {
                //console.log('map(): just a build request');
                return build();
            }

            //build the new item first using the appropriate
            //steps
            if (!_.has(source, "__kom")){
                //console.log('map(): doing a prebuild on ',source);
                source = build();
            }

            

            _.forEach(source, function (val, key) {
                //console.group('map(): working on ',key);
                //console.log('map(): value is ',key,val);
                if (!_.has(oItem, key)) return;
                if (shouldIgnore(ignore, key)) return;

                var getter, setter,
                    funcGetter = function (f) { return f(); },
                    propGetter = function (f) { return f; },
                    funcSetter = function (nv, v) { nv(v); };

                if(isObsArray(val)){
                    //console.log("map(): item is observableArray, calling mapMany on ",key);
                    mapMany({source:val,destination:oItem[key],options:so[key] || {} });

                } else if (_.isFunction(val)) {
                    if (ko.isWriteableObservable(val)) {
                        //console.log('map(): item is observable', key);
                        getter = funcGetter;
                        setter = funcSetter;
                    }
                } else if (_.isObject(val)) {
                    //recurse
                    if(recurse){
                        //console.log("map(): is object, recursing on ",key);
                        self.map(
                            _.defaults( {source:val,destination:oItem[val]},
                                {options:so[key] || {}})
                            );
                    }
                }


                if (Boolean(getter) && Boolean(setter)) {
                    //console.log('setting one to another');
                    setter(oItem[key], getter(source[key]));
                }
                //console.groupEnd();
            });

            //console.log('map(): returning ',oItem);
            //console.groupEnd();
            return oItem;
        };




    };
    return new ctor();

}(ko, _));