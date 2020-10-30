(function () {
    var dataSetsFixture = {
        add: function () {
            window.datasets = [
                {
                    queryName: 'test_data_set',
                    content: [
                        { n1: 1, n2: 2, n3: 3, s1: 'a', s2: 'b', s3: 'c' },
                        { n1: 4, n2: 5, n3: 6, s1: 'a', s2: 'b', s3: 'd' },
                        { n1: 7, n2: 8, n3: 9, s1: 'a', s2: 'e', s3: 'f' },
                    ],
                },
            ];
        },
        remove: function (id) {
            delete window.datasets;
        },
    };
    describe('render', function () {
        beforeEach(function () {
            dataSetsFixture.add();
            document.body.insertAdjacentHTML('afterbegin', '<div id="graph"></div>');
        });
        afterEach(function () {
            document.body.removeChild(document.getElementById('graph'));
            dataSetsFixture.remove();
        });
        it('should exist', function () {
            expect(xyla.renderLineGraph !== undefined);
        });
        it('should render a line graph', function (done) {
            var vectors = xyla.tools.transformVectors(xyla.bi.mode.dataVectors('test_data_set'), xyla.transformers.group.by(['s1', 's2']), xyla.transformers.group.distinct('n1'), xyla.transformers.aggregate.sum('n2'));
            var renderOptions = {
                elementOptions: {
                    elementID: 'graph',
                    title: 'Test Graph Title',
                },
                graphs: [{
                        graphOptions: {
                            type: xyla.GraphType.line,
                            xAxisOptions: {
                                title: 'n1',
                                markers: [{
                                        position: 4,
                                        title: 'Uncrystallized'
                                    }],
                            },
                            yAxisOptions: {
                                title: 'n2',
                                markers: [],
                            },
                        },
                        dataVectors: vectors,
                    }],
            };
            xyla.tools.render(renderOptions);
            setTimeout(function () {
                expect($('#graph').children().length).toBeGreaterThan(0);
                done();
            }, 600);
        });
    });
    describe('Graph', function () {
        beforeEach(function () {
            dataSetsFixture.add();
            document.body.insertAdjacentHTML('afterbegin', '<div id="graph"></div>');
        });
        afterEach(function () {
            document.body.removeChild(document.getElementById('graph'));
            dataSetsFixture.remove();
        });
        it('should exist', function () {
            expect(xyla.renderLineGraph !== undefined);
        });
        it('should render a line graph', function (done) {
            var graph = new xyla.Graph()
                .setDataVectors(xyla.bi.mode.dataVectors('test_data_set'))
                .addGroupNamesDimension(['s1', 's2'])
                .addDistinctValuesDimension('n1')
                .addSumDimension('n2')
                .setGraphOptions({
                type: xyla.GraphType.line,
                xAxisOptions: {
                    title: 'n1',
                    markers: [{
                            position: 4,
                            title: 'Uncrystallized'
                        }],
                },
                yAxisOptions: {
                    title: 'n2',
                    markers: [],
                },
            })
                .setElementOptions({ elementID: 'graph', title: 'Graph class test' })
                .render();
            expect(graph).toBeDefined();
            setTimeout(function () {
                expect($('#graph').children().length).toBeGreaterThan(0);
                done();
            }, 600);
        });
    });
    describe('SumGraph', function () {
        beforeEach(function () {
            dataSetsFixture.add();
            document.body.insertAdjacentHTML('afterbegin', '<div id="graph"></div>');
        });
        afterEach(function () {
            document.body.removeChild(document.getElementById('graph'));
            dataSetsFixture.remove();
        });
        it('should exist', function () {
            expect(xyla.renderLineGraph !== undefined);
        });
        it('should render a line graph', function (done) {
            var vectors = xyla.bi.mode.dataVectors('test_data_set');
            var graph = new xyla.SumGraph(vectors, ['s1', 's2'], 'n1', 'n2')
                .setGraphOptions({
                type: xyla.GraphType.line,
                xAxisOptions: {
                    title: 'n1',
                    markers: [{
                            position: 4,
                            title: 'Uncrystallized'
                        }],
                },
                yAxisOptions: {
                    title: 'n2',
                    markers: [],
                },
            })
                .setElementOptions({ elementID: 'graph', title: 'SumGraph class test' })
                .render();
            expect(graph).toBeDefined();
            setTimeout(function () {
                expect($('#graph').children().length).toBeGreaterThan(0);
                done();
            }, 600);
        });
    });
})();
//# sourceMappingURL=xyla_graph.spec.js.map