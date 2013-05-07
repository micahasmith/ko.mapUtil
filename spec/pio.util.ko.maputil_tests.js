/// <reference path="../lib/jasmine-1.3.1/jasmine.js" />


describe("pio.ko.util.maputil", function () {
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

    describe('build()', function () {
        describe('when against an obj lit', function () {

            it('can build a string', function () {
                var d = mapUtil.build({
                    source: { hi: 'there' },
                    build:false
                });

                expect(d.hi()).toEqual('there');
            });
            it('can build a number', function () {
                var d = mapUtil.build({
                    source: { hi: 4 },
                    build:false
                });

                expect(d.hi()).toEqual(4);
            });
            it('can build an array of "primatives"', function () {
                var d = mapUtil.build({
                    source: { hi: [1,2,3] },
                    build:false
                });

                expect(d.hi()).toEqual([1,2,3]);
            });
            it('can deep copy an array of sub objlits', function () {
                var d = mapUtil.build({
                    source: {
                        hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                        there: { how: "are" }
                    },
                    build:false
                });

                expect(d.there.how()).toEqual("are");
                expect(d.hi()[0].a.l()).toEqual('a');
                expect(d.hi()[1].b.l()).toEqual('b');
            });
        });

    });

    describe('map()', function () {
        var t1 = new TestObj();
        var t2 = new TestObj();

        beforeEach(function () {
            t1 = testObjFactory();
            t2 = testObjFactory();
        });

        it("doesnt build when the item was prebuilt (has __kom)",function(){
            t2.obs('hi');
            t2.__kom=true;
            mapUtil.map({ source: t2, destination: t1 });
            expect(t1.obs()).toEqual('hi');
            expect(t2.obs()).toEqual('hi');
        });

        it("maps an observable to an observable", function () {
            t2.obs('hi');
            mapUtil.map({ source: t2, destination: t1, build:false });
            expect(t1.obs()).toEqual('hi');
            expect(t2.obs()).toEqual('hi');
        });

        it("maps an observableArray to an observableArray", function () {
            var ar = [1,2,3,4];
            t2.obsArray(ar);
            mapUtil.map({ source: t2, destination: t1, build:false });
            expect(t1.obsArray()).toEqual(ar);
            expect(t2.obsArray()).toEqual(ar);
        });

        it("does not recurse if specified", function () {
            t2.obs('hi');
            mapUtil.map({ source: t2, destination: t1, recurse:false, build:false });
            expect(t1.child.obs()).toBeUndefined();
            expect(t2.child.obs()).toBeUndefined();
        });

        describe('when calling build() via map() via by default',function(){
            it('can deep copy an array of sub objlits', function () {
                var d = mapUtil.map({
                    source: {
                        hi: [{ a: { l: 'a' }},{ b: { l: 'b' } }],
                        there: { how: "are" }
                    }
                });

                expect(d.there.how()).toEqual("are");
                expect(d.hi()[0].a.l()).toEqual('a');
                expect(d.hi()[1].b.l()).toEqual('b');
            });

        });

        describe("when recurse=true", function () {
            it('does map children', function () {
                t2.child.obs('hi');
                mapUtil.map({ source: t2, destination: t1, build:false });
                expect(t1.child.obs()).toEqual('hi');
                expect(t2.child.obs()).toEqual('hi');
            });
        });
    });
    describe('mapMany() via map()', function () {
        var source = [];
        var dest = ko.observableArray([]);
        beforeEach(function () {
            source = [];
            dest = ko.observableArray([]);
            for (var i = 0; i < 5; i++){
                var obj = testObjFactory();
                obj.obs(i);
                source.push(obj);
            }
        });

        it('maps array to a new array, matching by predicate, using default mapper = map()', function () {
            mapUtil.map({
                source: source,
                destination: dest,
                build:false,
                predicate: function (i, j) { return i.obs() === j.obs(); },
            });

            expect(dest().length).toEqual(source.length);
            for (var i = 0; i < source.length; i++) {
                expect(dest()[i].obs()).toEqual(source[i].obs());
            }
        });

        describe('when mapping to an array with existing elements', function () {
            var getTestData = function () {
                var source = [];
                var dest = [];
                for (var i = 0; i < 5; i++) {
                    var o1 = testObjFactory();
                    var o2 = testObjFactory();
                    o1.obs(i);
                    o2.obs(i);
                    o2.obsArray([1, 2, 3]);
                    source.push(o1);
                    dest.push(o2);
                }
                return {
                    source: source,
                    dest: ko.observableArray(dest),
                    build:false
                };
            };

            it('matches by predicate, updates elements accordingly, using default mapper = map()', function () {
                var data = getTestData();
                var s = data.source;
                var d = data.dest;

                mapUtil.map({
                    source: s,
                    destination: d,
                    predicate: function (i, j) { return i.obs() === j.obs(); },
                    build:false
                });

                for (var i = 0; i < s.length; i++) {
                    expect(d()[i].obsArray()).toEqual(s[i].obsArray());
                }
            });

            it ("adds in items that weren't in the original source", function () {
                var data = getTestData();
                var s = data.source;
                var d = data.dest;

                var extra = testObjFactory();
                extra.obsArray([4, 5, 6]);
                s.push(extra);


                mapUtil.map({
                    source: s,
                    destination: d,
                    predicate: function (i, j) { return i.obs() === j.obs(); },
                    build:false
                });

                for (var i = 0; i < s.length-1; i++) {
                    expect(d()[i].obsArray()).toEqual(s[i].obsArray());
            }
                expect(d()[d().length - 1].obsArray()).toEqual([4, 5, 6]);
            });
        });

    });
});