# ko.mapUtil

*requires lodash*

*This item is pre-major release and thus not ready for production use. It is currently in testing and hopes to be major very, very soon.*

## ko.mapping = no good

One call for create, another for update. What gives? Why do i have to manually track stuff?

## ko.mapUtil basics

You can always look at the unit tests for examples as well.

### mapUtil.map()

The `map()` function does it all--refreshes models, etc with new data, OR creates a new observable-based obj out of new data.

#### create a knockout-based obj from a plain obj

```js
var mapUtil = PIO.util.ko.mapUtil;

var obj = {
	hi:'there',
	myArray:[1,2,3,4]
};

var koObj = mapUtil.map({
	source:obj,

	// optional, defaulted, other options:
	// recurse:true
});

koObj.hi()==="there";
// -> true

```

#### map a single object to another object

```js
var mapUtil = PIO.util.ko.mapUtil;

var obj = {
	hi:ko.observable('there')
};

var obj2 = {
	hi:ko.observable()
};

var koObj = mapUtil.map({
	source:obj,
	destination:obj2
});

obj2.hi()==="there";
// -> true

obj2 === koObj;
// -> true

```

#### map an array of objs to another array of objs

```js
var mapUtil = PIO.util.ko.mapUtil;

var arrayOfItems = [ {id:1,name:'micah'}, {id:4,name:'jenna'}];
var preExistingKoArray = ko.observableArray( [ {id:1,name:'micah'}, {id:3, name:'justin'} ]);

var result = mapUtil.build({
	source:arrayOfItems,

	//this will in the end be the same as the returned result
	destination: preExistingKoArray

	//optional
	//predicate to tell if this is a match
	//this defaults to function(i,j){ return false; }
	//in this case, i want to match up my items based upon their "id"
	predicate:function(i,j){ return i.id()===j.id(); }

	//optional
	//how to build the item, defaults to using the mapUtil.build() func
	//builder: function(i){ return mapUtil.build(i); }

	// defaulted, other options:
	// recurse:true
});
```




## MIT License
