(function () {
'use strict';

    angular.module('hrTool.review')
        .controller('hrTool.review', ['hrTool.review.dataservice', '$log', 'hrTool.events', '$rootScope', '$state', '$stateParams', 'config', 'hrTool.widgets.dataservice', 'hrTool.storage', ReviewController]);

    function ReviewController(service, logger, hrToolEvents, $rootScope, $state, $stateParams, config, widgetsDataService, hrToolStorage) {
        var vm = this;

        vm.currentEmployee = {
            currentRole: {}, performanceHeaderText: "", reviewQuestions: [], salary: {effectiveDate: new Date()}, goals: "", overallScore: 0,
            supervisorReviewDate: new Date(), deptHeadReviewDate: new Date(), adminReviewDate: new Date(), employeeReviewDate: new Date(),
            signatureUrl1: "", signatureUrl2: "", signatureUrl3: "", signatureUrl4: "", state: "",
            signatureLabel1: "", signatureLabel2: "", signatureLabel3: "", signatureLabel4: "", subsequentReview: 0
        };
        vm.currentNav = '';

        // Progress Bars
        vm.progressBarCurrent = 1;
        vm.progressBarMax = 0;
        vm.overallProgressBarCurrent = 1;
        vm.overallProgressBarMax = 3;

        vm.progressBarNonCoreIndex = 0;

        vm.coreComponentsPrefaceText = "Core Components of the job directly reflects the employee\'s understanding of their position, and how to accomplish the essential functions of that position. Miller\'s goal is to train and develop all employees in a manor that aides them in the accomplishment of this goal.";

        vm.isSigning = false;
        vm.isFinalizing = false; //state for department heads and location admin putting the final touches on it.

        var pdfMargins = {
            top: 0.5,
            bottom: 0.5,
            left: 0.5,
            width: 7.5
        };

	    var defaultSignaturePenColor = "rgb(255,250,250)";

	    var defaultReviewRoute = 'review.start';
	    var defaultHomeRedirect = 'home.myInfo';

        $rootScope.$on("$stateChangeSuccess", function(event, next, current) {
//            console.log("$stateChangeSuccess")
            if ($state.current.name=='review'){
                $state.go(defaultReviewRoute);
            }
            loadCurrentReviewPageData($state.current.name);
            vm.currentNav = $state.current.name;
        });

        activate();

        // #region Implementation

        function activate() {
            vm.startCore = startCore;
            vm.startQuestions = startQuestions;

            vm.signatureStart = signatureStart;
            vm.signatureClear = signatureClear;
            vm.signatureAccept = signatureAccept;

            vm.reviewFinalize= reviewFinalize;
            vm.reviewDone= reviewDone;

            vm.printSalary = printSalary;
            vm.printReview = printReview;

            vm.completeGoals = completeGoals;

            vm.storeLocalChanges = storeLocalChanges;
            vm.loadReviewData = loadReviewData;

            vm.submitReview = submitReview;

            vm.nextQuestion = nextQuestion;

            vm.hardResetReview = hardResetReview;

//	        var currentReviewData = localStorageService.get("currentReview");
	        var currentReviewData = service.getReviewData();

	        if (currentReviewData==null){
                $state.go(defaultHomeRedirect);
            }
            else{
		        vm.currentEmployee = angular.copy(currentReviewData);

                if (!vm.currentEmployee.hasOwnProperty('currentRole')) {
//                    Placeholder Until Data Retrieved
                    vm.currentEmployee.lastReviewDate = new Date();
                    vm.currentEmployee.nextReviewDate = new Date();
                    vm.currentEmployee.actualReviewDate = new Date();

                    vm.loadReviewData();
                }
                else{
//                    console.log("has Current ROle")
//                    console.log(vm.currentEmployee)
//                    console.log(vm.currentEmployee.actualReviewDate )
//                    console.log(typeof vm.currentEmployee.actualReviewDate )
//                    console.log(typeof (new Date(vm.currentEmployee.actualReviewDate )) );
                    //TODO - if date nothing, if string convert, if int conver
                    if (vm.currentEmployee.hasOwnProperty('actualReviewDate')) {
                        vm.currentEmployee.actualReviewDate = new Date(vm.currentEmployee.actualReviewDate);
                    }
                    if (vm.currentEmployee.hasOwnProperty('nextReviewDate')) {
                        vm.currentEmployee.nextReviewDate = new Date(vm.currentEmployee.nextReviewDate);
                    }
                    if (vm.currentEmployee.hasOwnProperty('lastReviewDate')) {
                        vm.currentEmployee.lastReviewDate = new Date(vm.currentEmployee.lastReviewDate);
                    }

                    if (vm.currentEmployee.hasOwnProperty('salary')) {
                        if (vm.currentEmployee.salary.hasOwnProperty('effectiveDate')) {
                            vm.currentEmployee.salary.effectiveDate = new Date(vm.currentEmployee.salary.effectiveDate);
                        }
                        else{
                            vm.currentEmployee.salary.effectiveDate = new Date();
                        }
                    }
                    else{
                        vm.currentEmployee.salary = {effectiveDate: new Date()};
                    }

//                console.log('supervisorReviewDate')
//                console.log(vm.currentEmployee.supervisorReviewDate)
                    if (vm.currentEmployee.hasOwnProperty('supervisorReviewDate')) {
                        vm.currentEmployee.supervisorReviewDate = new Date(vm.currentEmployee.supervisorReviewDate);
                        vm.currentEmployee.deptHeadReviewDate = new Date(vm.currentEmployee.deptHeadReviewDate);
                        vm.currentEmployee.adminReviewDate = new Date(vm.currentEmployee.adminReviewDate);
                        vm.currentEmployee.employeeReviewDate = new Date(vm.currentEmployee.employeeReviewDate);
                    }

                    if (vm.currentEmployee.hasOwnProperty('reviewQuestions')) {
//                        console.log("has review questions "+ vm.currentEmployee.reviewQuestions.length)
            //			vm.progressBarMax = vm.currentEmployee.reviewQuestions.length;
                        var nonCoreQuestionIndex = [];
                        angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                            if (!aQuest.isCoreComponent){
                                vm.progressBarMax ++;
                                nonCoreQuestionIndex.push(ind);
                            }
                        });
                        vm.progressBarNonCoreIndex = nonCoreQuestionIndex[vm.progressBarCurrent - 1];
                    }
                }

                if (vm.currentEmployee.hasOwnProperty('state')) {
                    var state = vm.currentEmployee.state;
//            		console.log('state ' + state);
//            		console.log('review.isFinalizing ' + vm.isFinalizing);
                    if (state=='Completed'){
                        vm.isFinalizing = true;
                    }
                }

                if ($state.current.name=='review'){
                    $state.go(defaultReviewRoute);
                }
                loadCurrentReviewPageData($state.current.name);
                vm.currentNav = $state.current.name;
            }
        }

        function loadCurrentReviewPageData(currentReviewRoute){
//            console.log(currentReviewRoute + " || state: " + vm.currentEmployee.state);
            switch(currentReviewRoute) {
                case 'review.print':
                    break;
                case 'review.core':
					vm.overallProgressBarCurrent = 1;
                    break;
                case 'review.questions':
//                    console.log('admin questions');
                    if (vm.currentEmployee.hasOwnProperty('reviewQuestions')) {
//                        console.log("has review questions "+ vm.currentEmployee.reviewQuestions.length)
            //			vm.progressBarMax = vm.currentEmployee.reviewQuestions.length;
                        var nonCoreQuestionIndex = [];
                        vm.progressBarMax = 0;
                        angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                            if (!aQuest.isCoreComponent){
                                vm.progressBarMax ++;
                                nonCoreQuestionIndex.push(ind);
                            }
                        });
                        vm.progressBarNonCoreIndex = nonCoreQuestionIndex[vm.progressBarCurrent - 1];
                    }


                    var q = $state.params.qId
                    if (q == null || q <= 0){
//                        $location.search('q', null)
//                    var q = $state.params.qId
                        vm.progressBarCurrent = 1;
                    }
                    else if(q >= vm.progressBarMax){
//                        $location.search('q', vm.progressBarMax)
                        vm.progressBarCurrent = vm.progressBarMax;
                    }
                    else{
                        vm.progressBarCurrent = Number(q);
                    }
                    var nonCoreQuestionIndex = [];
                    angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                        if (!aQuest.isCoreComponent){
                            nonCoreQuestionIndex.push(ind);
                        }
                    });
                    vm.progressBarNonCoreIndex = nonCoreQuestionIndex[vm.progressBarCurrent -1];
					vm.overallProgressBarCurrent = 1;

