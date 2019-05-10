# async-json2csv
A simple json to csv module to support async.

<p align="left">
  <a href="https://npmjs.org/package/async-json2csv">
    <img src="https://img.shields.io/npm/v/async-json2csv.svg?style=flat-square"
         alt="NPM Version">
  </a>

  <a href="https://npmjs.org/package/async-json2csv">
    <img src="http://img.shields.io/npm/dm/async-json2csv.svg?style=flat-square"
         alt="Downloads">
  </a>

  <a href="https://david-dm.org/solee0524/async-json2csv.svg">
    <img src="https://david-dm.org/solee0524/async-json2csv.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="https://github.com/solee0524/async-json2csv/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/async-json2csv.svg?style=flat-square"
         alt="License">
  </a>
</p>

## Usage

```
var json2csv = require('async-json2csv');

var authors = [{
  name: 'solee',
  homepage: 'http://solee.me',
  repo: {
    url: 'https://github.com/solee0524/async-json2csv.git',
    type: 'git'
  },
  keys: ['coo"l', 'lol']
}, {
  name: 'solee_clone',
  homepage: 'http://solee.me',
  repo: {
    url: 'https://github.com/solee0524/async-json2csv.git',
    type: 'git'
  },
  keys: ['clone', 'myth']
}];

var options = {
  data: authors,
  fields: ['name', 'homepage', 'repo.url', 'keys'],
  header: true
}

var csv = await json2csv(options);
```

`data` and `fields` in `options` must be **Array**

## Change

### v1.0.2

Fix comma stuff.

### v1.0.1

Add `header` option to decide whether to add fields to header or not.

## License
MIT © Bo Li ([solee.me](http://solee.me))