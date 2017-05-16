(function () {
'use strict';

    angular
	  .module('hrTool.home')
	  .factory('hrTool.home.dataservice', ['config', '$http', '$q', '$log', 'hrTool.storage', HomeDataService]);

    function HomeDataService(config, $http, $q, logger, hrToolStorage) {

        var service = {
            getHomeData: getHomeData,
            createReview: createReview
        };

        return service;

        // #region Implementation

        function createReview(reviewData){
            try{
//                var review_data = hrToolStorage.setStorage(config.review_info_path, reviewData);
                hrToolStorage.setStorage(config.review_info_path, reviewData);
            }
            catch(createReviewErr){
              logger.error("createReviewErr: " + createReviewErr);
            }
        }

        function getHomeData() {
            try{
                var getEmployeeInfoUrl = config.dataApiUrl + '/employeeInfo';
                return $http.get(getEmployeeInfoUrl).then(getHomeDataComplete).catch(getHomeDataFailed);
                    function getHomeDataComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
                        var results = response.data.results;
//                        console.log(results.myReviews);
//                        console.log(results.myEmployees);
//                        hrToolStorage.updateUserStorage("myReviews", results.myReviews);
//                        hrToolStorage.updateUserStorage("myEmployees", results.myEmployees);
//                        hrToolStorage.updateUserStorage("performanceHeaderText", results.performanceHeaderText);
                        return {myReviews: results.myReviews, myEmployees: results.myEmployees, performanceHeaderText: results.performanceHeaderText};
                    }

                    function getHomeDataFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('getHomeDataFailed: ' + error);
                        return {};
                    }
            }
            catch(getHomeDataErr){
                logger.error("getHomeDataErr: " + getHomeDataErr);
            }
        }

        // #endregion
    }
}());