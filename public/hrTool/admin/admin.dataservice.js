(function () {
'use strict';

    angular
	  .module('hrTool.admin')
	  .factory('hrTool.admin.dataservice', ['config', '$http', '$q', '$log', AdminDataService]);

    function AdminDataService(config, $http, $q, logger) {

        var service = {
            getRoles: getRoles,
            newRole: newRole,
            saveRole: saveRole,
            deleteRole: deleteRole,
            getReviews: getReviews,
            newReviewQuestion: newReviewQuestion,
            saveReviewQuestion: saveReviewQuestion,
            getEmployees: getEmployees,
            getAnEmployeesReviews: getAnEmployeesReviews,
            getReports: getReports,
            getLocations: getLocations,
            newLocation: newLocation,
            updateLocation: updateLocation,
            getRules: getRules,
            getAdminAccounts: getAdminAccounts,
            updateAdminAccounts: updateAdminAccounts,
            updateRules: updateRules,
            getHrReps: getHrReps,
            getSupervisors: getSupervisors,
            newEmployee: newEmployee,
            updateEmployee: updateEmployee,
            resetEmployeePassword: resetEmployeePassword
        };

        return service;

        // #region Implementation

        function getHrReps() {
            try{
                var hrRepsDataUrl= config.dataApiUrl + '/hrReps';
                return $http.get(hrRepsDataUrl).then(getHrRepsComplete).catch(getHrRepsFailed);
                    function getHrRepsComplete(response) {
                        return response.data.results;
                    }

                    function getHrRepsFailed(error) {
                        logger.error('getHrRepsFailed: ' + error);
                        return {};
                    }
            }
            catch(getHrRepsErr){
                logger.error("getHrRepsErr: " + getHrRepsErr);
            }
        }

        function getSupervisors() {
            try{
                var supervisorsDataUrl= config.dataApiUrl + '/supervisors';
                return $http.get(supervisorsDataUrl).then(getSupervisorsComplete).catch(getSupervisorsFailed);
                    function getSupervisorsComplete(response) {
                        return response.data.results;
                    }

                    function getSupervisorsFailed(error) {
                        logger.error('getSupervisorsFailed: ' + error);
                        return {};
                    }
            }
            catch(getSupervisorsErr){
                logger.error("getSupervisorsErr: " + getSupervisorsErr);
            }
        }

        function getRoles() {
            try{
                var getRolesUrl= config.dataApiUrl + '/roles';
                return $http.get(getRolesUrl).then(getRolesComplete).catch(getRolesFailed);
                    function getRolesComplete(response) {
//                        console.log("success cb");
//                        console.log(response.data);
//                        hrToolStorage.setStorage('user.settings', response.data.results);
                        return response.data.results;
                    }

                    function getRolesFailed(error) {
//                        console.log("error cb");
//                        console.log(error);
                        logger.error('getRolesFailed: ' + error);
                        return {};
                    }
            }
            catch(getRolesErr){
                logger.error("getRolesErr: " + getRolesErr);
            }
        }

        function newRole(newRolePayload) {
            try{
                var newRoleUrl= config.dataApiUrl + '/roles/new';
                return $http.post(newRoleUrl, newRolePayload).then(newRoleComplete).catch(newRoleFailed);
                    function newRoleComplete(response) {
                        return response.data.results;
                    }

                    function newRoleFailed(error) {
                        logger.error('newRoleFailed: ' + error);
                        return {};
                    }
            }
            catch(newRoleErr){
                logger.error("newRoleErr: " + newRoleErr);
            }
        }

        function saveRole(saveRolePayload) {
            try{
                var saveRoleUrl= config.dataApiUrl + '/roles/save';
                return $http.post(saveRoleUrl, saveRolePayload).then(saveRoleComplete).catch(saveRoleFailed);
                    function saveRoleComplete(response) {
                        return response.data.results;
                    }

                    function saveRoleFailed(error) {
                        logger.error('saveRoleFailed: ' + error);
                        return {};
                    }
            }
            catch(saveRoleErr){
                logger.error("saveRoleErr: " + saveRoleErr);
            }
        }

        function deleteRole(deleteRolePayload) {
            try{
                var deleteRoleUrl = config.dataApiUrl + '/roles/delete/' + deleteRolePayload._id;
//                return $http.delete(deleteRoleUrl, deleteRolePayload).then(deleteRoleComplete).catch(deleteRoleFailed);
                return $http.delete(deleteRoleUrl).then(deleteRoleComplete).catch(deleteRoleFailed);
                    function deleteRoleComplete(response) {
                        return response.data.results;
                    }

                    function deleteRoleFailed(error) {
                        logger.error('deleteRoleFailed: ' + error);
                        return false;
                    }
            }
            catch(deleteRoleErr){
                logger.error("deleteRoleErr: " + deleteRoleErr);
            }
        }

        function newReviewQuestion(newReviewQuestionPayload) {
            try{
                var newReviewQuestionUrl= config.dataApiUrl + '/questions/new';
                return $http.post(newReviewQuestionUrl, newReviewQuestionPayload).then(newReviewQuestionComplete).catch(newReviewQuestionFailed);
                    function newReviewQuestionComplete(response) {
                        return response.data.results;
                    }

                    function newReviewQuestionFailed(error) {
                        logger.error('newReviewQuestionFailed: ' + error);
                        return {};
                    }
            }
            catch(newReviewQuestionErr){
                logger.error("newReviewQuestionErr: " + newReviewQuestionErr);
            }
        }

        function saveReviewQuestion(saveReviewQuestionPayload) {
            try{
                var saveReviewQuestionUrl= config.dataApiUrl + '/questions/save';
                return $http.post(saveReviewQuestionUrl, saveReviewQuestionPayload).then(saveReviewQuestionComplete).catch(saveReviewQuestionFailed);
                    function saveReviewQuestionComplete(response) {
                        return response.data.results;
                    }

                    function saveReviewQuestionFailed(error) {
                        logger.error('saveReviewQuestionFailed: ' + error);
                        return {};
                    }
            }
            catch(saveReviewQuestionErr){
                logger.error("saveReviewQuestionErr: " + saveReviewQuestionErr);
            }
        }

        //TODO: Remove Unused/no
        function getReviews() {
            try{
                console.log('loadReview');
                var getReviewsUrl= config.dataApiUrl + '/reviews';
                return $http.get(getReviewsUrl).then(getReviewsComplete).catch(getReviewsFailed);
                    function getReviewsComplete(response) {
                        console.log('loadReview');
                        return response.data.results;
                    }

                    function getReviewsFailed(error) {
                        logger.error('getReviewsFailed: ' + error);
                        return {};
                    }
            }
            catch(getReviewsErr){
                logger.error("getReviewsErr: " + getReviewsErr);
            }
        }

        function getAnEmployeesReviews(employeeInfoId) {
            try{
                var getAnEmployeesReviewsUrl = config.dataApiUrl + '/employeeReviews/' + employeeInfoId;
                return $http.get(getAnEmployeesReviewsUrl).then(getReviewsComplete).catch(getReviewsFailed);
                    function getReviewsComplete(response) {
                        return response.data.results;
                    }

                    function getReviewsFailed(error) {
                        logger.error('getReviewsFailed: ' + error);
                        return {};
                    }
            }
            catch(getAnEmployeesReviewsErr){
                logger.error("getAnEmployeesReviewsErr: " + getAnEmployeesReviewsErr);
            }
        }

        function getEmployees() {
            try{
                var getEmployeesUrl= config.dataApiUrl + '/employees';
                return $http.get(getEmployeesUrl).then(getEmployeesComplete).catch(getEmployeesFailed);
                    function getEmployeesComplete(response) {
                        return response.data.results;
                    }

                    function getEmployeesFailed(error) {
                        logger.error('getEmployeesFailed: ' + error);
                        return false;
                    }
            }
            catch(getEmployeesErr){
                logger.error("getEmployeesErr: " + getEmployeesErr);
            }
        }

        function getReports() {
            try{
                var getReportsUrl= config.dataApiUrl + '/reports';
                return $http.get(getReportsUrl).then(getReportsComplete).catch(getReportsFailed);
                    function getReportsComplete(response) {
                        return response.data.results;
                    }

                    function getReportsFailed(error) {
                        logger.error('getReportsFailed: ' + error);
                        return {};
                    }
            }
            catch(getReportsErr){
                logger.error("getReportsErr: " + getReportsErr);
            }
        }

        function getReportsIndividually(locationName){
            try{
                var getReportsIndividuallyUrl= config.dataApiUrl + '/reports/byLocation';
                return $http.get(getReportsIndividuallyUrl, {name: locationName}).then(getReportsIndividuallyComplete).catch(getReportsIndividuallyFailed);
                    function getReportsIndividuallyComplete(response) {
                        return response.data.results;
                    }

                    function getReportsIndividuallyFailed(error) {
                        logger.error('getReportsIndividuallyFailed: ' + error);
                        return {};
                    }
            }
            catch(getReportsIndividuallyErr){
                logger.error("getReportsIndividuallyErr: " + getReportsIndividuallyErr);
            }
        };


        function getLocations() {
            try{
                var getLocationsUrl= config.dataApiUrl + '/locations';
                return $http.get(getLocationsUrl).then(getLocationsComplete).catch(getLocationsFailed);
                    function getLocationsComplete(response) {
                        return response.data.results;
                    }

                    function getLocationsFailed(error) {
                        logger.error('getLocationsFailed: ' + error);
                        return {};
                    }
            }
            catch(getLocationsErr){
                logger.error("getLocationsErr: " + getLocationsErr);
            }
        }

        function newLocation(newLocationPayload) {
            try{
                var newLocationUrl= config.dataApiUrl + '/locations/new';
                return $http.post(newLocationUrl, newLocationPayload).then(newLocationComplete).catch(newLocationFailed);
                    function newLocationComplete(response) {
                        return response.data.results;
                    }

                    function newLocationFailed(error) {
                        logger.error('newLocationFailed: ' + error);
                        return {};
                    }
            }
            catch(newLocationErr){
                logger.error("newLocationErr: " + newLocationErr);
            }
        }

        function updateLocation(updateLocationPayload) {
            try{
                var updateLocationUrl= config.dataApiUrl + '/locations/save';
                return $http.post(updateLocationUrl, updateLocationPayload).then(updateLocationComplete).catch(updateLocationFailed);
                    function updateLocationComplete(response) {
                        return response.data.results;
                    }

                    function updateLocationFailed(error) {
                        logger.error('updateLocationFailed: ' + error);
                        return {};
                    }
            }
            catch(updateLocationErr){
                logger.error("updateLocationErr: " + updateLocationErr);
            }
        }

        function getRules() {
            try{
                var getRulesUrl= config.dataApiUrl + '/settings';
                return $http.get(getRulesUrl).then(getRulesComplete).catch(getRulesFailed);
                    function getRulesComplete(response) {
                        return response.data.results;
                    }

                    function getRulesFailed(error) {
                        logger.error('getRulesFailed: ' + error);
                        return {};
                    }
            }
            catch(getRulesErr){
                logger.error("getRulesErr: " + getRulesErr);
            }
        }

        function getAdminAccounts() {
            try{
                var getAdminAccountsUrl= config.dataApiUrl + '/adminAccounts';
                return $http.get(getAdminAccountsUrl).then(getAdminAccountsComplete).catch(getAdminAccountsFailed);
                    function getAdminAccountsComplete(response) {
                        return response.data.results;
                    }

                    function getAdminAccountsFailed(error) {
                        logger.error('getAdminAccountsFailed: ' + error);
                        return {};
                    }
            }
            catch(getAdminAccountsErr){
                logger.error("getAdminAccountsErr: " + getAdminAccountsErr);
            }
        }

        function updateAdminAccounts(updateAdminAccountsPayload) {
            try{
                var updateAdminAccountsUrl= config.dataApiUrl + '/adminAccounts/save';
                return $http.post(updateAdminAccountsUrl, updateAdminAccountsPayload).then(updateAdminAccountsComplete).catch(updateAdminAccountsFailed);
                    function updateAdminAccountsComplete(response) {
                        return response.data.results;
                    }

                    function updateAdminAccountsFailed(error) {
                        logger.error('updateAdminAccountsFailed: ' + error);
                        return {};
                    }
            }
            catch(updateAdminAccountsErr){
                logger.error("updateAdminAccountsErr: " + updateAdminAccountsErr);
            }
        }


        function updateRules(newRulesPayload) {
            try{
                var updateRulesUrl= config.dataApiUrl + '/settings/save';
                return $http.post(updateRulesUrl, newRulesPayload).then(updateRulesComplete).catch(updateRulesFailed);
                    function updateRulesComplete(response) {
                        return response.data.results;
                    }

                    function updateRulesFailed(error) {
                        logger.error('updateRulesFailed: ' + error);
                        return {};
                    }
            }
            catch(updateRulesErr){
                logger.error("updateRulesErr: " + updateRulesErr);
            }
        }

        function updateEmployee(updateEmployeePayload) {
            try{
                var updateEmployeeUrl= config.dataApiUrl + '/employees/save';

                return $http.post(updateEmployeeUrl, updateEmployeePayload).then(updateEmployeeComplete).catch(updateEmployeeFailed);
                    function updateEmployeeComplete(response) {
                        return response.data.results;
                    }

                    function updateEmployeeFailed(error) {
                        logger.error('updateEmployeeFailed: ' + error);
                        return {};
                    }
            }
            catch(updateEmployeeErr){
                logger.error("updateEmployeeErr: " + updateEmployeeErr);
            }
        }

        function newEmployee(newEmployeePayload) {
            try{
                var newEmployeeUrl= config.dataApiUrl + '/employees/new';
                return $http.post(newEmployeeUrl, newEmployeePayload).then(newEmployeeComplete).catch(newEmployeeFailed);
                    function newEmployeeComplete(response) {
                        return response.data.results;
                    }

                    function newEmployeeFailed(error) {
                        logger.error('newEmployeeFailed: ' + error);
                        return false;
                    }
            }
            catch(newEmployeeErr){
                logger.error("newEmployeeErr: " + newEmployeeErr);
            }
        }

        function resetEmployeePassword(resetEmployeeEmail) {
            try{
                var resetEmployeePasswordPayload = { email: resetEmployeeEmail };
                var resetEmployeePasswordUrl= config.authApiUrl + '/forgot';
                return $http.post(resetEmployeePasswordUrl, resetEmployeePasswordPayload).then(resetEmployeePasswordComplete).catch(resetEmployeePasswordFailed);
                    function resetEmployeePasswordComplete(response) {
                        return response.data.results;
                    }

                    function resetEmployeePasswordFailed(error) {
                        logger.error('resetEmployeePasswordFailed: ' + error);
                        return {};
                    }
            }
            catch(resetEmployeePasswordErr){
                logger.error("resetEmployeePasswordErr: " + resetEmployeePasswordErr);
            }
        }

        // #endregion
    }
}());