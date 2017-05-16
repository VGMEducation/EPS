(function () {
'use strict';

    angular
	  .module('hrTool.reset')
	  .factory('hrTool.reset.dataservice', ['config', '$http', '$q', '$log', 'hrTool.storage', 'hrTool.exceptions', ResetDataService]);;

    function ResetDataService(config, $http, $q, logger, hrToolStorage, hrToolExceptions) {

        var service = {
            resetUserPassword: resetUserPassword,
            verityResetToken: verityResetToken
        };

        return service;

        // #region Implementation

        function resetUserPassword(currentSPToken, passwordReset) {
            var submitNewPasswordPayload = { sptoken: currentSPToken, password: passwordReset};
            var submitNewPasswordUrl = config.authApiUrl + '/reset';
            return $http.post(submitNewPasswordUrl, submitNewPasswordPayload).then(
                function successCallback(response) {
//                    console.log("successCallback ");
//                    console.log(response);
                    return true;
                }, function errorCallback(response) {
//                    console.log("errorCallback ");
//                    console.log(response);
                    return false;
            });
        }

        function verityResetToken(currentSPToken) {
            var verifyTokenUrl = config.authApiUrl + '/resetVerify';
//            console.log(verifyTokenUrl)
            var verifyTokenPayload = {
                sptoken: currentSPToken
            };
            return $http.post(verifyTokenUrl, verifyTokenPayload).then(
                function successCallback(response) {
//                    console.log("successCallback ");
//                    console.log(response);\
                    return true;
                }, function errorCallback(response) {
//                    console.log("errorCallback ");
//                    console.log(response);
                    return false;
            });
        }

        // #endregion
    }
}());