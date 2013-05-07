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
            shouldIgnore = function(ig,key){
                if(ig && _.contains(ig,key)) return true;
                return false;
            },
            getSubOptions = function(masterOptions,thisOptions,key){
                var so = options.options;
                if(so){

                }
            },

            mapMany = function (opts) { 
            var n = opts.source,
                d = opts.destination,
                p = opts.predicate,
                re = opts.recurse || true,
                b = opts.builder || function (i) { return i; },
                m = opts.mapper || mapProxy(opts),
                ig = opts.ignore,
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
                re = options.recurse || true,
                ig = options.ignore,
                so = options.options;

            _.forEach(s, function (val, key) {
                if(shouldIgnore(ig,key)) return;

                if (_.isFunction(val)) {
                    //je ne sais
                } else if (_.isArray(val)) {
                    //TODO optimize to use prototype-based obj/member reuse when iterating over array
                    if (val.length === 0) {
                        o[key] = ko.observableArray([]);
                    } else {
                        if (re && (_.isObject(val[0]) || _.isPlainObject(val[0]))) {
                            o[key] = ko.observableArray(_.map(val, function (sval) {
                                if(so)
                                    return self.build(
                                        _.defaults(
                                            _.defaults({ source: sval }, so[key]),
                                            options)
                                        );
                                else
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
                b = options.builder,
                ig = options.ignore,
                so = options.options;

            // if we're definitely NOT bulding
            if(sb===false)
                b = function(i){i.__kom=true;return i;};
            else
            {
                //if there's a custom build, still __kom
                if(options.builder)
                    b = function(o){ var t = options.builder(o); t.__kom=true; return t;};
                else //use our build
                    b = funcOptsProxy(self.build, _.defaults({destination:void(0)},options) );
            }


            if (_.isArray(nItem) ||
                (ko.isObservable(nItem) && _.isArray(nItem())))
                return mapMany(options);

            //build if it hasnt been built or if it has no dest
            if(!_.has(nItem,"__kom") || !oItem)
                nItem = b(nItem);

            //return if there's no mapping to be done
            if(!oItem) return nItem;

            _.forEach(nItem, function (val, key) {
                if (!_.has(oItem, key)) return;
                if(shouldIgnore(ig,key)) return;

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
                    val.__kom = true;
                    if(recurse){
                        if(so && so[key]){
                            _.defaults(
                                _.defaults({ source: nItem[key], destination: oItem[key] },so[key])
                                    ,options);

                        } else
                            self.map(_.defaults({ source: nItem[key], destination: oItem[key] }, options));
                    }
                }


                if (Boolean(getter) && Boolean(setter)) {
                    setter(oItem[key], getter(nItem[key])); 
                }
            });
        };




    };
    return new ctor();

}(ko, _));