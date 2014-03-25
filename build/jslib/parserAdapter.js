/**
 * @license Copyright (c) 2012-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*global define, Reflect */

/*
 * xpcshell has a smaller stack on linux and windows (1MB vs 9MB on mac),
 * so favor the built in Reflect parser:
 * https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
 */
define(['./acorn', 'env'], function (acorn, env) {
    var parse;

    if (env.get() === 'xpconnect' && typeof Reflect !== 'undefined') {
        parse = Reflect.parse;
    } else {
        parse = function () {
            var options = arguments[1] || {};
            var comments = null;

            // Transform options to match Esprima and Reflect options
            if (Object.prototype.hasOwnProperty.call(options, 'loc')) {
                options.locations = options.loc;
                delete options.loc;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'range')) {
                options.ranges = options.range;
                delete options.range;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'comment') &&
                    options.comment) {
                comments = [];
                options.onComment = function (block, text, start, end) {
                    comments.push({
                        type: block ? 'Block' : 'Line',
                        value: text,
                        range: [start, end]
                    });
                };
                delete options.comment;
            }

            var ast = acorn.parse.apply(acorn, arguments);

            if (comments !== null)
                ast.comments = comments;

            return ast;
        };
    }

    return {
        parse: parse
    };
});
