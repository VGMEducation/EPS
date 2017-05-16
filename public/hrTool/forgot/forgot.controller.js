(function () {
'use strict';
//    console.log('hrTool.forgotCtrl');

    angular.module('hrTool.forgot')
        .controller('hrTool.forgot', ['hrTool.forgot.dataservice', '$log', 'hrTool.events', ForgotController]);

    function ForgotController(service, logger, hrToolEvents) {
        var vm = this;

        vm.forgotEmail = "";
	    vm.forgotSuccess = false;

        activate();

        // #region Implementation

        function activate() {
            vm.forgotPassword = forgotPassword;
        }

        function getHomeData() {
            vm.homeData = service.getHomeData();
        }

        function forgotPassword(){

            var forgotPasswordPayload = {
                email: vm.forgotEmail
            };
            return service.forgotPassword(forgotPasswordPayload).then(function (data){
                if (data==true){
                    vm.forgotSuccess = true;
                    hrToolEvents.broadcastAlertSuccess("Password reset sent to email.");
                }
//                else{
//                    hrToolEvents.broadcastAlertError(response.data.error);
//                }
            });
        };

        // #endregion

    }
}());
