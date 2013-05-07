# ko.mapUtil

*requires lodash*

*This item is pre-major release and thus not ready for production use. It is currently in testing and hopes to be major very, very soon.*

## ko.mapping === no good

One call for create, another for update. What gives? Why do i have to manually track stuff? Why don't things update and observables get called automatically when i refresh my data from ajax data like i want to?

##ko.mapUtil === mapping utopia 

`ko.mapUtil` has a super simple API that enables customization and mapping at any level of depth in your model. Things it does out of the box:

* can take an object and turn its properties into observable, observableArray, etc
* can take two objects and map ones properties to another
* can take two arrays and upsert items, calling observables as it goes
* can ignore specific properties
* can call custom constructors/processors before or after turning its properties into observables, etc

And all from the same, super easy API!

## ko.mapUtil basics

*Remember--you can always look at the unit tests for further examples as well.*

The most important thing to know is the `options` object literal which enables very easy usage and customization.

### the options object literal

When calling `map()`, you always pass in an options objlit like the following example:

```js
{
	//required
	source:{
		name:'jack',
		friends:['mary','paul','james']
	};

	//required only if you want to map from one obj to another
	destination:{}

	//this is the important part!
	//match this to the structure of `source` above to enable settings at every level!

	//the point is-- you can use this to very very specifically set build/map funtionality
	options:{

		//if i wanted to set options for the friends array
		friends:{

			//see further example below
			matchPredicate: function(i,j){ return i===j; };

		}
	}

}

```

See the examples below to see how to use all available settings.

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
	source:obj
});

koObj.hi()==="there";
// -> true

```

#### map a single object to another object

```js
var mapUtil = PIO.util.ko.mapUtil;

var obj = {
	hi:'there'
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

#### ignore a property while mapping/building

```js
var mapUtil = PIO.util.ko.mapUtil;

var obj = {
	hi:ko.observable('there')
	friend:ko.observable('there')
};

var obj2 = {
	hi:ko.observable()
};

var koObj = mapUtil.map({
	source:obj,
	destination:obj2,
	options:{
		ignore:["friend"]
	}
});

obj2.hi()==="there";
// -> true

typeof obj2.friend === "undefined";
// -> true

```

#### ignore a deeper property while mapping/building

```js
var mapUtil = PIO.util.ko.mapUtil;

var obj = {
	hi:ko.observable('there'),
	subObj:{
		friend:ko.observable('there'),
	}
};

var obj2 = {
	hi:ko.observable()
};

var koObj = mapUtil.map({
	source:obj,
	destination:obj2,

	//you make this match the structure of the object
	//in order to apply rules at this level
	options:{
		subObj:{
			ignore:["friend"]
		}
	}
});

obj2.hi()==="there";
// -> true

typeof obj2.subObj.friend === "undefined";
// -> true

```

#### map an array of objs to another array of objs

```js
var mapUtil = PIO.util.ko.mapUtil;

var arrayOfItems = [ {id:1,name:'micah'}, {id:4,name:'jenna'}];
var preExistingKoArray = ko.observableArray( [ 
	{
		id:ko.observable(1),
		name:ko.observable('micah')
	}, 
	{
		id:ko.observable(3), 
		name:ko.observable('justin')
	} 
]);

var result = mapUtil.map({
	source:arrayOfItems,

	//this will in the end be the same as the returned result
	destination: preExistingKoArray

	options:{
		//predicate to match existing to new items
		//this defaults to function(i,j){ return false; }
		//however in this case, i want to match up my items based upon their "id"
		matchPredicate:function(i,j){ return i.id()===j.id(); }
	}
	
});
```

#### map an array of objs to another array of objs, using my custom obj constructor

```js
var mapUtil = PIO.util.ko.mapUtil;

var arrayOfItems = [ {id:1,name:'micah'}, {id:4,name:'jenna'}];
var preExistingKoArray = ko.observableArray( [ 
	{
		id:ko.observable(1),
		name:ko.observable('micah')
	}, 
	{
		id:ko.observable(3), 
		name:ko.observable('justin')
	} 
]);

var result = mapUtil.map({
	source:arrayOfItems,

	//this will in the end be the same as the returned result
	destination: preExistingKoArray

	options:{
		//predicate to match existing to new items
		//this defaults to function(i,j){ return false; }
		//however in this case, i want to match up my items based upon their "id"
		matchPredicate:function(i,j){ return i.id()===j.id(); },

		items:{
			//a constructor to be called after the item is ko-ifyed
			postBuilder:function(i){
				return new Person(i);
			}
		}
	}
	
});
```



#### map an array of objs to another array of objs, preprocessing AND using my custom obj constructor

```js
var mapUtil = PIO.util.ko.mapUtil;

var arrayOfItems = [ {id:1,name:'micah'}, {id:4,name:'jenna'}];
var preExistingKoArray = ko.observableArray( [ 
	{
		id:ko.observable(1),
		name:ko.observable('micah')
	}, 
	{
		id:ko.observable(3), 
		name:ko.observable('justin')
	} 
]);

var result = mapUtil.map({
	source:arrayOfItems,

	//this will in the end be the same as the returned result
	destination: preExistingKoArray

	options:{
		//predicate to match existing to new items
		//this defaults to function(i,j){ return false; }
		//however in this case, i want to match up my items based upon their "id"
		matchPredicate:function(i,j){ return i.id()===j.id(); },

		items:{
			//a constructor to be called after the item is ko-ifyed
			postBuilder:function(i){
				return new Person(i);
			},

			//a preprocessor against items
			preBuilder:function(i){
				//create a nasty bug by changing ids! BWAHAHAHHAHA
				i.id( i.id()*5 );
				return i;
			}
		}	
	}
	
});
```



## MIT License
