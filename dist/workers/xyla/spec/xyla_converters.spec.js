(function () {
    var convertersDataFixture = {
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
            window.dataVectors = [
                {
                    vector: [
                        1,
                        2,
                        3,
                    ],
                    rows: [
                        { x: 1 },
                        { x: 2 },
                    ],
                },
                {
                    vector: [
                        4,
                        5,
                        6,
                    ],
                    rows: [
                        { x: 1 },
                        { x: 2 },
                    ],
                },
                {
                    vector: [
                        7,
                        8,
                        9,
                    ],
                    rows: [
                        { x: 1 },
                        { x: 2 },
                    ],
                },
            ];
        },
        remove: function (id) {
            delete window.datasets;
        },
    };
    describe('from.records', function () {
        beforeEach(function () { convertersDataFixture.add(); });
        afterEach(function () { convertersDataFixture.remove(); });
        it('should create a data vector from a data set', function () {
            var converter = xyla.converters.from.records();
            var records = window.datasets[0].content;
            var convertedVectors = converter(records);
            var expectedValue = [
                {
                    vector: [],
                    rows: records,
                },
            ];
            expect(convertedVectors).toEqual(expectedValue);
        });
    });
    describe('to.records', function () {
        beforeEach(function () { convertersDataFixture.add(); });
        afterEach(function () { convertersDataFixture.remove(); });
        it('should create records from data vectors', function () {
            var converter = xyla.converters.to.records({
                c1: -2,
                c2: -1,
            });
            var vectors = window.dataVectors;
            var convertedRecords = converter(vectors);
            var expectedValue = [
                {
                    c1: 2,
                    c2: 3,
                },
                {
                    c1: 5,
                    c2: 6,
                },
                {
                    c1: 8,
                    c2: 9,
                },
            ];
            expect(convertedRecords).toEqual(expectedValue);
        });
    });
})();
//# sourceMappingURL=xyla_converters.spec.js.map