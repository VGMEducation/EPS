(function () {
'use strict';

    angular
	  .module('hrTool.widgets')
	  .factory('hrTool.widgets.dataservice', ['config', '$http', '$q', '$log', 'hrTool.storage', WidgetsDataService]);
    function WidgetsDataService(config, $http, $q, logger, hrToolStorage) {

        var service = {
            getUserData: getUserData,
            setStorageData: setStorageData,
            getLocalUserData: getLocalUserData,
            logoutUser: logoutUser,
            getAdditionalUserData: getAdditionalUserData,
            getSettings: getSettings
        };

        return service;

        // #region Implementation

        function getLocalUserData(){
            try{
                var userInfo = hrToolStorage.getStorage(config.user_info_path);
//                console.log(userInfo);
                return userInfo;
            }
            catch(getLocalUserDataErr){
                logger.error("getLocalUserDataErr: " + getLocalUserDataErr);
            }
        }

        function getSettings(){
            try{
                var settingsDataUrl= config.dataApiUrl + '/settings';
                return $http.get(settingsDataUrl).then(getSettingsComplete).catch(getSettingsFailed);
                    function getSettingsComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
                        hrToolStorage.setStorage('user.settings', response.data.results);
                        return response.data.results;
                    }

                    function getSettingsFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('getSettingsFailed: ' + error);
                        return {};
                    }
            }
            catch(getSettingsErr){
                logger.error("getSettingsErr: " + getSettingsErr);
            }
        }


                var employeeInfoUrl = baseApiUrl + '/employeeInfo';
                $http.get(employeeInfoUrl, {}).then(
                    function successCallback(response) {
//						$log.warn("employeeInfoUrl - success");
//						$log.warn(response);
                        mc.isAdmin = response.data.isAdmin;
                        mc.isCustodian = response.data.isCustodian;
                        mc.isCorporateAdmin = response.data.isCorporateAdmin;
                        mc.isFacilityAdmin = response.data.isFacilityAdmin;
                        userData.isAdmin = mc.isAdmin;
                        userData.isCustodian = mc.isCustodian;
                        userData.isCorporateAdmin = mc.isCorporateAdmin;
                        userData.isFacilityAdmin = mc.isFacilityAdmin;
                        localStorageService.set("user", userData);
                    }, function errorCallback(response) {
                        //$log.error("employeeInfoUrl - error");
                });

        function getAdditionalUserData() {
//            console.log("getAdditionalUserData ");
            try{
				var employeeInfoUrl = config.dataApiUrl + '/employeeInfo';
                return $http.get(employeeInfoUrl, {}).then(getAdditionalUserDataComplete).catch(getAdditionalUserDataFailed);
                    function getAdditionalUserDataComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data.results);
                        var results = response.data.results;
                        var userInfo = hrToolStorage.getStorage('user');
                        userInfo.isAdmin = results.isAdmin;
                        userInfo.isCustodian = results.isCustodian;
                        userInfo.isCorporateAdmin = results.isCorporateAdmin;
                        userInfo.isFacilityAdmin = results.isFacilityAdmin;
                        hrToolStorage.setStorage('user', userInfo);
//                        logger.debug('getAdditionalUserData success. ' + JSON.stringify(response.data));
                        return userInfo;
                    }

                    function getAdditionalUserDataFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('getAdditionalUserData Failed. ' + error);
                        return {};
                    }
            }
            catch(getAdditionalUserDataErr){
                logger.error("getAdditionalUserDataErr: " + getAdditionalUserDataErr);
            }
        }

        function getUserData() {
//            console.log('getUserData');
	        var userInfo = {};
            try{
//                console.log(hrToolStorage.isLoggedIn());
                if (hrToolStorage.isLoggedIn()){
                    userInfo = hrToolStorage.getStorage(config.user_info_path);
//                    console.log(userInfo)
                }
            }
            catch(loginStatusErr){
                logger.error("loginStatusErr: " + loginStatusErr);
            }
            finally{
                return userInfo;
            }
        }

        function setStorageData(storageField, storageValue) {
//            console.log('setStorageData');
            try{
                hrToolStorage.setStorage(storageField, storageValue);
            }
            catch(setStorageDataErr){
                logger.error("setStorageDataErr: " + setStorageDataErr);
            }
            finally{
                return true;
            }
        }


        function logoutUser(){
            hrToolStorage.logoutUser();
        }

        // #endregion
    }
}());