//console.log("hrTool routes");
'use strict';

try {
    angular.module('hrTool').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/");

      // Now set up the states
      $stateProvider
//        .state('widgets', {
//              url: "/",
//              controller: 'hrTool.widgets as widgets',
//              templateUrl: "/hrTool/widgets/widgets.html",
//          })
//        .state('default', {
//            url: "/",
//            controller: 'hrTool.home as home',
//            templateUrl: "/hrTool/home/home.html",
//        })
        .state('home', {
            url: "/home",
//            url: "/home",
            controller: 'hrTool.home as home',
            templateUrl: "/hrTool/home/home.html",
        })
        .state('home.myEmployees', {
            url: "/myEmployees",
//            controller: 'hrTool.home as home',
            templateUrl: "/hrTool/home/home.myEmployees.html",
        })
        .state('home.myInfo', {
            url: "/myInfo",
//            controller: 'hrTool.home as home',
            templateUrl: "/hrTool/home/home.myInfo.html",
        })
        .state('home.myReviews', {
            url: "/myReviews",
//            controller: 'hrTool.home as home',
            templateUrl: "/hrTool/home/home.myReviews.html",
        })
        .state('admin', {
            url: "/admin",
            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.html",
        })
        .state('admin.employees', {
            url: "/employees",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.employees.html",
        })
        .state('admin.locations', {
            url: "/locations",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.locations.html",
        })
        .state('admin.reports', {
            url: "/reports",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.reports.html",
        })
        .state('admin.reviews', {
            url: "/reviews",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.reviews.html",
        })
        .state('admin.roles', {
            url: "/roles",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.roles.html",
        })
        .state('admin.rules', {
            url: "/rules",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.rules.html",
        })
        .state('admin.import', {
            url: "/import",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/admin/admin.import.html",
        })
        .state('login', {
//            url: "/login/:redirect_page",
            url: "/login",
            controller: 'hrTool.login as login',
            templateUrl: "/hrTool/login/login.html",
        })
        .state('forgot', {
            url: "/forgot",
            controller: 'hrTool.forgot as forgot',
            templateUrl: "/hrTool/forgot/forgot.html",
        })
        .state('reset', {
            url: "/reset",
            controller: 'hrTool.reset as reset',
            templateUrl: "/hrTool/reset/reset.html",
        })
        .state('review', {
            url: "/review",
            controller: 'hrTool.review as review',
            templateUrl: "/hrTool/review/review.html",
        })
        .state('review.start', {
            url: "/start",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.start.html",
        })
        .state('review.core', {
            url: "/core",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.core.html",
        })
        .state('review.questions', {
            url: "/questions/:qId",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.questions.html",
        })
        .state('review.salary', {
            url: "/salary",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.salary.html",
        })
        .state('review.goals', {
            url: "/goals",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.goals.html",
        })
        .state('review.print', {
            url: "/print",
//            controller: 'hrTool.admin as admin',
            templateUrl: "/hrTool/review/review.print.html",
        })
//        .state('info', {
//            url: "/info",
//            controller: 'hrTool.info as info',
//            templateUrl: "/hrTool/info/info.html",
//        })

        $urlRouterProvider.otherwise('/home');

    }]).run(function($rootScope, $location) {
    //TODO: cahnge route to state
        $rootScope.$on( "$stateChangeStart", function(event, next, current) {
//            console.debug('$routeChangeStart')
        });

        $rootScope.$on('$stateChangeSuccess',
            function(event, current, previous, rejection) {
//                console.log('on .routeChangeSuccess - check logging state TODO')
            }
        );

        $rootScope.$on('$stateChangeError',
            function(event, current, previous, rejection) {
//                console.log('on .stateChangeError')
            }
        );

    });

}
catch (hrToolRoutesException){
    console.log("hrToolRoutesException " + hrToolRoutesException);
}