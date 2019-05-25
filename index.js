'use strict';
(function (module) {
  var _ = require('lodash');
  var fs = require('graceful-fs');

  var exporter = module.exports = function (path, name) {
    var out = {};
    out[exporter.interface(name)] = exporter.function(path);
    return out;
  };

  exporter.get_value = function get_value(a) {
    var value, i;
    switch (a.constructor.name) {
      case 'SassList':
        value = [];
        for (i = 0; i < a.getLength(); i++) {
          value.push(get_value(a.getValue(i)));
        }
        break;
      case 'SassMap':
        value = {};
        for (i = 0; i < a.getLength(); i++) {
          value[a.getKey(i).getValue()] = get_value(a.getValue(i));
        }
        break;
      case 'SassColor':
        if (1 === a.getA()) {
          value = 'rgb(' + a.getR() + ', ' + a.getG() + ', ' + a.getB() + ')';
        }
        else {
          value = 'rgba(' + a.getR() + ', ' + a.getG() + ', ' + a.getB() + ', ' + a.getA() + ')';
        }
        break;
      case 'SassNumber':
        value = a.getValue();
        if (a.getUnit()) {
          value += a.getUnit();
        }
        break;
      default:
        value = a.getValue();
    }
    return value;
  };

  exporter.function = function (path) {
    return function (file, value, options) {
      var opt = _.defaults(exporter.get_value(options), {prefix: '', suffix: '', extend: false});
      var output = exporter.get_value(value);
      if (opt.extend && 'SassMap' === value.constructor.name) {
        try {
          _.defaults(output, JSON.parse(fs.readFileSync(path + '/' + file.getValue())));
        }
        catch (e) {
          console.log(e);
        }
      }
      fs.writeFileSync(path + '/' + file.getValue(), opt.prefix + JSON.stringify(output, null, '  ') + opt.suffix);
      return value;
    }
  };

  exporter.interface = function (name) {
    name = name || 'export';
    return name + '($file, $value, $options:())';
  };
})(module);
