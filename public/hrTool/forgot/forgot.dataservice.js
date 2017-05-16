(function () {
'use strict';

    angular
	  .module('hrTool.forgot')
	  .factory('hrTool.forgot.dataservice', ['config', '$http', '$q', '$log', ForgotDataService]);

    function ForgotDataService(config, $http, $q, logger) {
        var service = {
            forgotPassword: forgotPassword
        };

        return service;

        // #region Implementation

        function forgotPassword(forgotPasswordPayload) {
            try{
                var forgotPasswordUrl = config.authApiUrl + '/forgot';
                return $http.post(forgotPasswordUrl, forgotPasswordPayload).then(forgotPasswordComplete).catch(forgotPasswordFailed);
                    function forgotPasswordComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
                        return response.data;
                    }
                    function forgotPasswordFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('forgotPasswordFailed: ' + error);
                        return {};
                    }
            }
            catch(getSettingsErr){
                logger.error("getSettingsErr: " + getSettingsErr);
            }
        }

        // #endregion
    }
}());