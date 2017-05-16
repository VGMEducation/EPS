(function () {
'use strict';

    angular.module('hrTool.home')
        .controller('hrTool.home', ['hrTool.home.dataservice', '$log', 'hrTool.events', '$state', '$rootScope', 'hrTool.widgets.dataservice', '$location', HomeController]);

    function HomeController(service, logger, hrToolEvents, $state, $rootScope, widgetsDataService, $location) {
        var vm = this;
        vm.currentReview = {};
        vm.homePrintReviewHTMLPage1Show = false;
        vm.currentReviewShow = false;

        vm.myReviews= {};
        vm.myEmployees= {};
        vm.performanceHeaderText = '';

        var defaultHomeRoute = 'home.myInfo';

        vm.myEmployeesReverse = false;
        vm.myEmployeesPredicate = 'employeeName';
        
        activate();

        $rootScope.$on("$stateChangeSuccess", function(event, next, current) {
            if ($state.current.name=='home'){
                $state.go(defaultHomeRoute);
            }

            if ($state.current.name=='home.myEmployees' || $state.current.name=='home.myReviews'){
                getHomeData();
            }
        });

        // #region Implementation

        function activate() {
            if ($state.current.name=='home.myEmployees' || $state.current.name=='home.myReviews'){
                getHomeData();
            }
            if ($state.current.name=='home'){
                $state.go(defaultHomeRoute);
            }

            vm.viewReview = viewReview; //TODO
            vm.createReview = createReview; //TODO
//            createReview();

        }

        function createReview (currentReviewData){
            var userData = widgetsDataService.getLocalUserData();
            currentReviewData.performanceHeaderText = vm.performanceHeaderText;
            currentReviewData.subsequentReview = userData.subsequentReview;
//            console.log(currentReviewData)
            service.createReview(currentReviewData);
//            $location.url("/review");
            $state.go('review')
        };

        function viewReview(aReview, reviewIndex) {
    		vm.currentReview = aReview;

            vm.currentReview.salary.effectiveDate = new Date(vm.currentReview.salary.effectiveDate).toLocaleString();
            vm.currentReview.supervisorReviewDate = new Date(vm.currentReview.supervisorReviewDate).toLocaleString();
            vm.currentReview.deptHeadReviewDate = new Date(vm.currentReview.deptHeadReviewDate).toLocaleString();
            vm.currentReview.adminReviewDate = new Date(vm.currentReview.adminReviewDate).toLocaleString();
            vm.currentReview.employeeReviewDate = new Date(vm.currentReview.employeeReviewDate).toLocaleString();

            hrToolEvents.printReviewEvent(vm.currentReview);
        }

        function getHomeData() {
            return service.getHomeData().then(function(data) {
                if(data){
                    vm.myEmployees = data.myEmployees;
                    vm.myReviews = data.myReviews;
                    vm.performanceHeaderText = data.performanceHeaderText;
                }
                //return vm.data;
            });
        }


        function clear() {
        }

        function submit() {
        }

        // #endregion

    }
}());
