# node-sass-export

**node-sass-export** provide export function for use with Node-sass [function option](https://github.com/sass/node-sass#functions--v300---experimental).

## Usage

```
var export_sass = require('node-sass-export');
sass.renderSync({
  // ...
  functions: export_sass('export_path')
});
```
```
$breakpoints: export('lib/breakpoints.json', $breakpoints);
```
$breakpoints has been exported to export_path/lib/breakpoints.json
```
{
  "small": 960,
  "mini": 768,
  "micro": 720,
  "wide": 1230
}
```

### Usage with Gulp
```
gulp.src('theme_path/sass/*.scss')
    .pipe(sass({
      functions: export_sass('export_path')
    }))
```

### Options:

#### Another export function name
```
{ functions: export_sass('export_path', 'antiexport') }
```
```
$breakpoints: antiexport('lib/breakpoints.json', $breakpoints);
```

#### Extend json (not rewrite)
```
$breakpoints: export('lib/breakpoints.json', $breakpoints, (extend:true));
$breakpoints: export('lib/breakpoints.json', $other_breakpoints, (extend:true));
```

#### Export to js file
```
$breakpoints: export('lib/breakpoints.js', $breakpoints, (prefix:'var breakpoints = ', suffix:';'));
```

#### Usage with another functions
```
{ functions: _.extend(export_sass('export_path'), {'foobar()': function(){}}) }
```

#### Export hex colors
```
$colors: export('lib/colors.json', $colors, (hex_color: true));
```
