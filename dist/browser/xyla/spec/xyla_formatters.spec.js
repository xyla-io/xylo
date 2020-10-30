(function () {
    describe('affix', function () {
        it('should add a prefix', function () {
            var formatter = xyla.formatters.affix('a');
            var formatted = formatter('b');
            expect(formatted).toBe('ab');
        });
        it('should add a suffix', function () {
            var formatter = xyla.formatters.affix(null, 'c');
            var formatted = formatter('b');
            expect(formatted).toBe('bc');
        });
        it('should use a separator', function () {
            var formatter = xyla.formatters.affix('a', 'c', ' ');
            var formatted = formatter('b');
            expect(formatted).toBe('a b c');
        });
        it('should skip empty values', function () {
            var formatter = xyla.formatters.affix('a', 'c', ' ');
            var formatted = formatter('');
            expect(formatted).toBe('');
        });
    });
    describe('empty', function () {
        it('should substitute for empty values', function () {
            var formatter = xyla.formatters.empty('empty');
            var formatted = formatter(null);
            expect(formatted).toBe('empty');
            formatted = formatter(undefined);
            expect(formatted).toBe('empty');
            formatted = formatter('');
            expect(formatted).toBe('empty');
        });
        it('should substitute for no-empty values', function () {
            var formatter = xyla.formatters.empty('nothing', 'something');
            var formatted = formatter(3);
            expect(formatted).toBe('something');
            formatted = formatter(null);
            expect(formatted).toBe('nothing');
        });
        it('should preserve non-empty values by default', function () {
            var formatter = xyla.formatters.empty();
            var formatted = formatter(3);
            expect(formatted).toBe(3);
            formatted = formatter(null);
            expect(formatted).toBe('');
        });
    });
    describe('string', function () {
        it('should return a string', function () {
            var formatter = xyla.formatters.string();
            var formatted = formatter(3);
            expect(formatted).toBe('3');
        });
        it('should skip empty values', function () {
            var formatter = xyla.formatters.string();
            var formatted = formatter('');
            expect(formatted).toBe('');
        });
    });
    describe('date', function () {
        it('should return a formatted date string', function () {
            var formatter = xyla.formatters.date('%Y-%m-%d');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('2019-02-01');
        });
        it('should skip empty values', function () {
            var formatter = xyla.formatters.date('%Y-%m-%d');
            var formatted = formatter('');
            expect(formatted).toBe('');
        });
    });
    describe('number', function () {
        it('should format numeric precision', function () {
            var formatter = xyla.formatters.number(3);
            var formatted = formatter(1.23456);
            expect(formatted).toBe('1.235');
        });
        it('should customize decimals and separators', function () {
            var formatter = xyla.formatters.number(3, ',', '.');
            var formatted = formatter(12345678.9);
            expect(formatted).toBe('12.345.678,900');
        });
        it('should handle string arguments', function () {
            var formatter = xyla.formatters.number('3', ',', '.');
            var formatted = formatter(12345678.9);
            expect(formatted).toBe('12.345.678,900');
        });
        it('should skip empty values', function () {
            var formatter = xyla.formatters.number(3);
            var formatted = formatter('');
            expect(formatted).toBe('');
        });
    });
    describe('dateAdd', function () {
        it('should add days', function () {
            var formatter = xyla.formatters.dateAdd(4);
            var formatted = formatter(new Date(2019, 0, 1).getTime());
            expect(formatted).toBe(new Date(2019, 0, 5).getTime());
        });
        it('should add milliseconds', function () {
            var formatter = xyla.formatters.dateAdd(50, 'milliseconds');
            var formatted = formatter(new Date(2019, 0, 1, 0, 0, 0, 0).getTime());
            expect(formatted).toBe(new Date(2019, 0, 1, 0, 0, 0, 50).getTime());
        });
        it('should subtract days', function () {
            var formatter = xyla.formatters.dateAdd(-20);
            var formatted = formatter(new Date(2019, 0, 21).getTime());
            expect(formatted).toBe(new Date(2019, 0, 1).getTime());
        });
        it('should add seconds', function () {
            var formatter = xyla.formatters.dateAdd(5, 'seconds');
            var formatted = formatter(new Date(2019, 0, 1, 0, 0, 0).getTime());
            expect(formatted).toBe(new Date(2019, 0, 1, 0, 0, 5).getTime());
        });
        it('should add months', function () {
            var formatter = xyla.formatters.dateAdd(5, 'months');
            var formatted = formatter(new Date(2019, 0, 1).getTime());
            expect(formatted).toBe(new Date(2019, 5, 1).getTime());
        });
        it('should subtract months', function () {
            var formatter = xyla.formatters.dateAdd(-5, 'months');
            var formatted = formatter(new Date(2020, 2, 1).getTime());
            expect(formatted).toBe(new Date(2019, 9, 1).getTime());
        });
    });
    describe('dateRange', function () {
        it('should return date ranges in default format', function () {
            var formatter = xyla.formatters.dateRange(4);
            var formatted = formatter(new Date(2019, 0, 1).getTime());
            expect(formatted).toBe('2019-01-01 : 2019-01-05');
        });
        it('should handle negative date ranges', function () {
            var formatter = xyla.formatters.dateRange(-4);
            var formatted = formatter(new Date(2019, 0, 1).getTime());
            expect(formatted).toBe('2019-01-01 : 2018-12-28');
        });
        it('should format date ranges as specified', function () {
            var formatter = xyla.formatters.dateRange(8, 'months', '%m/%d');
            var formatted = formatter(new Date(2019, 1, 2).getTime());
            expect(formatted).toBe('02/02 : 10/02');
        });
        it('should use a custom separator when supplied', function () {
            var formatter = xyla.formatters.dateRange(2, 'weeks', '', ' & ');
            var formatted = formatter(new Date(2019, 1, 1).getTime());
            expect(formatted).toBe('2019-02-01 & 2019-02-15');
        });
    });
    describe('multiply', function () {
        it('should multiply numbers', function () {
            var formatter = xyla.formatters.multiply(10);
            var formatted = formatter(10);
            expect(formatted).toBe(100);
        });
        it('should concatenate strings', function () {
            var formatter = xyla.formatters.multiply(4);
            var formatted = formatter('hi');
            expect(formatted).toBe('hihihihi');
        });
        it('should handle floating point numbers in the formatter definition', function () {
            var formatter = xyla.formatters.multiply(4.23);
            var formatted = formatter(2);
            expect(formatted).toBe(8.46);
        });
        it('should handle floating point numbers as formatter input', function () {
            var formatter = xyla.formatters.multiply(4);
            var formatted = formatter(2.23);
            expect(formatted).toBe(8.92);
        });
        it('should multiply by 0', function () {
            var formatter = xyla.formatters.multiply(0);
            var formatted = formatter(11);
            expect(formatted).toBe(0);
        });
        it('should multiply by values between 0 and 1', function () {
            var formatter = xyla.formatters.multiply(0.2);
            var formatted = formatter(10);
            expect(formatted).toBe(2);
        });
        it('should multiply by negative numbers', function () {
            var formatter = xyla.formatters.multiply(-5);
            var formatted = formatter(1000);
            expect(formatted).toBe(-5000);
        });
    });
    describe('format', function () {
        it('should substitute values', function () {
            var formatter = xyla.formatters.format('{value} standard feline units');
            var formatted = formatter(16.1);
            expect(formatted).toBe('16.1 standard feline units');
        });
        it('should format substituted values', function () {
            var formatter = xyla.formatters.format('xylophone concert on {value|date}');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('xylophone concert on 2019-02-01');
        });
        it('should format substituted values with parameters', function () {
            var formatter = xyla.formatters.format('xylophone concert on {value|date:%b.%e %Y}');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('xylophone concert on Feb. 1 2019');
        });
        it('should respect quoted literals', function () {
            var formatter = xyla.formatters.format('xylophone concert on "{value|date:%b.%e %Y}"');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('xylophone concert on {value|date:%b.%e %Y}');
        });
        it('should respect quoted targets', function () {
            var formatter = xyla.formatters.format('xylophone concert on {"value"|date:%b.%e %Y}');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('xylophone concert on Feb. 1 2019');
        });
        it('should respect quoted targets', function () {
            var formatter = xyla.formatters.format('xylophone concert on {"concert|date"|date:%b.%e %Y}');
            var formatted = formatter(3, { 'concert|date': new Date(2019, 1, 1) });
            expect(formatted).toBe('xylophone concert on Feb. 1 2019');
        });
        it('should respect quoted parameters', function () {
            var formatter = xyla.formatters.format('xylophone concert on {value|date:%b.%e %Y year of the """Figaro:Maru"""}');
            var formatted = formatter(new Date(2019, 1, 1));
            expect(formatted).toBe('xylophone concert on Feb. 1 2019 year of the "Figaro:Maru"');
        });
        it('should support multiple substitutions', function () {
            var formatter = xyla.formatters.format('{value|number:2} standard feline units will be delivered on {deliveryDate|date:%b.%e %Y}');
            var formatted = formatter(3.919, { 'deliveryDate': new Date(2019, 1, 1) });
            expect(formatted).toBe('3.92 standard feline units will be delivered on Feb. 1 2019');
        });
    });
})();
//# sourceMappingURL=xyla_formatters.spec.js.map