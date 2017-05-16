(function () {
'use strict';
//    console.log('hrTool.infoCtrl');

    angular.module('hrTool.info')
        .controller('hrTool.info', ['hrTool.info.dataservice', '$log', 'hrTool.events', InfoController]);

    function InfoController(service, logger, hrToolEvents) {
        logger.info('hrTool.infoCtrl - init');
        logger.info(hrToolEvents);
//        logger.info(hrToolEvents.broadcastAlert());
        hrToolEvents.broadcastAlert();
        var vm = this;

        vm.info = "ANGULAR STUFF";

        vm.staticVar = "staticVar loaded";
        vm.activate = false;
        vm.homeData = {};

        activate();


//        events.addEventListener('auth.loggedIn', function (event, data) {
//            vm.auth = data;
//        });
//
//        events.addEventListener('auth.loggedOut', function (event, data) {
//            vm.auth = data;
//        });

        // #region Implementation

        function activate() {


//            console.log('hrTool.homeCtrl - act')
            //vm.auth = auth.authentication;
            vm.activate = true;
//            console.log("activate activate activate hc");
//            console.log(vm.staticVar);

//            avengersService.getAvengers().then(function(data) {
//                vm.avengers = data;
//                return vm.avengers;
//            });

            getHomeData();

        }

        function getHomeData() {
//            console.log('getHomeData');
//            console.log(service);
            vm.homeData = service.getHomeData();
//            console.log(vm.homeData);
//            return service.getHomeData().then(function(data) {
//                vm.homeData = data;
//                return vm.homeData;
//            });
        }


        function clear() {
        }

        function submit() {
        }

        // #endregion

    }
}());
