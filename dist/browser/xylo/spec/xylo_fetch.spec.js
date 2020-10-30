(function () {
    describe('xylo.Fetcher', function () {
        it('should exist', function () {
            expect(xylo.Fetcher).toBeDefined();
        });
        it('should have a fetch method', function () {
            expect((new xylo.Fetcher()).fetch).toBeDefined();
        });
    });
})();
//# sourceMappingURL=xylo_fetch.spec.js.map