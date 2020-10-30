(function () {
    var transformersDataFixture = {
        add: function () {
            window.datasets = [
                {
                    queryName: 'data_set_1',
                    content: [
                        { n1: 1, f1: 0.1, s1: 'a' },
                        { n1: 2, f1: 0.2, s1: 'a' },
                        { n1: 3, f1: 0.3, s1: 'b' },
                        { n1: 4, f1: 0.4, s1: 'c' },
                    ],
                },
                {
                    queryName: 'data_set_2',
                    content: [
                        { n1: 5, s1: 'a', s2: 'e' },
                        { n1: 6, s1: 'a', s2: 'f' },
                        { n1: 7, s1: 'b', s2: 'g' },
                        { n1: 8, s1: 'd', s2: 'g' },
                    ],
                },
            ];
        },
        remove: function (id) {
            delete window.datasets;
        },
    };
    describe('group.distinct', function () {
        beforeEach(function () { transformersDataFixture.add(); });
        afterEach(function () { transformersDataFixture.remove(); });
        it('should group by one column', function () {
            var transformer = xyla.transformers.group.distinct('s1');
            var vectors = xyla.bi.mode.dataVectors('data_set_1');
            var transformedVectors = transformer(vectors);
            var expectedValue = [
                {
                    vector: ['a'],
                    rows: [
                        { n1: 1, f1: 0.1, s1: 'a' },
                        { n1: 2, f1: 0.2, s1: 'a' },
                    ],
                },
                {
                    vector: ['b'],
                    rows: [
                        { n1: 3, f1: 0.3, s1: 'b' },
                    ],
                },
                {
                    vector: ['c'],
                    rows: [
                        { n1: 4, f1: 0.4, s1: 'c' },
                    ],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
        it('should group by multiple columns', function () {
            var transformer = xyla.transformers.group.distinct(['s1', 'n1']);
            var vectors = xyla.bi.mode.dataVectors('data_set_1');
            var transformedVectors = transformer(vectors);
            var expectedValue = [
                {
                    vector: ['a', 1],
                    rows: [
                        { n1: 1, f1: 0.1, s1: 'a' },
                    ],
                },
                {
                    vector: ['a', 2],
                    rows: [
                        { n1: 2, f1: 0.2, s1: 'a' },
                    ],
                },
                {
                    vector: ['b', 3],
                    rows: [
                        { n1: 3, f1: 0.3, s1: 'b' },
                    ],
                },
                {
                    vector: ['c', 4],
                    rows: [
                        { n1: 4, f1: 0.4, s1: 'c' },
                    ],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
        it('should group multiple vectors', function () {
            var transformer = xyla.transformers.group.distinct(['s1']);
            var vectors = xyla.tools.flatten([xyla.bi.mode.dataVectors('data_set_1'), xyla.bi.mode.dataVectors('data_set_1')]);
            var transformedVectors = transformer(vectors);
            var expectedValue = [
                {
                    vector: ['a'],
                    rows: [
                        { n1: 1, f1: 0.1, s1: 'a' },
                        { n1: 2, f1: 0.2, s1: 'a' },
                    ],
                },
                {
                    vector: ['b'],
                    rows: [
                        { n1: 3, f1: 0.3, s1: 'b' },
                    ],
                },
                {
                    vector: ['c'],
                    rows: [
                        { n1: 4, f1: 0.4, s1: 'c' },
                    ],
                },
                {
                    vector: ['a'],
                    rows: [
                        { n1: 1, f1: 0.1, s1: 'a' },
                        { n1: 2, f1: 0.2, s1: 'a' },
                    ],
                },
                {
                    vector: ['b'],
                    rows: [
                        { n1: 3, f1: 0.3, s1: 'b' },
                    ],
                },
                {
                    vector: ['c'],
                    rows: [
                        { n1: 4, f1: 0.4, s1: 'c' },
                    ],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
    });
    describe('join.on', function () {
        beforeEach(function () { transformersDataFixture.add(); });
        afterEach(function () { transformersDataFixture.remove(); });
        it('should join on one column', function () {
            var transformer = xyla.transformers.join.on({ s1: 's1' });
            var vectors = xyla.bi.mode.dataVectors('data_set_1').concat(xyla.bi.mode.dataVectors('data_set_2'));
            var transformedVectors = transformer(vectors);
            var expectedValue = [
                {
                    vector: [],
                    rows: [
                        { n1: 1, f1: 0.1, s1: 'a', s2: 'e' },
                        { n1: 1, f1: 0.1, s1: 'a', s2: 'f' },
                        { n1: 2, f1: 0.2, s1: 'a', s2: 'e' },
                        { n1: 2, f1: 0.2, s1: 'a', s2: 'f' },
                        { n1: 3, f1: 0.3, s1: 'b', s2: 'g' },
                        { n1: 4, f1: 0.4, s1: 'c', s2: null },
                    ],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
        it('should join on multiple columns', function () {
            return true;
        });
        it('should join on different columns through a map', function () {
            return true;
        });
    });
    describe('vector.stringKey', function () {
        var vectors = [];
        beforeEach(function () {
            vectors = [
                {
                    vector: ['a', 1, 0.1],
                    rows: [],
                },
                {
                    vector: ['b', 2, 0.2],
                    rows: [],
                },
            ];
        });
        afterEach(function () { vectors = []; });
        it('should concatenate all entries in each vector', function () {
            var transformedVectors = xyla.transformers.vector.stringKey()(vectors);
            var expectedValue = [
                {
                    vector: ['["a",1,0.1]'],
                    rows: [],
                },
                {
                    vector: ['["b",2,0.2]'],
                    rows: [],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
        it('should join on multiple columns', function () {
            return true;
        });
        it('should join on different columns through a map', function () {
            return true;
        });
    });
    describe('data.align', function () {
        var vectors = [];
        beforeEach(function () {
            vectors = [
                {
                    vector: [],
                    rows: [
                        { n1: 1, f1: 0.1, f2: null, f3: 1.1, s1: 'a' },
                        { n1: 2, f1: null, f2: 2.0, f3: 0.0, s1: 'a' },
                        { n1: 2, f1: 0.3, f2: 3.0, f3: 0.0, s1: 'b' },
                        { n1: 3, f1: null, f2: null, f3: 0.0, s1: 'c' },
                    ],
                },
            ];
        });
        afterEach(function () { vectors = []; });
        it('should align data to the last complete frame', function () {
            var transformedVectors = xyla.transformers.data.align('n1', [['f1'], ['f2', 'f3']], false, true)(vectors);
            var expectedValue = [
                {
                    vector: [],
                    rows: [
                        { n1: 1, f1: 0.1, f2: null, f3: 1.1, s1: 'a' },
                        { n1: 2, f1: null, f2: 2.0, f3: 0.0, s1: 'a' },
                        { n1: 2, f1: 0.3, f2: 3.0, f3: 0.0, s1: 'b' },
                    ],
                },
            ];
            expect(transformedVectors).toEqual(expectedValue);
        });
    });
})();
//# sourceMappingURL=xyla_transformers.spec.js.map