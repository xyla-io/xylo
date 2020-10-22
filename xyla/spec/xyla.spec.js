(function() {
  let dataSetsFixture = {
    add: function() {
      window.datasets = [
        {
          queryName: 'test_data_set',
          content: [
            {n1: 1, n2: 2, n3: 3, s1: 'a', s2: 'b', s3: 'c'},
            {n1: 4, n2: 5, n3: 6, s1: 'a', s2: 'b', s3: 'd'},
            {n1: 7, n2: 8, n3: 9, s1: 'a', s2: 'e', s3: 'f'},
          ],
        },
      ];
    },
    remove: function(id) {
      delete window.datasets;
    },
  }
  
  describe('xyla', function() {  
    beforeEach(function() {
      dataSetsFixture.add();
    });
  
    afterEach(function() {
      dataSetsFixture.remove();
    });
  
    it('should exist', function() {
      expect(xyla !== undefined);
    });
  
    it('should retrieve data sets', function() {
      expect(xyla.bi.mode.dataSet('test_data_set')).toBeDefined();
      expect(() => xyla.bi.mode.dataSet('non_existant_data_set')).toThrow();
    });
  
    it('should group rows in data sets', function() {
      let groups = xyla.bi.mode.groupedRows(xyla.bi.mode.dataSet('test_data_set'), ['s1', 's2']);
      expect(Object.keys(groups).length).toBe(2);
      expect(groups['["a","b"]'].length).toBe(2);
      expect(groups['["a","e"]'].length).toBe(1);
    });
  });
})();