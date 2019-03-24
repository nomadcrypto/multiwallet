var _ = require("lodash");

module.exports.assertEventOld = function(contract, filter) {
    return new Promise((resolve, reject) => {
        var event = contract[filter.event]();
        event.watch();
        event.get((error, logs) => {
            var log = _.filter(logs, filter);
            if (log) {
                event.stopWatching();
                resolve(log);
            } else {
                event.stopWatching();
                throw Error("Failed to find filtered event for " + filter.event);
            }
        });
        event.stopWatching();
    });
}


module.exports.assertEvent = function(result, event, args) {
    let logs = result.logs
    args = (args == undefined)? {} : args

    logs = logs.filter(function(obj) {return obj.event == event});
    if(logs.length == 0) {
        throw Error("Failed to find event " + event);
    }

    log = logs[0]

    keys = Object.keys(args);
    eargs = log.args;
    if(keys.length > 0) {
        keys.forEach(function(key) {
            if(key in eargs) {
                if(args[key] != eargs[key]) {
                    throw Error("Argument is different than expected")
                }
            } else {
                throw Error("Argument " + key + " not found");
            }
        })
    }


}



module.exports.errTypes = {
    revert            : "revert",
    outOfGas          : "out of gas",
    invalidJump       : "invalid JUMP",
    invalidOpcode     : "invalid opcode",
    stackOverflow     : "stack overflow",
    stackUnderflow    : "stack underflow",
    staticStateChange : "static state change"
}

module.exports.tryCatch = async function(p, errType) {
    try {
        await p;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + errType), "Expected an error starting with '" + PREFIX + errType + "' but got '" + error.message + "' instead");
    }
};

const PREFIX = "Returned error: VM Exception while processing transaction: ";

module.exports.cleanBytes32 = function(string) {
    return string.replace(/\u0000/g, '');
}