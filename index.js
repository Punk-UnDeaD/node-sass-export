'use strict';
(function (module) {
  var _ = require('lodash');
  var fs = require('graceful-fs');

  var exporter = module.exports = function (path, name) {
    var out = {};
    out[exporter.interface(name)] = exporter.function(path);
    return out;
  };

  function toHex(c) {
    var hex = Math.round(c).toString(16).toUpperCase();
    return hex.length == 1 ? "0" + hex : hex;
  };

  exporter.get_value = function get_value(a, opt) {
    var value, i;
    switch (a.constructor.name) {
      case 'SassList':
        value = [];
        for (i = 0; i < a.getLength(); i++) {
          value.push(get_value(a.getValue(i), opt));
        }
        break;
      case 'SassMap':
        value = {};
        for (i = 0; i < a.getLength(); i++) {
          value[a.getKey(i).getValue()] = get_value(a.getValue(i), opt);
        }
        break;
      case 'SassColor':
        if (1 === a.getA()) {
          if (opt.hex_color) {
            value = '#' + toHex(a.getR()) + toHex(a.getG()) + toHex(a.getB());
          }
          else {
            value = 'rgb(' + Math.round(a.getR()) + ', ' + Math.round(a.getG()) + ', ' + Math.round(a.getB()) + ')';
          }
        }
        else {
          value = 'rgba(' + Math.round(a.getR()) + ', ' + Math.round(a.getG()) + ', ' + Math.round(a.getB()) + ', ' + a.getA() + ')';
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
      var opt = _.defaults(exporter.get_value(options), {
        prefix: '',
        suffix: '',
        extend: false,
        hex_color: false
      });
      var output = exporter.get_value(value, opt);
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
