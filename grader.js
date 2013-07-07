#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches command line application development
 and basic DOM parsing.

 References:

 + cheerio
 - https://github.com/MatthewMueller/cheerio
 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 - http://maxogden.com/scraping-with-node.html

 + commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs'),
    program = require('commander'),
    cheerio = require('cheerio'),
    rest = require('restler'),
    sys = require('util');

var HTMLFILE_DEFAULT = "index.html",
    CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlmFile = function (htmlfile) {
    return cheerio.load(htmlfile);
};

var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (htmlfile, checksfile) {
    var $ = cheerioHtmlmFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function (fn) {
    // workaround for commander.js issue.
    //http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var checkContentAndPrint = function(content) {
    checkJson = checkHtmlFile(content, program.checks);
    outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to index.html')
        .parse(process.argv);

    var checkJson, outJson, content;
    if (program.url) {
        rest.get(program.url).on('complete', function (result) {
            if (result instanceof Error) {
                console.log("%s cannot be found.", program.url);
                process.exit(1);
            } else {
                checkContentAndPrint(result);
            }
        });
    } else {
        content = fs.readFileSync(program.file);
        checkContentAndPrint(content);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
