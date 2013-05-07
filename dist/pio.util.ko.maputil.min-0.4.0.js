/*! PIO.util.ko.maputil - v0.4.0 - 2013-05-07
* https://github.com/micahasmith/ko.mapUtil
* Copyright (c) 2013 Micah Smith; Licensed MIT */
var PIO=PIO||{};PIO.util=PIO.util||{},PIO.util.ko=PIO.util.ko||{},PIO.util.ko.mapUtil=function(o,n){var e=function(){var e=this,i=function(o,e){return o&&n.contains(o,e)?!0:!1},r=function(e){return o.isObservable(e)&&n.isArray(e())},s=function(o){return n.isString(o)||n.isDate(o)||n.isNumber(o)||n.isRegExp(o)||n.isBoolean(o)&&!n.isObject(o)},l=function(o){var n=o.source;return s(n)?n:e.build(o)},t=function(i){var s=i.source,t=i.destination,a=i.options||{},u=a.matchPredicate,c=(a.recurse||!0,a.ignore,Boolean(u)),b=[];return console.group("mapMany(): entered on,",i),t||(t=[]),r(t)||(console.log("mapMany(): making an observableArray of ",t),t=o.observableArray(t)),s&&r(s)&&(s=o.utils.unwrapObservable(s)),console.log("mapMany(): source is ",s),c||(console.log("mapMany(): no items, clearing observableArray of ",t),t.removeAll()),t().length?(n.forEach(s,function(o){console.log("mapMany(): working on new item",o);var i=l({source:o,options:a.items||{}}),r=n(t()).find(function(o){return u(o,i)});r?e.map({source:i,destination:r,options:a.items||{}}):b.push(i)}),n(b).forEach(function(o){t.push(o)})):n(s).forEach(function(o){console.log("mapMany(): working on new item",o);var n=l({source:o,options:a.items||{}});t.push(n)}),console.log("mapMany(): returning ",t),console.groupEnd(),t};this.build=function(r){var s=r.destination||{},l=r.source,t=r.options||{},a=t.recurse||!0,u=t.ignore,c=t.preBuild,b=t.postBuild;if(console.group("build(): entered on ",r),c&&(console.log("build(): calling prebuild"),s=c(s),!s))throw Error("prebuild function did not return a value");if(n.forEach(l,function(r,l){return console.log("build(): working on ",l,r),i(u,l)?(console.log("build(): ignoring ",l),void 0):(n.isFunction(r)&&o.isWriteableObservable(r)?(console.log("build(): a function",l),s[l]=r):n.isArray(r)?0===r.length?s[l]=o.observableArray([]):a&&(n.isObject(r[0])||n.isPlainObject(r[0]))?(console.log("build(): recursing into array items under ",l),s[l]=o.observableArray(n.map(r,function(o){return e.build({source:o,options:t[l]||{}})}))):(console.log("build(): assigning ",l," value ",r),s[l]=o.observableArray(r)):n.isPlainObject(r)||n.isObject(r)?(console.log("build(): is object ",l),s[l]=a?e.build({source:r,options:t[l]||{}}):o.observable(r)):(console.log("build(): is primitive ",l),s[l]=o.observable(r)),void 0)}),s.__kom=!0,b&&(console.log("build(): calling postbuild"),s=b(s),!s))throw Error("postbuild function did not return a value");return console.log("build():returning ",s),console.groupEnd(),s},this.map=function(s){var l=s.source,a=s.destination,u=s.options||{},c=function(){return e.build({source:l,options:u})},b=u.recurse||!1,g=u.ignore||[];return console.group("map(): entered on ",s),g&&g.push("__kom"),n.isArray(l)||r(l)?(console.log("is an array/observableArray"),t(s)):a?(n.has(l,"__kom")||(console.log("map(): doing a prebuild on ",l),l=c()),n.forEach(l,function(s,c){if(console.group("map(): working on ",c),console.log("map(): value is ",c,s),n.has(a,c)&&!i(g,c)){var p,d,m=function(o){return o()},f=function(o,n){o(n)};r(s)?(console.log("map(): item is observableArray, calling mapMany on ",c),t({source:s,destination:a[c],options:u[c]||{}})):n.isFunction(s)?o.isWriteableObservable(s)&&(console.log("map(): item is observable",c),p=m,d=f):n.isObject(s)&&b&&(console.log("map(): is object, recursing on ",c),e.map(n.defaults({source:s,destination:a[s]},{options:u[c]||{}}))),Boolean(p)&&Boolean(d)&&(console.log("setting one to another"),d(a[c],p(l[c]))),console.groupEnd()}}),console.log("map(): returning ",a),console.groupEnd(),a):(console.log("map(): just a build request"),c())}};return new e}(ko,_);