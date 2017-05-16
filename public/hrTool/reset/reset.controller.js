(function () {
'use strict';

    angular.module('hrTool.reset')
        .controller('hrTool.reset', ['hrTool.reset.dataservice', '$log', 'hrTool.events', 'hrTool.exceptions', '$location', 'hrTool.events', ResetController]);

    function ResetController(service, logger, hrEvents, hrExceptions, $location, hrToolEvents) {
        var vm = this;
        vm.validToken = false;
        vm.verifySuccess = {};
        vm.passwordReset = "";

        vm.resetSuccess = false;

        activate();

        // #region Implementation

        function activate() {
            vm.resetUserPassword = resetUserPassword;
            checkVerification();
        }

        function checkVerification(){
            try {
//                console.log($location.search())
                var currentParams = $location.search();
                if ('sptoken' in currentParams){
                    return service.verityResetToken(currentParams.sptoken).then(function(verifyTokenResult) {
                        if (verifyTokenResult===true){
                            vm.validToken = true;
//                            vm.verifySuccess = verifyTokenResult;
                        }
                        else{
                            vm.validToken = false;
                        }
                    });
                }
            }
            catch (verityResetTokenEx){
                    console.log("verityResetTokenEx: " + verityResetTokenEx)
            }
        }

        function resetUserPassword(){
            var currentParams = $location.search()
            return service.resetUserPassword(currentParams.sptoken, vm.passwordReset ).then(function(resetUserPasswordResult) {
                if (resetUserPasswordResult===true){
                    vm.resetSuccess = true;
                    hrToolEvents.broadcastAlertSuccess("Password reset complete. Please login again.");
                }
                else{
                    hrToolEvents.broadcastAlertError("Password reset failed. Contact support if the problem persist.");
                }
            });
        }

        // #endregion

    }
}());
