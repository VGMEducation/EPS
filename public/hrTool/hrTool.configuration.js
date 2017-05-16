angular.module('hrTool').constant('config', {})
    .run(['config', function(config) {

            config.user_info_path = "user";
            config.review_info_path = "review";


	        var baseApiUrl = "/api";
            config.apiUrl = baseApiUrl + "";

            config.dataApiUrl = baseApiUrl + "/data";
            config.authApiUrl = baseApiUrl + "/auth";

            config.defaultRedirect = "/";

            config.loginRedirect = "/login";

            config.alertDismissTimeout = 3000;

            config.userProfileRoute = "/user";

            //Determines how long before timeout does the pop up appears
            config.sessionTimeoutPopUpIntervalInSeconds = 120;

            //Determines how long before user is automatically logged out due to inactivity
            config.formsTimeoutInSeconds = 600;
        }
    ]);