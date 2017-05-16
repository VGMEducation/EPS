(function () {
'use strict';

    angular
	  .module('hrTool.login')
	  .factory('hrTool.login.dataservice', ['config', '$http', '$q', '$log', 'hrTool.storage', LoginDataService]);

    function LoginDataService(config, $http, $q, logger, hrToolStorage) {

        var service = {
            loginUser: loginUser
        };

        return service;

        // #region Implementation

        function loginUser(loginUserInfo){
            try{
                var loginUserUrl= config.authApiUrl + '/login';
                return $http.post(loginUserUrl, loginUserInfo).then(loginUserComplete).catch(loginUserFailed);
                    function loginUserComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
                        var results = response.data.results;
                        var lstKey = "jwt";
                        var lstVal = results.jwt;
                        hrToolStorage.setStorage(lstKey, lstVal);
                        hrToolStorage.setStorage("user", results);
//                        return results;
                        return true;
                    }
                    function loginUserFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('loginUserFailed: ' + error);
                        return {};
                    }
            }
            catch(loginUserErr){
                logger.error("loginUserErr: " + loginUserErr);
            }
        }
        // #endregion
    }
}());