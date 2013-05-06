# ko.mapUtil

*requires lodash*

*This item is pre-major release and thus not ready for production use. It is currently in testing and hopes to be major very, very soon. *

## ko.mapping = no good

One call for create, another for update. What gives?

## ko.mapUtil basics

You can always look at the unit tests for examples as well.

### mapUtil.build()

````
var mapUtil = pio.ko.util.mapUtil;

var obj = {
	hi:'there',
	myArray:[1,2,3,4]
};

var koObj = mapUtil.build({
	source:obj,

	// optional, defaulted, other options:
	// destination:{} 
	// recurse:true
});
````

Creates an observable-based obj out of the source obj.

### mapUtil.map()

````
var mapUtil = pio.ko.util.mapUtil;

var arrayOfItems = [ {id:1,name:'micah'}, {id:4,name:'jenna'}];
var preExistingKoArray = ko.observableArray( [ {id:1,name:'micah'}, {id:3, name:'justin'} ]);

var result = mapUtil.build({
	source:arrayOfItems,

	//this will in the end be the same as the returned result
	destination: preExistingKoArray

	//optional
	//predicate to tell if this is a match
	//this defaults to function(i,j){ return false; }
	predicate:function(i,j){ return i.id()===j.id(); }

	//optional
	//how to build the item, defaults to using the mapUtil.build() func
	//builder: function(i){ return mapUtil.build(i); }

	// defaulted, other options:
	// recurse:true
});
````

## MIT License
