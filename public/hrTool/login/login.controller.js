(function () {
'use strict';

    angular.module('hrTool.login')
        .controller('hrTool.login', ['hrTool.login.dataservice', '$log', 'hrTool.events', '$rootScope', '$location', LoginController]);

    function LoginController(service, logger, hrToolEvents, $rootScope, $location) {
        var vm = this;

        vm.email = "";
        vm.password = "";

        activate();
        var defaultRedirect = '/home';

        // #region Implementation

        function activate() {
            vm.loginUser = loginUser;
        }

        function loginUser(){
            var loginUserCredentials = {
                email: vm.email,
                password: vm.password
            };
            return service.loginUser(loginUserCredentials).then(function(data) {
//                console.log(data);
                if (data==true){
                    $rootScope.$broadcast("loginEvent", true);
                    $location.url(defaultRedirect);
                    //TODO: Optional- Redirect To Last Requested Page
                }

//                else{
//                    dgEvents.broadcastAlertError("Login failed.");
//                }
            });
        };

        function clear() {
        }

        function submit() {
        }

        // #endregion

    }
}());
