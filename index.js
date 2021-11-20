/*jslint node: true*/
'use strict';

var forwarder = require('beamjs').forwarder;
var backend = require('beamjs').backend();

module.exports = function (options) {

    if (!options) throw new Error('Invalid options');
    if (!Array.isArray(options)) options = [options];
    return options.reduce(function (behaviours, behaviour_options) {

        if (typeof behaviour_options !== 'object')
            throw new Error('Invalid options');
        if (typeof behaviour_options.name !== 'string' ||
            behaviour_options.name.length === 0)
            throw new Error('Invalid behaviour name');
        if (behaviour_options.pass !== undefined &&
            (typeof behaviour_options.pass !== 'string' ||
                behaviour_options.pass.length === 0))
            throw new Error('Invalid behaviour proxy pass');
        if (behaviour_options.passes !== undefined &&
            (!Array.isArray(behaviour_options.passes) ||
                behaviour_options.passes.some(function (pass) {

                    if (typeof pass !== 'object') return false;
                    if (!pass.host) pass.host = pass.pass;
                    return typeof pass.host !== 'string' ||
                        pass.host.length === 0 ||
                        typeof pass.path !== 'string' ||
                        pass.path.length === 0;
                }))) throw new Error('Invalid behaviour proxy passes');
        if (!behaviour_options.pass && !behaviour_options.passes)
            throw new Error('You should provide proxy pass or passes');
        if (behaviour_options.host !== undefined &&
            (typeof behaviour_options.host !== 'string' ||
                behaviour_options.host.length === 0))
            throw new Error('Invalid behaviour host');
        var behaviour = backend.behaviour({

            overwritePath: !behaviour_options.relative,
            skipSameRoutes: true
        });
        behaviours[behaviour_options.name] = behaviour({

            name: behaviour_options.name,
            version: behaviour_options.version || '1',
            path: behaviour_options.path || '/',
            host: behaviour_options.host,
            plugin: forwarder(behaviour_options.pass ||
                behaviour_options.passes, behaviour_options)
        }, function (init) {

            return function () {

                init.apply(this, arguments).self();
            };
        });
        return behaviours;
    }, {});
};