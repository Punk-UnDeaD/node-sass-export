'use strict';
(function (module) {
  const fs = require('graceful-fs');

  module.exports = function (path, name) {
    const exports = {};
    exports[declaration(name)] = implementation(path);
    return exports;
  };

  function toHex(c) {
    const hex = Math.round(c).toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  }

  function get_value(value, options) {
    let output;
    switch (value.constructor.name) {
      case 'SassList':
        output = [];
        for (let i = 0; i < value.getLength(); i++) {
          output.push(get_value(value.getValue(i), options));
        }
        break;
      case 'SassMap':
        output = {};
        for (let i = 0; i < value.getLength(); i++) {
          output[value.getKey(i).getValue()] = get_value(value.getValue(i), options);
        }
        break;
      case 'SassColor':
        if (1 === value.getA()) {
          if (options.hex_color) {
            output = '#' + toHex(value.getR()) + toHex(value.getG()) + toHex(value.getB());
          }
          else {
            output = 'rgb(' + Math.round(value.getR()) + ', ' + Math.round(value.getG()) + ', ' + Math.round(value.getB()) + ')';
          }
        }
        else {
          output = 'rgba(' + Math.round(value.getR()) + ', ' + Math.round(value.getG()) + ', ' + Math.round(value.getB()) + ', ' + value.getA() + ')';
        }
        break;
      case 'SassNumber':
        output = value.getValue();
        if (value.getUnit()) {
          output += value.getUnit();
        }
        break;
      default:
        output = value.getValue();
    }
    return output;
  }

  function implementation(path) {
    return (file, value, options) => {
      const opt = Object.assign({
        prefix: '',
        suffix: '',
        extend: false,
        hex_color: false
      }, get_value(options));
      let output = get_value(value, opt);
      if (opt.extend && 'SassMap' === value.constructor.name) {
        try {
          output = Object.assign({}, JSON.parse(fs.readFileSync(path + '/' + file.getValue())), output);
        }
        catch (e) {
          console.log(e);
        }
      }
      fs.writeFileSync(path + '/' + file.getValue(), opt.prefix + JSON.stringify(output, null, '  ') + opt.suffix);
      return value;
    }
  }

  function declaration(name) {
    return (name || 'export') + '($file, $value, $options:())';
  }
})(module);
