//
//(function() {
//    'use strict';
//    angular.module('dg.widgets', []);
////    angular.module('dg.basic', ['dg']);
////    angular.module('dg.basic', ['dg', 'dg.layout', 'dg.state']);
//
//})();
//console.log("dg sharedSpinner");
'use strict';

try {
//    console.log("hrTool.widgets 2");
    angular.module('hrTool')
        .directive('widgets.sharedSpinner', sharedSpinner);
//    console.log("widgets widgets widgets widgets");

    function sharedSpinner($rootScope) {
        /* implementation details */

        console.log("sharedSpinner sharedSpinner sharedSpinner sharedSpinner");
    }
    //console.log();
}
catch (hrToolWidgetsException){
    console.log("hrToolWidgetsException " + hrToolWidgetsException);
}