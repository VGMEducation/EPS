(function () {
'use strict';

    angular
	  .module('hrTool.info')
	  .factory('hrTool.info.dataservice', ['config', '$http', '$q', '$log', InfoDataService]);

    function InfoDataService(config, $http, $q, logger) {

//        console.log("hrTool.dataservice invoked")
        var service = {
            getHomeData: getHomeData,
            saveHomeData: saveHomeData
        };

        return service;

        // #region Implementation

//        function clearSession() {
//            session.set('home.create', null);
//        }

//        function setStoredQuoteInfo(data) {
//            clearSession();
//            return session.set('home.create', data);
//        }
//
//        function getStoredQuoteInfo() {
//            return session.get('home.create');
//        }


        function getHomeData() {
            //return $http.get(config.apiUrl + '/home');
//            console.log("getHomeData- ds");
            return {data: "getHome"};
        }
        function saveHomeData() {
            //return $http.post(config.apiUrl + '/home');
            console.log("saveHomeData");
            return {data: "saveHomeData"};
        }

//        function getEffectiveDates() {
//            return $http.get(config.apiUrl + 'broker/quote-details/employee-effective-date');
//        }
//        function postCensusFile() {
//            return $http.post(config.apiUrl + 'broker/quote-details/census/file');
//        }
//        function getAvailableStates() {
//            var deferred = $q.defer();
//
//            deferred.resolve(["MA"]);
//            return deferred.promise;
//        }

        // #endregion
    }
}());