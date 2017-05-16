(function () {
'use strict';

    angular
	  .module('hrTool.review')
	  .factory('hrTool.review.dataservice', ['config', '$http', '$q', '$log', 'hrTool.storage', ReviewDataService]);

    function ReviewDataService(config, $http, $q, logger, hrToolStorage) {

        var service = {
            getReviewData: getReviewData,
            updateReviewData: updateReviewData,
            loadReviewData: loadReviewData,
            saveReviewData: saveReviewData,
            hardResetReview: hardResetReview
        };

        return service;

        // #region Implementation

        function getReviewData() {
            try{
                var review_data = hrToolStorage.getStorage(config.review_info_path);
                return review_data;
            }
            catch(getReviewDataErr){
                logger.error("getEmployeesErr: " + getReviewDataErr);
                return {};
            }
        }

        function updateReviewData(newReviewData) {
            try{
                hrToolStorage.setStorage(config.review_info_path, newReviewData);
                return true;
            }
            catch(updateReviewDataErr){
                logger.error("updateReviewDataErr: " + updateReviewDataErr);
                return {};
            }
        }

        function loadReviewData(loadReviewDataPayload){
            try{
                var loadReviewDataUrl= config.dataApiUrl + '/review';
//                console.log(loadReviewDataPayload)
                return $http.post(loadReviewDataUrl, loadReviewDataPayload).then(loadReviewDataComplete).catch(loadReviewDataFailed);
                    function loadReviewDataComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
//                        hrToolStorage.setStorage('user.settings', response.data.results);
                        return response.data.results;
                    }

                    function loadReviewDataFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('loadReviewDataFailed: ' + error);
                        return {};
                    }
            }
            catch(loadReviewDataErr){
                logger.error("loadReviewDataErr: " + loadReviewDataErr);
            }
        }

        function saveReviewData(saveReviewDataPayload) {
            try{
                var saveReviewDataUrl= config.dataApiUrl + '/reviews/save';
                return $http.post(saveReviewDataUrl, saveReviewDataPayload).then(saveReviewDataComplete).catch(saveReviewDataFailed);
                    function saveReviewDataComplete(response) {
                        return response.data.results;
                    }

                    function saveReviewDataFailed(error) {
                        logger.error('saveReviewDataFailed: ' + error);
                        return {};
                    }
            }
            catch(saveReviewDataErr){
                logger.error("saveReviewDataErr: " + saveReviewDataErr);
                return {};
            }
        }

        function hardResetReview(currentReview){
            try{
                var hardResetReviewPayload = {};
                hardResetReviewPayload.reviewId = currentReview._id;
                hardResetReviewPayload.reviewEmployeeId = currentReview.reviewEmployeeId;
//                console.log(currentReview);
//                hardResetReviewPayload.roleId = currentReview.roleId;

                var hardResetReviewDataUrl= config.dataApiUrl + '/reviews/reset';
                return $http.post(hardResetReviewDataUrl, hardResetReviewPayload).then(hardResetReviewComplete).catch(hardResetReviewFailed);
                    function hardResetReviewComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
//                        hrToolStorage.setStorage('user.settings', response.data.results);
                        return response.data.results;
                    }

                    function hardResetReviewFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('hardResetReviewFailed: ' + error);
                        return {};
                    }
            }
            catch(hardResetReviewErr){
                logger.error("hardResetReviewErr: " + hardResetReviewErr);
            }
        }

        // #endregion
    }
}());