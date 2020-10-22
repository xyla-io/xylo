export function propertyCombinations(properties: string[], records: Record<string, any>[], preserveTypes: boolean = true, missingValue: any = undefined): any[][] {
  const combinations = {};
  records.forEach(record => {
    let propertyCombinations = combinations;
    properties.forEach(property => {
      let rawValue = record[property];
      if (rawValue === undefined) {
        if (missingValue === undefined) { return; }
        rawValue = missingValue;
      }
      const value = preserveTypes ? JSON.stringify(record[property]) : record[property].toString();
      if (!Object.keys(propertyCombinations).includes(value)) {
        propertyCombinations[value] = {};
      }
      propertyCombinations = propertyCombinations[value];
    });
  });
  const output = [];
  function addCombinations(prefix: string[], valueCombinations: Record<string, any>) {
    Object.keys(valueCombinations).forEach(value => {
      const valuePrefix = prefix.concat(preserveTypes ? JSON.parse(value) : value);
      output.push(valuePrefix);
      addCombinations(valuePrefix, valueCombinations[value]);
    });
  }
  addCombinations([], combinations);
  return output;
}