(function() {
  describe('affix', function() {
    it('should add a prefix', function() {
      let formatter = xyla.formatters.affix('a');
      let formatted = formatter('b');
      expect(formatted).toBe('ab');
    });
    it('should add a suffix', function() {
      let formatter = xyla.formatters.affix(null, 'c');
      let formatted = formatter('b');
      expect(formatted).toBe('bc');
    });
    it('should use a separator', function() {
      let formatter = xyla.formatters.affix('a', 'c', ' ');
      let formatted = formatter('b');
      expect(formatted).toBe('a b c');
    });
    it('should skip empty values', function() {
      let formatter = xyla.formatters.affix('a', 'c', ' ');
      let formatted = formatter('');
      expect(formatted).toBe('');
    });
  });

  describe('empty', function() {
    it('should substitute for empty values', function() {
      let formatter = xyla.formatters.empty('empty');
      let formatted = formatter(null);
      expect(formatted).toBe('empty');
      formatted = formatter(undefined);
      expect(formatted).toBe('empty');
      formatted = formatter('');
      expect(formatted).toBe('empty');
    });
    it('should substitute for no-empty values', function() {
      let formatter = xyla.formatters.empty('nothing', 'something');
      let formatted = formatter(3);
      expect(formatted).toBe('something');
      formatted = formatter(null);
      expect(formatted).toBe('nothing');
    });
    it('should preserve non-empty values by default', function() {
      let formatter = xyla.formatters.empty();
      let formatted = formatter(3);
      expect(formatted).toBe(3);
      formatted = formatter(null);
      expect(formatted).toBe('');
    });
  })

  describe('string', function() {
    it('should return a string', function() {
      let formatter = xyla.formatters.string();
      let formatted = formatter(3);
      expect(formatted).toBe('3');
    });
    it('should skip empty values', function() {
      let formatter = xyla.formatters.string();
      let formatted = formatter('');
      expect(formatted).toBe('');
    });
  });

  describe('date', function() {
    it('should return a formatted date string', function() {
      let formatter = xyla.formatters.date('%Y-%m-%d');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('2019-02-01');
    });
    it('should skip empty values', function() {
      let formatter = xyla.formatters.date('%Y-%m-%d');
      let formatted = formatter('');
      expect(formatted).toBe('');
    });
  });

  describe('number', function() {
    it('should format numeric precision', function() {
      let formatter = xyla.formatters.number(3);
      let formatted = formatter(1.23456);
      expect(formatted).toBe('1.235');
    });
    it('should customize decimals and separators', function() {
      let formatter = xyla.formatters.number(3, ',', '.');
      let formatted = formatter(12345678.9);
      expect(formatted).toBe('12.345.678,900');
    });
    it('should handle string arguments', function() {
      let formatter = xyla.formatters.number('3', ',', '.');
      let formatted = formatter(12345678.9);
      expect(formatted).toBe('12.345.678,900');
    });
    it('should skip empty values', function() {
      let formatter = xyla.formatters.number(3);
      let formatted = formatter('');
      expect(formatted).toBe('');
    });
  });

  describe('dateAdd', function() {
    it('should add days', function() {
      let formatter = xyla.formatters.dateAdd(4);
      let formatted = formatter(new Date(2019, 0, 1).getTime());
      expect(formatted).toBe(new Date(2019, 0, 5).getTime());
    });
    it('should add milliseconds', function() {
      let formatter = xyla.formatters.dateAdd(50, 'milliseconds');
      let formatted = formatter(new Date(2019, 0, 1, 0, 0, 0, 0).getTime());
      expect(formatted).toBe(new Date(2019, 0, 1, 0, 0, 0, 50).getTime());
    });
    it('should subtract days', function() {
      let formatter = xyla.formatters.dateAdd(-20);
      let formatted = formatter(new Date(2019, 0, 21).getTime());
      expect(formatted).toBe(new Date(2019, 0, 1).getTime());
    });
    it('should add seconds', function() {
      let formatter = xyla.formatters.dateAdd(5, 'seconds');
      let formatted = formatter(new Date(2019, 0, 1, 0, 0, 0).getTime());
      expect(formatted).toBe(new Date(2019, 0, 1, 0, 0, 5).getTime());
    });
    it('should add months', function() {
      let formatter = xyla.formatters.dateAdd(5, 'months');
      let formatted = formatter(new Date(2019, 0, 1).getTime());
      expect(formatted).toBe(new Date(2019, 5, 1).getTime());
    });
    it('should subtract months', function() {
      let formatter = xyla.formatters.dateAdd(-5, 'months');
      let formatted = formatter(new Date(2020, 2, 1).getTime());
      expect(formatted).toBe(new Date(2019, 9, 1).getTime());
    });
  });

  describe('dateRange', function() {
    it('should return date ranges in default format', function() {
      let formatter = xyla.formatters.dateRange(4);
      let formatted = formatter(new Date(2019, 0, 1).getTime());
      expect(formatted).toBe('2019-01-01 : 2019-01-05');
    });
    it('should handle negative date ranges', function() {
      let formatter = xyla.formatters.dateRange(-4);
      let formatted = formatter(new Date(2019, 0, 1).getTime());
      expect(formatted).toBe('2019-01-01 : 2018-12-28');
    });
    it('should format date ranges as specified', function() {
      let formatter = xyla.formatters.dateRange(8, 'months', '%m/%d');
      let formatted = formatter(new Date(2019, 1, 2).getTime());
      expect(formatted).toBe('02/02 : 10/02');
    });
    it('should use a custom separator when supplied', function() {
      let formatter = xyla.formatters.dateRange(2, 'weeks', '', ' & ');
      let formatted = formatter(new Date(2019, 1, 1).getTime());
      expect(formatted).toBe('2019-02-01 & 2019-02-15');
    });
  });

  describe('multiply', function() {
    it('should multiply numbers', function() {
      let formatter = xyla.formatters.multiply(10);
      let formatted = formatter(10);
      expect(formatted).toBe(100);
    });
    it('should concatenate strings', function() {
      let formatter = xyla.formatters.multiply(4);
      let formatted = formatter('hi');
      expect(formatted).toBe('hihihihi');
    });
    it('should handle floating point numbers in the formatter definition', function() {
      let formatter = xyla.formatters.multiply(4.23);
      let formatted = formatter(2);
      expect(formatted).toBe(8.46);
    });
    it('should handle floating point numbers as formatter input', function() {
      let formatter = xyla.formatters.multiply(4);
      let formatted = formatter(2.23);
      expect(formatted).toBe(8.92);
    });
    it('should multiply by 0', function() {
      let formatter = xyla.formatters.multiply(0);
      let formatted = formatter(11);
      expect(formatted).toBe(0);
    });
    it('should multiply by values between 0 and 1', function() {
      let formatter = xyla.formatters.multiply(0.2);
      let formatted = formatter(10);
      expect(formatted).toBe(2);
    });
    it('should multiply by negative numbers', function() {
      let formatter = xyla.formatters.multiply(-5);
      let formatted = formatter(1000);
      expect(formatted).toBe(-5000);
    });
  });

  describe('format', function() {
    it('should substitute values', function() {
      let formatter = xyla.formatters.format('{value} standard feline units');
      let formatted = formatter(16.1);
      expect(formatted).toBe('16.1 standard feline units');
    });
    it('should format substituted values', function() {
      let formatter = xyla.formatters.format('xylophone concert on {value|date}');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('xylophone concert on 2019-02-01');
    });
    it('should format substituted values with parameters', function() {
      let formatter = xyla.formatters.format('xylophone concert on {value|date:%b.%e %Y}');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('xylophone concert on Feb. 1 2019');
    });
    it('should respect quoted literals', function() {
      let formatter = xyla.formatters.format('xylophone concert on "{value|date:%b.%e %Y}"');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('xylophone concert on {value|date:%b.%e %Y}');
    });
    it('should respect quoted targets', function() {
      let formatter = xyla.formatters.format('xylophone concert on {"value"|date:%b.%e %Y}');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('xylophone concert on Feb. 1 2019');
    });
    it('should respect quoted targets', function() {
      let formatter = xyla.formatters.format('xylophone concert on {"concert|date"|date:%b.%e %Y}');
      let formatted = formatter(3, {'concert|date': new Date(2019, 1, 1)});
      expect(formatted).toBe('xylophone concert on Feb. 1 2019');
    });
    it('should respect quoted parameters', function() {
      let formatter = xyla.formatters.format('xylophone concert on {value|date:%b.%e %Y year of the """Figaro:Maru"""}');
      let formatted = formatter(new Date(2019, 1, 1));
      expect(formatted).toBe('xylophone concert on Feb. 1 2019 year of the "Figaro:Maru"');
    });
    it('should support multiple substitutions', function() {
      let formatter = xyla.formatters.format('{value|number:2} standard feline units will be delivered on {deliveryDate|date:%b.%e %Y}');
      let formatted = formatter(3.919, {'deliveryDate': new Date(2019, 1, 1)});
      expect(formatted).toBe('3.92 standard feline units will be delivered on Feb. 1 2019');
    });
  });
})();
