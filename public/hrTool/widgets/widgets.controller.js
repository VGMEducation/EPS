(function () {
'use strict';
//console.log("widgets")
    angular.module('hrTool.widgets')
        .controller('hrTool.widgets', ['hrTool.widgets.dataservice', '$log', '$scope', '$rootScope','config', '$location', '$uibModal', '$document', '$mdSidenav', 'hrTool.events', '$timeout', WidgetsController]);

    function WidgetsController(service, logger, $scope, $rootScope, config, location, $uibModal, $document, $mdSidenav, dgEvents, $timeout) {
        var vm = this;

        vm.user_data = {};
        vm.user_data.isAdmin = false;
        vm.user_data.isCorporateAdmin= false;
        vm.user_data.username = '';//'Test User';
        vm.user_data.firstName = '';//'Test';
        vm.user_data.lastName = '';//'User';
        vm.user_data.supervisorName = '';//'User';
        vm.user_data.hrRepName = '';//'User';
        vm.user_data.roleName = '';//'User';
        vm.user_data.myReviews = [];
        vm.user_data.myEmployees = [];

        vm.admin_rules = {};

        vm.is_logged_in = false;

        vm.currentReview = {};

        //TODO: Update with Get Settings
        vm.core_components_preface_text = "Core Components of the job directly reflects the employee\'s understanding of their position, and how to accomplish the essential functions of that position. Miller\'s goal is to train and develop all employees in a manor that aides them in the accomplishment of this goal.";
        vm.performance_header_Text = "";


//        console.log("determine loc");
        var currentPath = location.path();
//        console.log(location.path());
        var loginPaths = ['/login', 'login', '/reset', 'reset', '/forgot', 'forgot', '/register', 'register', '/verify', 'verify', '/resendVerify','resendVerify']; //TODO: Remove?

        activate();

        // Alert Message Handler
        vm.alertDismissTimeout = config.alertDismissTimeout;
        vm.alertMessage = {type: "success", msg: "Success!"};
        vm.alerts = [];
        vm.showSpinner = false;

        vm.closeAlert = function(index) {
            vm.alerts.splice(index, 1);
        };

        $scope.$on('$viewContentLoaded', function(event){
            //Here your view content is fully loaded !!
//            console.log("$viewContentLoaded + ");
//            console.log(event);
        });

        angular.element($document).ready(function () {
//          console.log('page loading completed');
        });

        $rootScope.$on("printReviewEvent", function (event, args) {
//            logger.warn("printReviewEvent + " + JSON.stringify(args));
//            logger.warn("printReviewEvent + ");
//            logger.warn(JSON.stringify(args));
            vm.printReview(args);
        });

        $rootScope.$on("alertMessageEvent", function (event, args) {
//            logger.warn("alertMessageEvent + " + JSON.stringify(args));
            vm.alerts.push(args);
            if (typeof args!= 'undefined'){
                if (args.hasOwnProperty('type')){
//                    if (args.type == "error"){
                        //TODO: if args warnging or error bring page focus here (delayed?)
                        var alertElement = angular.element(document.getElementById('alerts-section'))[0];
                        $document.scrollToElementAnimated(alertElement);
//                    }
                }
            }
        });

        // Show/Hide Spinner
        $rootScope.$on("showSpinnerEvent", function (event, args) {
//            logger.debug("showSpinnerEvent + " + args);
            vm.showSpinner = args;
        });

        $rootScope.$on("loginEvent", function (event, args) {
//            console.log("loginEvnt " + args);
            if (args){
                vm.loadUser();
            }
        });


        // #region Implementation
        function activate() {
//            console.log("active getUserData");
            checkLoginData();

            vm.logOutUser = logOutUser;
            vm.loadUser = loadUser;
            vm.updateLoginUi = updateLoginUi;

            vm.isOverDue = isOverDue;
            vm.isUpcoming = isUpcoming;

            //TODO: Not Call every time?
//            if (!vm.user_data.hasOwnProperty('hireDate')){ hc.getHomeData(); }

//            vm.getSettings = getSettings;
            //console.log(vm.user_data)
            if (!vm.user_data.hasOwnProperty('upcomingReview') && vm.is_logged_in){
                getSettings();
            }

            vm.printReview = printReview;
        }

        function getSettings(){
//            logger.info("getSettings")
            return service.getSettings().then(function(data) {
                vm.admin_rules = data;
//                logger.info(vm.admin_rules)
//                return vm.homeData;
            });
		}

        function isOverDue(aDate){
    //		$log.info("isOverDue - aDate " + aDate);
            var overDue = false;;
            var overDueDate = new Date().getTime();
            if (overDueDate >= aDate){
                overDue = true;
            }
    //		$log.info("isOverDue - aDate " + overDue);
            return overDue;
        };

        function isUpcoming(reviewDate){
            var upcomingDue = false;
            var ct = new Date().getTime() - 86400000;
            var upcomingDueDate = reviewDate - (vm.admin_rules.upcomingReview * 86400000);
            if (ct >= upcomingDueDate && reviewDate > ct ){
                upcomingDue = true;
            }
            return upcomingDue;
        };

        function updateLoginUi(loggedIn){
//            console.log(loggedIn)
            if (loggedIn===true){
                vm.is_logged_in = true;
//                vm.bodyClass = defaultClass;
//                checkUserData();
            }
            else{
                vm.is_logged_in = false;
//                vm.bodyClass = loginClass;
            }
//            console.log(vm.is_logged_in)

        }

        function checkLoginData() {
            vm.user_data = service.getUserData();
//            console.log("checklogin dataa");
//            console.log(vm.user_data);
            if (Object.keys(vm.user_data).length === 0 && JSON.stringify(vm.user_data) === JSON.stringify({})){
                updateLoginUi(false);
                //todo login redirect w/ deep linking
                if (loginPaths.indexOf(currentPath) > -1){
                    //location.url(currentPath)
                }
                else{
                    location.url(config.loginRedirect);
                }
            }
            else{
                if (loginPaths.indexOf(currentPath) > -1){
                    location.url(config.defaultRedirect)
                }
                updateLoginUi(true);
            }
        }

        function loadUser(){
            updateLoginUi(true);
            vm.user_data = service.getLocalUserData();
            if (!vm.user_data.hasOwnProperty('isAdmin')){
                service.getAdditionalUserData().then(function (data){
                    if (data){
                        vm.user_data = data;
                    }
                });
            }
        };

        function logOutUser(){
            service.logoutUser();
            updateLoginUi(false);

            //todo login redirect w/ deep linking
            location.url(config.loginRedirect);
        }

        function printReview(aReview){
            vm.currentReview = angular.copy(aReview);
            //console.log(vm.currentReview)
            vm.currentReview.salary.effectiveDate = new Date(vm.currentReview.salary.effectiveDate).toLocaleString();
            vm.currentReview.supervisorReviewDate = new Date(vm.currentReview.supervisorReviewDate).toLocaleString();
            vm.currentReview.deptHeadReviewDate = new Date(vm.currentReview.deptHeadReviewDate).toLocaleString();
            vm.currentReview.adminReviewDate = new Date(vm.currentReview.adminReviewDate).toLocaleString();
            vm.currentReview.employeeReviewDate = new Date(vm.currentReview.employeeReviewDate).toLocaleString();

            console.log(vm.currentReview.employeeReviewDate)
            console.log(new Date(vm.currentReview.employeeReviewDate).toLocaleString());

            var reviewStringPrintOut = '';

            $timeout(function() {
                var popupWin = window.open('', '_blank', 'width=600,height=600');

                var reportName = 'Report ' + new Date().toLocaleString();
                var reviewStringStart = '<html><head><title>' + reportName + '</title><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">'
                var reviewStringEnd = '</body></html>';

                reviewStringPrintOut += reviewStringStart;

                reviewStringPrintOut += $('#homePrintReviewHTMLPage1').get(0).outerHTML;
    //            console.log($('#homePrintReviewHTMLPage1').get(0).innerHTML)
    //            console.log($('#homePrintReviewHTMLPage1').get(0).outerHTML)
                reviewStringPrintOut += $('#homePrintReviewHTMLPage2').get(0).outerHTML;
                reviewStringPrintOut += $('#homePrintReviewHTMLPage3').get(0).outerHTML;
                reviewStringPrintOut += $('#homePrintReviewHTMLPage4').get(0).outerHTML;
                reviewStringPrintOut += $('#homePrintReviewHTMLPage5').get(0).outerHTML;
                reviewStringPrintOut += $('#homePrintReviewHTMLPage6').get(0).outerHTML;

                reviewStringPrintOut += '<h4>' + vm.currentReview.signatureLabel1 + '</h4><img src="' + vm.currentReview.signatureUrl1 + '">';
                reviewStringPrintOut += '<h4>' + vm.currentReview.signatureLabel2 + '</h4><img src="' + vm.currentReview.signatureUrl2 + '">';
                reviewStringPrintOut += '<h4>' + vm.currentReview.signatureLabel3 + '</h4><img src="' + vm.currentReview.signatureUrl3 + '">';
                reviewStringPrintOut += '<h4>' + vm.currentReview.signatureLabel4 + '</h4><img src="' + vm.currentReview.signatureUrl4 + '">';

                reviewStringPrintOut += reviewStringEnd;

                popupWin.document.open();
                popupWin.document.write(reviewStringPrintOut);

                $timeout(function() {
//                    console.log("800ms")
                    popupWin.print()
    //              popupWin.document.close();
                }, 499);
            }, 499);
        }

        function printReviewOld(aReview){
            //console.log(aReview)
            vm.currentReview = angular.copy(aReview);

            //console.log(vm.currentReview)

            vm.currentReview.salary.effectiveDate = new Date(vm.currentReview.salary.effectiveDate).toLocaleString();
            vm.currentReview.supervisorReviewDate = new Date(vm.currentReview.supervisorReviewDate).toLocaleString();
            vm.currentReview.deptHeadReviewDate = new Date(vm.currentReview.deptHeadReviewDate).toLocaleString();
            vm.currentReview.adminReviewDate = new Date(vm.currentReview.adminReviewDate).toLocaleString();
            vm.currentReview.employeeReviewDate = new Date(vm.currentReview.employeeReviewDate).toLocaleString();

            var printContents = "<div ><h4 >Sign Off Dates</h4><div><b>Supervisor: </b>{{widgets.currentReview.supervisorReviewDate | date: 'MM/dd/yyyy'}}</div><div><b>Dept. Head: </b>{{widgets.currentReview.deptHeadReviewDate | date: 'MM/dd/yyyy'}}</div></div>";
            console.log(printContents)
            var popupWin = window.open('', '_blank', 'width=300,height=300');
              popupWin.document.open();
              popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
              popupWin.document.close();

            $timeout(function() {
//                    console.log("800ms")
                var reportExt = '.pdf';
                var reportName = 'Report ' + new Date().toLocaleString();
                var reportFileName = reportName + reportExt;
                var pdfDoc = new jsPDF('p', 'in', 'letter');
                var source = $('#homePrintReviewHTML').first();
                var specialElementHandlers = {
                    '#bypassme': function(element, renderer) {
                    return true;
                    }
                };
                //console.log($('#homePrintReviewHTMLPage1').get(0))
                pdfDoc.fromHTML(
                    $('#homePrintReviewHTMLPage1').get(0),
                    0.5, // x coord
                    0.5, // y coord
                    {
                        'width': 7.5, // max width of content on PDF
                        'elementHandlers': specialElementHandlers
                    }
                );

                var numberOfPages = 6;
                var i = 2;
                for (i = 2; i <= numberOfPages; i++) {
                    pdfDoc.page = i;
                    pdfDoc.addPage();
                    var pageHTMLContent ='#homePrintReviewHTMLPage' + i;
                    //console.log(pageHTMLContent)
                    //console.log($(pageHTMLContent).get(0))
                    pdfDoc.fromHTML(
                        $(pageHTMLContent).get(0),
                        0.5, // x coord
                        0.5, // y coord
                        {
                            'width': 7.5, // max width of content on PDF
                            'elementHandlers': specialElementHandlers
                        }
                    );
                }

                pdfDoc.page = (numberOfPages + 1);
    //            pdfDoc.page ++;
                pdfDoc.addPage();
                if (vm.currentReview.hasOwnProperty('signatureUrl1')){
                    var imageDataUrl = vm.currentReview.signatureUrl1 ;
                    if (imageDataUrl.length>0){
        //				console.log("save PDF - has signatureUrl1")
                        pdfDoc.text(0.25, 0.4, vm.currentReview.signatureLabel1);
                        //pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45)
                        pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 0.5, 8, 3)
                    }
                }

                if (vm.currentReview.hasOwnProperty('signatureUrl2')){
                    var imageDataUrl = vm.currentReview.signatureUrl2 ;
                    if (imageDataUrl.length>0){
        //				console.log("save PDF - has signatureUrl2")
                        pdfDoc.text(0.25, 3.85, vm.currentReview.signatureLabel2);
                        pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 4.15, 8, 3);
                    }
                }

                if (vm.currentReview.hasOwnProperty('signatureUrl3')){
                    var imageDataUrl = vm.currentReview.signatureUrl3;
                    if (imageDataUrl.length>0){
        //				console.log("save PDF - has signatureUrl3")
                        pdfDoc.text(0.25, 7.65, vm.currentReview.signatureLabel3);
                        //pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45)
                        pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 7.85, 8, 3)
                    }
                }

                if (vm.currentReview.hasOwnProperty('signatureUrl4')){
    //                pdfDoc.page = (numberOfPages + 1);
                    pdfDoc.page ++;
                    pdfDoc.addPage();
                    var imageDataUrl = vm.currentReview.signatureUrl4 ;
                    if (imageDataUrl.length>0){
        //				console.log("save PDF - has signatureUrl4")
                        pdfDoc.text(0.25, 0.4, vm.currentReview.signatureLabel4);
                        //pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45);
                        pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 0.5, 8, 3);
                    }
                }

                pdfDoc.save(reportFileName);
            }, 499); //
        }

        // #endregion

    }

}());