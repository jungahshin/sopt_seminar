'use strict';

/**
 * Created by solee on 2018/3/22.
 */

'use strict';

module.exports = async function (options) {
  var data = options.data || [];
  var fields = options.fields || [];
  var delimiter = options.delimiter || ',';

  if (fields.length === 0) {
    return 'Need Fields!';
  }

  if (!Array.isArray(data) || !Array.isArray(fields)) {
    return 'Data and Fields should be array!';
  }

  var csv = '';

  if (!!options.header) {
    csv += fields.join(delimiter) + '\n';
  }

  for (let item of data) {
    var tmpRow = [];
    for (let field of fields) {
      var tmpField = field.split('.');
      var tmpValue = '';
      if (tmpField.length === 1) {
        tmpValue = item[field] === undefined || item[field] === null
          ? ''
          : item[field];
      } else {
        tmpValue = item;
        var n = 0;
        while (n < tmpField.length) {
          tmpValue = tmpValue[tmpField[n]] === undefined || tmpValue[tmpField[n]] === null
            ? ''
            : tmpValue[tmpField[n]];
          if (!tmpValue) {
            break;
          }
          n++;
        }
      }

      if (typeof tmpValue === 'string' && tmpValue.includes('"')) {
        tmpValue = String(tmpValue).replace(/"/g, '""');
      }

      if (typeof tmpValue === 'string' && tmpValue.includes(',')) {
        tmpValue = `"${tmpValue}"`;
      }

      if (Array.isArray(tmpValue)) {
        tmpValue = '"' + String(tmpValue).replace(/"/g, '""') + '"';
      }

      tmpRow.push(tmpValue);
    }
    csv += tmpRow.join(delimiter) + '\n';
  }

  return csv;
};
