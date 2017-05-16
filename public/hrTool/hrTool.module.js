//console.log("hrTool init");
'use strict';

try {
    angular
      .module('hrTool', [
        'ngAnimate',
        'ngResource',
        'ngSanitize',
//        'ngTouch',
        'ngRoute',
        'ui.router',
        'ui.bootstrap',
        'angularSpinner',
        'ngStorage',
        'ngMaterial',
        'angular.filter',
        'textAngular',
        'ngCsv',
        'duScroll',
        'angular-jwt',
        'hrTool.widgets',
        'hrTool.home',
        'hrTool.admin',
        'hrTool.login',
        'hrTool.forgot',
        'hrTool.reset',
        'hrTool.review'
//        'hrTool.info'
      ]
    );
}
catch (hrToolException){
    console.log("hrToolException " + hrToolException);
}