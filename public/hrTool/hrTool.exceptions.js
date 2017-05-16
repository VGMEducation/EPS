//console.log("hrTool exceptions");
'use strict';

try {
    angular.module('hrTool').factory('hrTool.exceptions', exceptions);
    exceptions.$inject = ['$log']

    //TODO: Pull in default meessages from config.
    //TODO: Write logs to external service/file/etc.

    function exceptions(logger) {
//        console.log("hrTool exceptions init");
        var service = {
            catcher: catcher
        };
        return service;

        function catcher(message) {
            logger.debug("hrTool Exceptions Service w/ msg: " + message);
            return function(reason) {
                logger.debug("hrTool Exceptions Service w/ reason: " + reason);
                //logger.debug(message, reason);
                //logger.debug("global error reason");
                logger.error(message, reason);
                var reason =  "";
                if ("thirdPartyServiceError" == message){
                    reason = "We were unable to connect with external service.";
                }
                //logger.error(exception);
                logger.debug("hrTool Exceptions Service w/ reason: " + reason);
            };
        }
    }
}
catch (hrToolExceptionsEx){
    console.log("hrToolExceptionsEx " + hrToolExceptionsEx);
}