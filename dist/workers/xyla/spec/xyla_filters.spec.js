(function () {
    var filterFixture = {
        add: function () {
            var id = "filter_fixture";
            var fixture = "<div id=\"" + id + "\" class=\"filter-panel-action action-apply\" onclick=\"this.innerHTML = Number(this.innerHTML) + 1\">0</div>";
            document.body.insertAdjacentHTML('afterbegin', fixture);
            return id;
        },
        remove: function (id) {
            document.body.removeChild(document.getElementById(id));
        },
        clickedCount: function (id) {
            return Number(document.getElementById(id).innerHTML);
        },
    };
    // describe('setNeedsFilterUpdate', function() {
    //   let filterID;
    //     // inject the HTML fixture for the tests
    //     beforeEach(function() {
    //       filterID = filterFixture.add();
    //     });
    //     // remove the html fixture from the DOM
    //     afterEach(function() {
    //       filterFixture.remove(filterID);
    //       xyla.needsFilterUpdate = false;
    //       xyla.didUpdateFilter = false;
    //     });
    //     it('should click the apply filter button', function(done) {
    //       xyla.bi.mode.setNeedsFilterUpdate();
    //       setTimeout(() => {
    //         expect(filterFixture.clickedCount(filterID)).toBe(1);
    //         done();
    //       }, 600);
    //     });
    // });
    describe('recalculateRatioColumnOnFilterChange', function () {
        beforeEach(function () {
            window.datasets = [
                {
                    queryName: 'CPI by Campaign',
                    content: [
                        { campaign_id: 1, day: -1, campaign_tag: 'Toast', spend: 10.0, installs: 2, cpi: 5.0 },
                        { campaign_id: 2, day: -1, campaign_tag: 'Bread', spend: 10.0, installs: 2, cpi: 5.0 },
                        { campaign_id: 3, day: -1, campaign_tag: 'Toast', spend: 9.0, installs: 3, cpi: 3.0 },
                        { campaign_id: 1, day: -2, campaign_tag: 'Toast', spend: 6.0, installs: 1, cpi: 6 },
                    ]
                }
            ];
        });
        afterEach(function () {
            delete window.datasets;
        });
        it('should recalculate the ratio column by group', function () {
            xyla.bi.mode.recalculateRatioColumnOnFilterChange('CPI by Campaign', 'spend', 'installs', 'cpi', ['day', 'campaign_tag']);
            expect(window.datasets[0].content[0].cpi).toBe((10.0 + 9.0) / (2 + 3));
            expect(window.datasets[0].content[2].cpi).toBe(window.datasets[0].content[0].cpi);
            expect(window.datasets[0].content[1].cpi).toBe(10.0 / 2);
        });
        it('should divide the ratio column by the group\'s count', function () {
            xyla.bi.mode.recalculateRatioColumnOnFilterChange('CPI by Campaign', 'spend', 'installs', 'cpi', ['day', 'campaign_tag'], true);
            expect(window.datasets[0].content[0].cpi).toBe((10.0 + 9.0) / (2 + 3) / 2);
            expect(window.datasets[0].content[2].cpi).toBe(window.datasets[0].content[0].cpi);
            expect(window.datasets[0].content[1].cpi).toBe(10.0 / 2);
        });
    });
    describe('recalculateCumulativeSumColumnOnFilterChange', function () {
        beforeEach(function () {
            window.datasets = [
                {
                    queryName: 'Cumulative Revenue',
                    content: [
                        { channel: 'Google', cohort: '2019-01-01', campaign_tag: 'Toast', period: 0, revenue: 10.0, cumulative_revenue: 0.0 },
                        { channel: 'Google', cohort: '2019-01-01', campaign_tag: 'Bread', period: 0, revenue: 12.0, cumulative_revenue: 0.0 },
                        { channel: 'Facebook', cohort: '2019-01-01', campaign_tag: 'Toast', period: 0, revenue: 3.0, cumulative_revenue: 0.0 },
                        { channel: 'Facebook', cohort: '2019-01-01', campaign_tag: 'Toast', period: 1, revenue: 2.5, cumulative_revenue: 0.0 },
                    ]
                }
            ];
        });
        afterEach(function () {
            delete window.datasets;
        });
        it('should recalculate the cumulative sum column by group', function () {
            xyla.bi.mode.recalculateCumulativeSumColumnOnFilterChange('Cumulative Revenue', 'revenue', 'period', 'cumulative_revenue', ['channel', 'campaign_tag', 'cohort']);
            expect(window.datasets[0].content[0].cumulative_revenue).toBe(10.0);
            expect(window.datasets[0].content[1].cumulative_revenue).toBe(12.0);
            expect(window.datasets[0].content[2].cumulative_revenue).toBe(3.0);
            expect(window.datasets[0].content[3].cumulative_revenue).toBe(5.5);
        });
    });
})();
//# sourceMappingURL=xyla_filters.spec.js.map