//                    if (vm.currentEmployee.hasOwnProperty('reviewQuestions')) {
//                        console.log("has review questions "+ vm.currentEmployee.reviewQuestions.length)
//            //			vm.progressBarMax = vm.currentEmployee.reviewQuestions.length;
//                        var nonCoreQuestionIndex = [];
//                        angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
//                            if (!aQuest.isCoreComponent){
//                                vm.progressBarMax ++;
//                                nonCoreQuestionIndex.push(ind);
//                            }
//                        });
//                        vm.progressBarNonCoreIndex = nonCoreQuestionIndex[vm.progressBarCurrent - 1];
//                    }
                    break;
                case 'review.goals':
					vm.overallProgressBarCurrent = 2;
                    break;
                case 'review.salary':
					vm.overallProgressBarCurrent = 3;
                    break;
                case 'review.start':
                    //loadStart();
//                    console.log("loadStart")
//                    console.log(vm.currentEmployee.state)
                    break;
                default:
//                    console.log("review default break")
            }
        }

        function nextQuestion(){
            //console.log("nextQuestion");

            var nonCoreQuestionIndex = [];
            angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                if (!aQuest.isCoreComponent){
                    nonCoreQuestionIndex.push(ind);
                }
            });

            //if (!vm.currentEmployee.reviewQuestions[vm.progressBarCurrent - 1].score){
            if (!vm.currentEmployee.reviewQuestions[vm.progressBarNonCoreIndex].score){
                hrToolEvents.broadcastAlertWarning("Please enter a score for the question."); //TODO Use events
            }
            else{
                storeLocalChanges();
//                console.log(vm.progressBarMax)
//                console.log(vm.progressBarCurrent)
                if ((vm.progressBarCurrent + 1) > vm.progressBarMax){
//                    //console.log("last question jump to goals")
//                    $location.search('q', null);
//                    $location.search('v', 'reviewGoals');
//                    vm.currentNav = 'reviewGoals';
//                    vm.overallProgressBarCurrent = 2;
//                    //vm.navClick('reviewGoals');
                    $state.go('review.goals');
                }
                else{
                    vm.progressBarCurrent = (vm.progressBarCurrent + 1);
                    vm.progressBarNonCoreIndex = nonCoreQuestionIndex[vm.progressBarCurrent -1 ];
                    $state.go('review.questions',  {qId: vm.progressBarCurrent});
//                    $location.search('q', vm.progressBarCurrent);
                }
            }
        };

        function storeLocalChanges(){
//            console.log("storeLocalChanges");
            var currentScore = 0;
            if (vm.currentEmployee.hasOwnProperty('reviewQuestions') && (typeof vm.currentEmployee.reviewQuestions != 'undefined')){
                for(var i = 0; i < vm.currentEmployee.reviewQuestions.length; i++){
                    var aQuestion = vm.currentEmployee.reviewQuestions[i];
                    if (angular.isNumber(aQuestion.score)){
                        currentScore += aQuestion.score;
                    }
                }
            }
            vm.currentEmployee.overallScore = currentScore;
    //		console.log("overallScore " + vm.currentEmployee.overallScore)
            service.updateReviewData(angular.copy(vm.currentEmployee));

            //console.log("storing data to database");
            var reviewPayload = angular.copy(vm.currentEmployee);
            reviewPayload.lastReviewDate = new Date(reviewPayload.lastReviewDate).getTime();
            reviewPayload.nextReviewDate = new Date(reviewPayload.nextReviewDate).getTime();
            reviewPayload.actualReviewDate = new Date(reviewPayload.actualReviewDate).getTime();
            reviewPayload.supervisorReviewDate = new Date(reviewPayload.supervisorReviewDate).getTime();
            reviewPayload.deptHeadReviewDate = new Date(reviewPayload.deptHeadReviewDate).getTime();
            reviewPayload.adminReviewDate = new Date(reviewPayload.adminReviewDate).getTime();
            reviewPayload.employeeReviewDate = new Date(reviewPayload.employeeReviewDate).getTime();

            if (vm.currentEmployee.hasOwnProperty('salary')) {
                if (vm.currentEmployee.salary.hasOwnProperty('effectiveDate')) {
                    reviewPayload.salary.effectiveDate = new Date(reviewPayload.salary.effectiveDate).getTime();
                }
                else{
                    reviewPayload.salary.effectiveDate = new Date().getTime();
                }
            }
            else{
                reviewPayload.salary = {effectiveDate: new Date().getTime()};
            }


            //console.log("reviewEmployeeId: " + reviewEmployeeId)
            //console.log(reviewPayload)
            delete reviewPayload._id;

            service.saveReviewData(reviewPayload).then(function(data) {
                if (data){
                    //console.log("stored data to database");
                }
                else{
                    //console.log("failed to store database");
                }
            });
        }

        function startCore() {
            storeLocalChanges();
            if (vm.currentEmployee.currentRole.hasCoreComponentsQuestion){
    //			console.log("hasCoreComponentsQuestion");
//                vm.navClick('reviewCore');
                $state.go('review.core');
            }
            else{
//                vm.navClick('reviewQuestions');
                $state.go('review.questions');
            }
        }

        function startQuestions(){
    //		console.log("startQuestions");
            storeLocalChanges();
            // set index to first core components question
            var foundNonCoreQuestion = false;
            var nonCoreQuestionIndex = [];
            angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                if (!aQuest.isCoreComponent){
                    if (!foundNonCoreQuestion){
                        //console.log("START QUESTOIN INDEX FOUND - " + ind);
                        //console.log(JSON.stringify(aQuest));
                        vm.progressBarNonCoreIndex = ind;
                        foundNonCoreQuestion = true;
                    }
                    nonCoreQuestionIndex.push(ind);
                }
            });
            $state.go('review.questions');
    //		console.log("START QUESTOIN nonCoreQuestionIndex - " + nonCoreQuestionIndex);
    //		console.log("progressBarNonCoreIndexprogressBarNonCoreIndexprogressBarNonCoreIndex - " + vm.progressBarNonCoreIndex);
        };
        function submitReview(){
    //		if (vm.currentEmployee.salary.employeeComments.length==0){
    //			hrToolEvents.broadcastAlertWarning("Please enter a comment for the Salary section.");
    //		}
    //		else{
                storeLocalChanges();
                $state.go('review.print');
    //		}
        };

        function completeGoals(){
            if (vm.currentEmployee.goals.length==0 || vm.currentEmployee.education.length==0 || vm.currentEmployee.growthOpportunities.length==0){
                hrToolEvents.broadcastAlertWarning("Please enter a comment for each of the three section.");
            }
            else{
                storeLocalChanges();
                $state.go('review.salary')
            }
        };
        function signatureStart (){
    //		console.log("signatureStart");
            vm.isSigning = true;
            var canvas = $('#signatureCanvas').get(0);
            var canvas2 = $('#signatureCanvas2').get(0);
            var canvas3 = $('#signatureCanvas3').get(0);
            var canvas4 = $('#signatureCanvas4').get(0);
            var ctx=canvas.getContext("2d");
            var ctx2=canvas2.getContext("2d");
            var ctx3=canvas3.getContext("2d");
            var ctx4=canvas4.getContext("2d");
            var signaturePad = new SignaturePad(canvas);
            var signaturePad2 = new SignaturePad(canvas2);
            var signaturePad3 = new SignaturePad(canvas3);
            var signaturePad4 = new SignaturePad(canvas4);
            signaturePad.penColor=defaultSignaturePenColor;
            signaturePad2.penColor=defaultSignaturePenColor;
            signaturePad3.penColor=defaultSignaturePenColor;
            signaturePad4.penColor=defaultSignaturePenColor;

            if (vm.currentEmployee.signatureUrl1.length>0){
                var img = new Image;
                img.onload = function(){
                  ctx.drawImage(img,0,0);
                };
                img.src = vm.currentEmployee.signatureUrl1;
            }

            if (vm.currentEmployee.signatureUrl2.length>0){
                var img2 = new Image;
                img2.onload = function(){
                  ctx2.drawImage(img2,0,0);
                }
                img2.src = vm.currentEmployee.signatureUrl2;
            }

            if (vm.currentEmployee.signatureUrl3.length>0){
                var img3 = new Image;
                img3.onload = function(){
                  ctx3.drawImage(img3,0,0);
                };
                img3.src = vm.currentEmployee.signatureUrl3;
            }

            if (vm.currentEmployee.signatureUrl4.length>0){
                var img4 = new Image;
                img4.onload = function(){
                  ctx4.drawImage(img4,0,0);
                };
                img4.src = vm.currentEmployee.signatureUrl4;
            }

        };

        function signatureClear(signaturePadInt){
            if (signaturePadInt  === undefined){
                signaturePadInt = '';
            }
            var canvasStringName =   '#signatureCanvas' + signaturePadInt;
    //		console.log("signatureClear " + canvasStringName);
            var canvas = $(canvasStringName).get(0);
            var ctx=canvas.getContext("2d");
            ctx.clearRect(0,0, canvas.width, canvas.height);
        };

        function signatureAccept(signaturePadInt){
            if (signaturePadInt  === undefined){
                signaturePadInt = '';
            }
            var canvasStringName =   '#signatureCanvas' + signaturePadInt;
    //		console.log("signatureClear " + canvasStringName);
            var canvas = $(canvasStringName).get(0);
            var ctx=canvas.getContext("2d");
            var imgData=ctx.getImageData(0,0,canvas.width, canvas.height);
            var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    //        console.log(dataURL);
            if (signaturePadInt == '2'){
                vm.currentEmployee.signatureUrl2  = dataURL;
            }
            else if (signaturePadInt == '3'){
                vm.currentEmployee.signatureUrl3 = dataURL;
            }
            else if (signaturePadInt == '4'){
                vm.currentEmployee.signatureUrl4 = dataURL;
            }
            else{
                vm.currentEmployee.signatureUrl1 = dataURL;
            }
            //vm.isSigning = false;
            storeLocalChanges();
            hrToolEvents.broadcastAlertSuccess("Signature saved.");
        };

        function reviewFinalize(){
            //console.log("reviewFinalize");
            vm.currentEmployee.state = "Finalized";
            storeLocalChanges();
            hrToolEvents.broadcastAlertSuccess("Review Finalized.");
            $state.go(defaultHomeRedirect)
        };

        function reviewDone(){
    //		console.log("reviewDone");
            vm.currentEmployee.state = "Completed";
    //		console.log("reviewDone " + vm.currentEmployee.state );
            storeLocalChanges();
            hrToolEvents.broadcastAlertSuccess("Review Completed.");
//            vm.redirectDefault();
            $state.go(defaultHomeRedirect)
        };

        //TODO: Move Print Review Here
        function printReview(){
//            console.log("printRev")
            $rootScope.$broadcast("printReviewEvent",  vm.currentEmployee);
            //hrToolEvents.printReviewEvent(vm.currentReview);

//    		var aReview = vm.currentReview;
////
////            vm.currentReview.salary.effectiveDate = new Date(vm.currentReview.salary.effectiveDate).toLocaleString();
////            vm.currentReview.supervisorReviewDate = new Date(vm.currentReview.supervisorReviewDate).toLocaleString();
////            vm.currentReview.deptHeadReviewDate = new Date(vm.currentReview.deptHeadReviewDate).toLocaleString();
////            vm.currentReview.adminReviewDate = new Date(vm.currentReview.adminReviewDate).toLocaleString();
////            vm.currentReview.employeeReviewDate = new Date(vm.currentReview.employeeReviewDate).toLocaleString();
//
////            hrToolEvents.printReviewEvent(vm.currentReview);
        }

        function hardResetReview(){
            //console.log('hardResetReview')
            return service.hardResetReview(vm.currentEmployee).then(function(data) {
//                console.log("hardResetReview ctrl");
//                console.log(data.performanceHeaderText);
//                console.log(vm.currentEmployee.currentRole.performanceHeaderText);
                if (data){
                    var newReviewData = data;
//                    console.log(data);
                    // Overwrite New Data

                    var userData = widgetsDataService.getLocalUserData();
//                    console.log("subsequent review")

//                    vm.currentEmployee = newReviewData;
                    vm.isFinalizing = false;

                    //newReviewData.performanceHeaderText = vm.performanceHeaderText;
                    newReviewData.subsequentReview = userData.subsequentReview;

//                    newReviewData.state = 'Started';

                    vm.currentEmployee.currentRole = newReviewData;

                    vm.currentEmployee.reviewEmployeeId = data.reviewEmployeeId;
                    vm.currentEmployee.reviewId = data.reviewId;
                    //vm.currentEmployee.currentRole = $sce.trustAsHtml(vm.currentEmployee.currentRole.performanceHeaderText);
                    vm.currentEmployee.reviewQuestions = angular.copy(vm.currentEmployee.currentRole.questions);

                    vm.currentEmployee.lastReviewDate = new Date(vm.currentEmployee.lastReviewDate);
                    vm.currentEmployee.nextReviewDate = new Date(vm.currentEmployee.nextReviewDate);
    //                        vm.currentEmployee.scheduledReviewDate = new Date(vm.currentEmployee.scheduledReviewDate);
                    vm.currentEmployee.actualReviewDate = new Date();
                    vm.currentEmployee.overallScore = 0;
                    //vm.progressBarMax = vm.currentEmployee.reviewQuestions.length;
                    angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                        if (!aQuest.isCoreComponent){
                            vm.progressBarMax ++;
                        }
                    });

                    vm.currentEmployee.salary = {
                        currentRateOfPay: null,
                        currentSalaryGrade: null,
                        yearsOfService: null, //TODO: AUTO SET?
                        proposedRateOfPay: null,
                        proposedSalaryGrade: null,
                        effectiveDate: new Date().getTime(),
                        followsFacilityWageApproval: null,
                        explanation: "",
                        employeeComments: ""
                    };

                    vm.currentEmployee.signatureUrl1 = "";
                    vm.currentEmployee.signatureUrl2 = "";
                    vm.currentEmployee.signatureUrl3 = "";
                    vm.currentEmployee.signatureUrl4 = "";
                    vm.currentEmployee.signatureLabel1 = "";
                    vm.currentEmployee.signatureLabel2 = "";
                    vm.currentEmployee.signatureLabel3 = "";
                    vm.currentEmployee.signatureLabel4 = "";

                    vm.currentEmployee.supervisorReviewDate = new Date().getTime();
                    vm.currentEmployee.deptHeadReviewDate = new Date().getTime();
                    vm.currentEmployee.adminReviewDate = new Date().getTime();
                    vm.currentEmployee.employeeReviewDate = new Date().getTime();

                    vm.currentEmployee.goals = "";
                    vm.currentEmployee.state = "Started";

                    //vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;
//
//                    if (vm.currentEmployee.hasOwnProperty('currentRole')){
//                        if (vm.currentEmployee.currentRole.hasOwnProperty('subsequentReview')){
//                            vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;
//                        }
//                    }


                    hrToolStorage.setStorage(config.review_info_path, newReviewData);
                    //service.createReview(currentReviewData);
                    hrToolEvents.broadcastAlertSuccess("The review has been reset."); //TODO Use events
//                    $state.go(defaultReviewRoute)


                }
            });
        }

        function printSalary(){
//    		console.log("printSalary");
            var reportName = 'Salary Report ' + new Date().toLocaleString();
	        var reportExt = '.pdf';
            var reportFileName = reportName + reportExt;
            var pdfDoc = new jsPDF('p', 'in', 'letter');
            var source = $('#printReviewHTML').first();
            var specialElementHandlers = {
                '#bypassme': function(element, renderer) {
                return true;
                }
            };
            pdfDoc.page = 1;
            var roleTitleAndEmployeeName = vm.currentEmployee.roleName + ' - ' + vm.currentEmployee.employeeName;
            pdfDoc.text(0.25, 0.5, roleTitleAndEmployeeName);
            pdfDoc.fromHTML(
                $('#printReviewHTMLPage5').get(0),
                pdfMargins.left, // x coord
                pdfMargins.top, // y coord
                {
                'width': pdfMargins.width, // max width of content on PDF
                'elementHandlers': specialElementHandlers
                }
            );

            pdfDoc.save(reportFileName);
        };

        function loadReviewData(){
//    		console.log("loadReviewData");
//            console.log(vm.currentEmployee)

    		// Placeholder Until Data Retrieved
//    		if ()
//            vm.currentEmployee.lastReviewDate = new Date(vm.currentEmployee.lastReviewDate);
//            vm.currentEmployee.nextReviewDate = new Date(vm.currentEmployee.nextReviewDate);
//            vm.currentEmployee.actualReviewDate = new Date();

            var currentRoleId = vm.currentEmployee.role;
            var reviewEmployeeId = vm.currentEmployee._id;
            var currentEmployee = vm.currentEmployee.employeeName;
            var reviewDataPayload = {roleId: currentRoleId, reviewEmployeeId: reviewEmployeeId, employeeName: currentEmployee};

//            console.log(reviewDataPayload)

            return service.loadReviewData(reviewDataPayload).then(function(data) {
//                console.log("loadReviewData ctrl");
//                console.log(data);s
//                console.log(data.state);
//                console.log(vm.currentEmployee.currentRole.performanceHeaderText);
                if (data){
                    if (!data.isNew){
//                        console.log("not new");
//                        console.log(vm.currentEmployee.employeeReviewDate);
                        var empName = vm.currentEmployee.employeeName;
                        vm.currentEmployee = data;
                        vm.currentEmployee.employeeName  = empName;
                        vm.currentEmployee.lastReviewDate = new Date(vm.currentEmployee.lastReviewDate);
                        vm.currentEmployee.nextReviewDate = new Date(vm.currentEmployee.nextReviewDate);
                        vm.currentEmployee.actualReviewDate = new Date(vm.currentEmployee.actualReviewDate);
                        vm.currentEmployee.supervisorReviewDate = new Date(vm.currentEmployee.supervisorReviewDate);
                        vm.currentEmployee.deptHeadReviewDate = new Date(vm.currentEmployee.deptHeadReviewDate);
                        vm.currentEmployee.adminReviewDate = new Date(vm.currentEmployee.adminReviewDate);
                        vm.currentEmployee.employeeReviewDate = new Date(vm.currentEmployee.employeeReviewDate);
                        //vm.currentEmployee.effectiveDate = new Date(vm.currentEmployee.employeeReviewDate);

                        if (vm.currentEmployee.hasOwnProperty('salary')){
                            if (vm.currentEmployee.salary.hasOwnProperty('effectiveDate')){
                                vm.currentEmployee.salary.effectiveDate = new Date(vm.currentEmployee.salary.effectiveDate);
                            }
                            else{
                                vm.currentEmployee.salary.effectiveDate = new Date();
                            }
                        }
                        else{
                            vm.currentEmployee.salary = {effectiveDate: new Date()};
                        }

                        if (vm.currentEmployee.hasOwnProperty('currentRole')){
                            if (vm.currentEmployee.currentRole.hasOwnProperty('subsequentReview')){
                                vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;
                            }
                        }
                        vm.currentEmployee.reviewId = vm.currentEmployee._id;
//                        vm.currentEmployee.state= vm.currentEmployee.state;
//                        vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;

                        //TODO: Validate Below Change
//                        if (vm.currentEmployee.hasOwnProperty('currentRole')){
//                            if (vm.currentEmployee.currentRole.hasOwnProperty('subsequentReview')){
//                                vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;
//                            }
//                        }
//                        console.log(vm.currentEmployee.salary);
//                        console.log(vm.currentEmployee.state);
                    }
                    else{
//                        console.log("new");
//                        console.log(data);
//                        console.log(data.effectiveDate);

                        vm.currentEmployee.currentRole = data;
                        vm.currentEmployee.reviewEmployeeId = data.reviewEmployeeId;
                        vm.currentEmployee.reviewId = data.reviewId;
                        //vm.currentEmployee.currentRole = $sce.trustAsHtml(vm.currentEmployee.currentRole.performanceHeaderText);
                        vm.currentEmployee.reviewQuestions = angular.copy(vm.currentEmployee.currentRole.questions);

                        vm.currentEmployee.lastReviewDate = new Date(vm.currentEmployee.lastReviewDate);
                        vm.currentEmployee.nextReviewDate = new Date(vm.currentEmployee.nextReviewDate);
//                        vm.currentEmployee.scheduledReviewDate = new Date(vm.currentEmployee.scheduledReviewDate);
                        vm.currentEmployee.actualReviewDate = new Date();
                        vm.currentEmployee.overallScore = 0;
                        //vm.progressBarMax = vm.currentEmployee.reviewQuestions.length;
                        angular.forEach(vm.currentEmployee.reviewQuestions, function(aQuest, ind) {
                            if (!aQuest.isCoreComponent){
                                vm.progressBarMax ++;
                            }
                        });

                        vm.currentEmployee.salary = {
                            currentRateOfPay: null,
                            currentSalaryGrade: null,
                            yearsOfService: null, //TODO: AUTO SET?
                            proposedRateOfPay: null,
                            proposedSalaryGrade: null,
                            effectiveDate: new Date().getTime(),
                            followsFacilityWageApproval: null,
                            explanation: "",
                            employeeComments: ""
                        };

                        vm.currentEmployee.signatureUrl1 = "";
                        vm.currentEmployee.signatureUrl2 = "";
                        vm.currentEmployee.signatureUrl3 = "";
                        vm.currentEmployee.signatureUrl4 = "";
                        vm.currentEmployee.signatureLabel1 = "";
                        vm.currentEmployee.signatureLabel2 = "";
                        vm.currentEmployee.signatureLabel3 = "";
                        vm.currentEmployee.signatureLabel4 = "";

                        vm.currentEmployee.supervisorReviewDate = new Date().getTime();
                        vm.currentEmployee.deptHeadReviewDate = new Date().getTime();
                        vm.currentEmployee.adminReviewDate = new Date().getTime();
                        vm.currentEmployee.employeeReviewDate = new Date().getTime();

                        vm.currentEmployee.goals = "";
                        vm.currentEmployee.state = "Started";

                        //vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;

                        if (vm.currentEmployee.hasOwnProperty('currentRole')){
                            if (vm.currentEmployee.currentRole.hasOwnProperty('subsequentReview')){
                                vm.currentEmployee.subsequentReview = vm.currentEmployee.currentRole.subsequentReview;
                            }
                        }

//                        console.log(vm.currentEmployee.state);
                    }

                    var state = vm.currentEmployee.state;
                    if (state=='Completed'){
                        vm.isFinalizing = true;
                    }

                    vm.storeLocalChanges();
                }
            });
        };

        function printReview2 (){
//		console.log("printReview");
        var reportName = 'Report ' + new Date().toLocaleString();
	    var reportExt = '.pdf';
        var reportFileName = reportName + reportExt;
        var pdfDoc = new jsPDF('p', 'in', 'letter');
        var source = $('#printReviewHTML').first();
        var specialElementHandlers = {
			'#bypassme': function(element, renderer) {
			return true;
			}
        };
		pdfDoc.page = 1;
		pdfDoc.fromHTML(
			$('#printReviewHTMLPage1').get(0),
			pdfMargins.left, // x coord
			pdfMargins.top, // y coord
			{
			'width': pdfMargins.width, // max width of content on PDF
			'elementHandlers': specialElementHandlers
			}
		);

		var numberOfPages = 6;
		var i = 2;
		for (i = 2; i <= numberOfPages; i++) {
			//pdfDoc.page = i;
			var pageHTMLContent ='#printReviewHTMLPage' + i;
//			console.log(pageHTMLContent)
//			console.log(i)

			if (i==2){
				var corePageHeader = true;
				var corePageHeaderText = '<h3>Core Components</h3><div style="padding-bottom: 10px;">' + vm.coreComponentsPrefaceText + '</div><h4>Core Components of Job:</h4>';
				angular.forEach(vm.currentEmployee.reviewQuestions, function(question) {
					if (question.isCoreComponent) {
						var coreComponentScore = "Not Met";
						if (question.score==1){
							coreComponentScore = "Met";
						}
						var nextQuestionDiv = '<div><span>'+coreComponentScore+'</span> <hr> <b>'+question.title+'</b>  <hr> <p> <i>Comments: </i>'+question.comments+'</p></div>';
						if (corePageHeader){
							nextQuestionDiv =  corePageHeaderText + ' ' + nextQuestionDiv;
							corePageHeader = false;
						}
						pdfDoc.page ++;
						pdfDoc.addPage();
						pdfDoc.fromHTML(
							nextQuestionDiv,
							0.5, // x coord
							0.5, // y coord
							{
								'width': 7.5, // max width of content on PDF
								'elementHandlers': specialElementHandlers
							}
						);
					}
				});
			}
			else if (i==3){
				//console.log("currentpage is Review Questions + iterate over quesitons and print them")
				//console.log(pdfDoc.page)
				//console.log(vm.currentReview.reviewQuestions);

				var nonCorePageHeader = true;
				var nonCorePageHeaderText = '<h3>Review Questions</h3>';

				angular.forEach(vm.currentEmployee.reviewQuestions, function(question) {
					if (!question.isCoreComponent) {
						var nextQuestionDiv = '<div style="padding-bottom: 3px;"><div class="row"><div class="col-md-12"><h5>' + question.title + '</h5> <h5>Score: '+question.score+'</h5>'+question.text+'</div><p></br> </br> <i>Comments: </i>'+question.comments+'</p></div><p>----------------</p></div>';
						if (nonCorePageHeader){
							nextQuestionDiv =  nonCorePageHeaderText + ' ' + nextQuestionDiv;
							nonCorePageHeader = false;
						}
						pdfDoc.page ++;
						pdfDoc.addPage();
						pdfDoc.fromHTML(
							nextQuestionDiv,
							0.5, // x coord
							0.5, // y coord
							{
								'width': 7.5, // max width of content on PDF
								'elementHandlers': specialElementHandlers
							}
						);
					}
				});

			}
			else{
				pdfDoc.page ++;
				pdfDoc.addPage();
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
		}


		pdfDoc.page = (numberOfPages + 1);
		pdfDoc.addPage();
	 	if (vm.currentEmployee.hasOwnProperty('signatureUrl1')){
	 		var imageDataUrl = vm.currentEmployee.signatureUrl1 ;
			if (imageDataUrl.length>0){
//				console.log("save PDF - has signatureUrl1")
				pdfDoc.text(0.25, 0.4, vm.currentEmployee.signatureLabel1);
				//pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45)
				pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 0.5, 8, 3)
			}
		}

	 	if (vm.currentEmployee.hasOwnProperty('signatureUrl2')){
	 		var imageDataUrl = vm.currentEmployee.signatureUrl2 ;
			if (imageDataUrl.length>0){
//				console.log("save PDF - has signatureUrl2")
				pdfDoc.text(0.25, 3.85, vm.currentEmployee.signatureLabel2);
				//pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45)
				pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 4.15, 8, 3)
			}
		}

	 	if (vm.currentEmployee.hasOwnProperty('signatureUrl3')){
	 		var imageDataUrl = vm.currentEmployee.signatureUrl3;
			if (imageDataUrl.length>0){
//				console.log("save PDF - has signatureUrl3")
				pdfDoc.text(0.25, 7.65, vm.currentEmployee.signatureLabel3);
				//pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45)
				pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 7.85, 8, 3)
			}
		}

	 	if (vm.currentEmployee.hasOwnProperty('signatureUrl4')){
	 		pdfDoc.page = (numberOfPages + 1);
			pdfDoc.addPage();
	 		var imageDataUrl = vm.currentEmployee.signatureUrl4 ;
			if (imageDataUrl.length>0){
//				console.log("save PDF - has signatureUrl4")
				pdfDoc.text(0.25, 0.4, vm.currentEmployee.signatureLabel4);
				//pdfDoc.addImage(imageDataUrl, 'JPEG', 15, 40, 180, 45);
				pdfDoc.addImage(imageDataUrl, 'JPEG', 0.25, 0.5, 8, 3);
			}
		}


		pdfDoc.save(reportFileName);
		//pdfDoc.output('dataurl');
	};


        // #endregion

    }
}());
