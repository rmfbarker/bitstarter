var restler = require('restler');

var result = restler.get('http://murmuring-harbor-4203.herokuapp.com/');

console.log(result);