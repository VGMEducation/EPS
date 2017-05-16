//console.log("hrTool interceptors");
'use strict';

try {

    angular.module('hrTool')
    .factory('authHttpInterceptor',['$q','$location','hrTool.events',  'hrTool.storage', '$log', function($q,$location, hrEvents, hrStorage, logger){
        return {
        	request: function(config) {
                try{
//                    console.log("requested something - authHttpInterceptor");
//                        console.log(config);
//                        console.log(config.url);
                    if (config.url.search('/api')>=0){
//                        console.log("apiRequest")
                        hrEvents.showSpinner(true);
                        try{
                            var profileInfo = {};
//                            console.log('user')
                            var jwtToken = 'jwtToken';
                            //console.log(hrStorage.isLoggedIn());
                            if (hrStorage.isLoggedIn()){
                                profileInfo = hrStorage.getStorage('user');
//                                console.log(profileInfo)
//                                console.log(config)
                                config.headers.token = profileInfo.jwt;
                                config.headers.uid = profileInfo.uid;
                                // call dg storage and check last modified
//                                var hrLastModified = hrStorage.getLastModifiedDate(config.url);
////                                console.log(dgLastModified);
////                                console.log(config.headers);
//                                if (dgLastModified){
////                                    console.log("This is a reoccurring request and has a last modified.");
//                                    config.headers.dg_last_modified = dgLastModified;
//                                }
                            }
                            else{
                                config.headers.token = "unknown";
                                config.headers.uid = "unknown";
                            }
                        }catch(authHttpResponseInterceptorErr){
                            logger.error("authHttpInterceptorErr: " + authHttpResponseInterceptorErr);
                            config.headers.token = "unknown";
                            config.headers.uid = "unknown";
                        }
                    }
    				return config;
    		  	}
    		  	catch (interceptorRequestException){
    		  		console.log("interceptorRequestException " + interceptorRequestException)
                    hrEvents.showSpinner(false);
    		  		return config;
    		  	}
    		},
            response: function(response){
//            	console.log("Interceptor Response");
//            	console.log(response);
                hrEvents.showSpinner(false);
                return response || $q.when(response);
            },
            responseError: function(rejection) {
            	console.log("Interceptor responseError: " + JSON.stringify(rejection.data));
                var msgTxt = rejection.data.error;
                hrEvents.broadcastAlert( {type: "danger", msg: msgTxt});
                hrEvents.showSpinner(false);
                return $q.reject(rejection);
            }
        }
    }])

    .config(['$httpProvider',function($httpProvider) {

        //Http Interceptor to transform file request
        //$httpProvider.interceptors.push('authHttpInterceptor');

        //Http Interceptor to check auth failures for xhr requests
        $httpProvider.interceptors.push('authHttpInterceptor');
    }]);

    // Capture All Exception and Act on Them

    angular
        .module('hrTool')
        .config(exceptionConfig);

    exceptionConfig.$inject = ['$provide'];

    function exceptionConfig($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
    }

    extendExceptionHandler.$inject = ['$delegate', '$log', 'hrTool.exceptions'];

    function extendExceptionHandler($delegate, logger, dgExceptions) {
        return function(exception, cause) {
            //console.log(exception);
            //console.log(cause);
            //console.log($delegate());
            //$delegate(exception, cause);
            var errorData = {
                exception: exception,
                cause: cause
            };
//            logger.warn("Global Exception Triggered: "  +  JSON.stringify(errorData));
//            console.log(exception)
//            console.log(cause)
            logger.error(exception);
            logger.warn("Global Exception Triggered: "  +  exception);
        };
    }

}
catch (hrToolInterceptorsException){
    console.log("hrToolInterceptorsException " + hrToolInterceptorsException);
}
