/// <reference path="../lib/jasmine-1.3.1/jasmine.js" />


describe("pio.util.ko.maputil", function () {
    var mapUtil = PIO.util.ko.mapUtil;

    var TestObj = function(){
        this.obs = ko.observable();
        this.obsArray = ko.observableArray([]);
        this.child = false;
    };

    var testObjFactory = function () {
        var t1 = new TestObj();
        t1.child = new TestObj();
        return t1;
    };

    it("exists at the correct namespace/name", function () {
        expect(mapUtil).toBeDefined();
    });

    describe('map()',function(){
        
        describe('when building out ko-enabled objects',function(){
             describe('when against an obj lit', function () {
                it('can build a string', function () {
                    var d = mapUtil.map({
                        source: { hi: 'there' },
                    });

                    expect(d.hi()).toEqual('there');
                    expect(d.__kom).toEqual(true);
                });
                it('can build a number', function () {
                    var d = mapUtil.map({
                        source: { hi: 4 },
                    });

                    expect(d.hi()).toEqual(4);
                    expect(d.__kom).toEqual(true);
                });
                it('can build an array of "primatives"', function () {
                    var d = mapUtil.map({
                        source: { hi: [1,2,3] },
                    });

                    expect(d.hi()).toEqual([1,2,3]);
                    expect(d.__kom).toEqual(true);
                });
                it('can deep copy an array of sub objlits', function () {
                    var d = mapUtil.map({
                        source: {
                            hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                            there: { how: "are" }
                        },
                    });

                    expect(d.there.how()).toEqual("are");
                    expect(d.hi()[0].a.l()).toEqual('a');
                    expect(d.hi()[1].b.l()).toEqual('b');
                    expect(d.__kom).toEqual(true);
                });
                it('can call the preBuild function',function(){
                    var d = mapUtil.map({
                        source: {
                            hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                            there: { how: "are" }
                        },
                        options:{
                            preBuild: function(i){
                                i.meow='kitten';
                                return i;
                            }
                        }
                    });

                    expect(d.meow).toEqual('kitten');

                });

                it('can call the postBuild function',function(){
                    var d = mapUtil.map({
                        source: {
                            hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                            there: { how: "are" }
                        },
                        options:{
                            postBuild: function(i){
                                i.meow=ko.observable('kitten');
                                return i;
                            }
                        }
                    });

                    expect(d.meow()).toEqual('kitten');

                });

                it('can ignore a parent-level object',function(){
                    var d = mapUtil.map({
                        source: {
                            hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                            there: { how: "are" }
                        },
                        options:{
                            ignore:['there']
                        }
                    });

                    expect(d.there).toBeUndefined();
                    expect(d.hi()[0].a.l()).toEqual('a');
                    expect(d.hi()[1].b.l()).toEqual('b');
                    expect(d.__kom).toEqual(true);
                });
                it('can ignore an n(1)-nested-level object',function(){
                    var d = mapUtil.map({
                        source: {
                            hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                            there: { how: "are" }
                        },
                        options:{
                            there:{
                                ignore:['how']
                            }
                        }
                    });

                    expect(d.there.how).toBeUndefined();
                    expect(d.hi()[0].a.l()).toEqual('a');
                    expect(d.hi()[1].b.l()).toEqual('b');
                    expect(d.__kom).toEqual(true);
                });
            });
        });

        describe('when mapping objects to objects',function(){
            var t1 = new TestObj();
            var t2 = new TestObj();

            beforeEach(function () {
                t1 = testObjFactory();
                t2 = testObjFactory();
            });

            describe('when mapping plain objs to ko objs',function(){
                it("maps flat object's obs and obsArray",function(){
                    var f1 = {obs:'hi', obsArray:[1,2,3]},
                        f2 = {obs:ko.observable(),obsArray:ko.observableArray([3,4,5])};

                    mapUtil.map({ source: f1, destination: f2 });
                    expect(f2.obs()).toEqual('hi');
                    expect(f2.obsArray()).toEqual([1,2,3]);
                });

            });

            describe('when mapping mapped to mapped items',function(){

                it("maps from ext to an internally-built, flat object's observables",function(){
                    var f1 = {obs:ko.observable('hi'), __kom:true},
                        f2 = {obs:ko.observable(),__kom:true};
                    mapUtil.map({ source: f1, destination: f2 });
                    expect(f1.obs()).toEqual('hi');
                    expect(f2.obs()).toEqual('hi');
                });


                it("reuses the object",function(){
                    var f1 = {obs:ko.observable('hi')},
                        f2 = {obs:ko.observable('there'),__kom:true};

                    var m1 = mapUtil.map({source:f1});
                    m1.__hi = true;

                    mapUtil.map({ source: f2, destination: m1 });
                    expect(m1.obs()).toEqual('there');
                    expect(m1.__hi).toEqual(true);
                    expect(f2.obs()).toEqual('there');
                });

            });
            

        }); 

        describe('when mapping arrays to arrays',function(){
            describe('when mapping plain objs to ko objs',function(){

                it("without a predicate, it clears and starts over, mapping flat objects",function(){
                    var f1 = [{obs:'hi', obsArray:[1,2,3]}],
                        f2 = ko.observableArray([{obs:ko.observable(),obsArray:ko.observableArray([3,4,5])}]);

                    mapUtil.map({ source: f1, destination: f2 });
                    expect(f2().length).toEqual(1);
                    expect(f2()[0].obs()).toEqual('hi');
                    expect(f2()[0].obsArray()).toEqual([1,2,3]);
                });

                describe('when using a predicate',function(){
                    it('adds in items it didnt find',function(){
                        var f1 = [{obs:'hi', obsArray:[1,2,3]}],
                            f2 = ko.observableArray([{obs:ko.observable(),obsArray:ko.observableArray([3,4,5])}]);

                        mapUtil.map({ 
                            source: f1, 
                            destination: f2,
                            options:{
                                matchPredicate:function(i,j){ return i.obs() === j.obs(); }
                            }
                        });

                        expect(f2().length).toEqual(2);
                        expect(f2()[1].obs()).toEqual('hi');
                        expect(f2()[1].obsArray()).toEqual([1,2,3]);

                    });

                    it('matches and updates items it finds',function(){
                        var f1 = [{obs:'hi', obsArray:[1,2,3]}],
                            f2 = ko.observableArray([
                                {obs:ko.observable('hi'),obsArray:ko.observableArray([3,4,5])},
                                {obs:ko.observable('there'),obsArray:ko.observableArray([7,8,9])}

                                ]);

                        mapUtil.map({ 
                            source: f1, 
                            destination: f2,
                            options:{
                                matchPredicate:function(i,j){ return i.obs() === j.obs(); }
                            }
                        });

                        expect(f2().length).toEqual(2);
                        expect(f2()[0].obs()).toEqual('hi');
                        expect(f2()[0].obsArray()).toEqual([1,2,3]);

                    });

                    it('keeps the unmatched',function(){
                        var f1 = [{obs:'hi', obsArray:[1,2,3]}],
                            f2 = ko.observableArray([
                                {obs:ko.observable('hi'),obsArray:ko.observableArray([3,4,5])},
                                {obs:ko.observable('there'),obsArray:ko.observableArray([7,8,9])}

                                ]);

                        mapUtil.map({ 
                            source: f1, 
                            destination: f2,
                            options:{
                                matchPredicate:function(i,j){ return i.obs() === j.obs(); }
                            }
                        });

                        expect(f2().length).toEqual(2);
                        expect(f2()[1].obs()).toEqual('there');
                        expect(f2()[1].obsArray()).toEqual([7,8,9]);

                    });
                });
                

            });

        });

    });


});