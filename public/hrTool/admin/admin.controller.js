(function () {
'use strict';

    angular.module('hrTool.admin')
        .controller('hrTool.admin', ['hrTool.admin.dataservice', '$log', 'hrTool.events', '$state', '$scope', '$rootScope', 'hrTool.widgets.dataservice', '$document', '$q', AdminController]);

    function AdminController(service, logger, hrToolEvents, $state, $scope, $rootScope, widgetsDataService, $document, $q) {
        var vm = this;

        //TODO: async employees load
//        $scope.$on('$viewContentLoaded', function(event){
//            //Here your view content is fully loaded !!
////            console.log("$viewContentLoaded ad + ");
////            console.log(event);
//        });
//
//        angular.element($document).ready(function () {
//          console.log('page loading completed ad');
//        });

        vm.user_data = widgetsDataService.getLocalUserData();

        vm.adminRoles = [];
        vm.currentAdminRole = {};
        vm.newAdminRole = {roleName: "", hasReports: false, isHR: false, hasCoreComponentsQuestion: false};
    
        vm.adminReviews = {currentRole: {}, questions: [], currentQuestion: {}, newQuestion: { active: false, title: "", text: ""}};
        vm.adminReviews.roles = [];
        
        vm.adminEmployees = [];
        vm.isEditingEmployee = false;	
        vm.adminHrReps = [];
        vm.adminSupervisors = [];
        
        vm.adminReports = [];
        vm.adminReportsLocations = [{name: ""}];
        vm.adminReportsLocationsCurrent = vm.adminReportsLocations[0];
        
        vm.adminLocations = [];
        vm.currentAdminLocation = {};
        vm.newAdminLocation = {name:"",active: true};
        
        vm.adminRules = {};
        vm.adminRolesReverse = false;
    
        vm.newAdminIds = [];
        vm.removedAdminIds = [];

        vm.adminReportsPredicate = 'employeeName';
        vm.adminReportsReverse = false;

        vm.adminEmployeesPredicate = 'employeeName';
        vm.adminEmployeesReverse = false;

        vm.adminLocationsReverse = false;

        vm.textEditorButtons = [['h1', 'h2'],['bold', 'italics'], ['ul', 'ol'], ['undo', 'redo', 'clear']];

        vm.showAdminAccounts = false;

	    vm.tempLocation = {};
	    vm.tempRole = {};

	    //vm.user = {isCorporateAdmin: false};

       	vm.isEditingEmployee = true;

        vm.adminEmployeeFilters = {};
        vm.adminEmployeeFilters.expression = {};
       	vm.adminEmployeeFilters.showFilters = true;
       	vm.adminEmployeeFilters.employeeNameSearchText = '';
       	vm.adminEmployeeFilters.inActiveEmployees = true;
       	vm.adminEmployeeFilters.roles = [];
       	vm.adminEmployeeFilters.currentRole = {};
       	vm.adminEmployeeFilters.locations = [];
       	vm.adminEmployeeFilters.currentLocation = {};
        vm.adminEmployeeFilters.activeText = 'All';
        vm.adminEmployeeFilters.activeState = 0;

        // Modal Settings
        vm.isCreatingNewEmployee = false;
	    vm.newModalEmployee = {};

        vm.editEmployeeCurrentLocation;// defaultEditEmployeeCurrentLocation;
        vm.editEmployeeCurrentRole;// defaultEditEmployeeCurrentRole;
        vm.editEmployeeCurrentSupervisor;// defaultEditEmployeeCurrentSupervisor;
        vm.editEmployeeCurrentHrRep;// defaultEditEmployeeCurrentHrRep;

        vm.isModelFieldsFilled = false;

        vm.adminRolesActiveFilter = {active: true};

        vm.editEmployeeEmailHasChanged = false;

        vm.passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,100}$/;
//        vm.passwordPatternMessage = "1 lowercase, 1 uppercase, and length 8+";
        vm.passwordPatternMessage = "Must contain 1 lowercase, 1 uppercase, and length must be at least 8.";

       	function adminEmployeeFiltersActiveClick(){
            switch(vm.adminEmployeeFilters.activeState) {
                case 0:
                    vm.adminEmployeeFilters.expression.active=true;
                    vm.adminEmployeeFilters.activeText = 'Active Only';
                    vm.adminEmployeeFilters.activeState = 1;
                    break;
                case 1:
                    vm.adminEmployeeFilters.expression.active=false;
                    vm.adminEmployeeFilters.activeText = 'In-Active';
                    vm.adminEmployeeFilters.activeState = 2;
                    break;
                default:
                    delete vm.adminEmployeeFilters.expression.active;
                    vm.adminEmployeeFilters.activeText = 'All';
                    vm.adminEmployeeFilters.activeState = 0;
       	    }
       	}
       	function adminEmployeeFiltersResetClick(){
            vm.adminEmployeeFilters.expression = {};
            vm.adminEmployeeFilters.activeText = 'All';
            vm.adminEmployeeFilters.activeState = 0;
            vm.adminEmployeeFilters.currentRole = {};
            vm.adminEmployeeFilters.currentLocation = {};
        }

        vm.searchTextChange = searchTextChange;
        vm.searchTextChangeFacilityAdmin = searchTextChangeFacilityAdmin;

        vm.selectedItemChange = selectedItemChange;
        vm.selectedItemChangeFacilityAdmin = selectedItemChangeFacilityAdmin;

//        vm.createFilterFor = createFilterFor;

        vm.querySearch = querySearch;
        vm.querySearchFacilityAdmin = querySearchFacilityAdmin;

        vm.createOrEditEmployee = false;
        var defaultAdminRoute = 'admin.employees';
    	var size = "md";

        activate();

        $rootScope.$on("$stateChangeSuccess", function(event, next, current) {
            if ($state.current.name=='admin'){
                $state.go(defaultAdminRoute);
            }
            loadCurrentAdminPageData($state.current.name);
        });


        // #region Implementation

        function activate() {
            if ($state.current.name=='admin'){
                $state.go(defaultAdminRoute);
            }
            loadCurrentAdminPageData($state.current.name);

            vm.finalizeReview = finalizeReview;
            vm.downloadReport = downloadReport;

            vm.addNewRole = addNewRole;
            vm.saveRole = saveRole;
            vm.editRole = editRole;
            vm.editRoleClear = editRoleClear;
            vm.editRoleDelete = editRoleDelete;

            vm.newReviewQuestion = newReviewQuestion;
            vm.saveReviewQuestion = saveReviewQuestion;
            vm.editQuestion = editQuestion;
            vm.editQuestionClear = editQuestionClear;

            vm.addNewLocation = addNewLocation;
            vm.saveLocation = saveLocation;

            vm.editLocation = editLocation;
            vm.editLocationClear = editLocationClear;
            vm.getAdminReportsByLocation = getAdminReportsByLocation;

            vm.newEmployee = newEmployee;
            vm.editEmployee = editEmployee;

            vm.editEmployeeSave = editEmployeeSave;
            vm.editEmployeeCancel = editEmployeeCancel;
            vm.resetPassword = resetPassword;

            vm.getAdminAccounts = getAdminAccounts;
            vm.saveAdminAccounts = saveAdminAccounts;
//            vm.addNewFacilityAdmin = addNewFacilityAdmin;
            vm.addNewAdmin = addNewAdmin;
            vm.removeAdmin = removeAdmin;

            vm.getReportsIndividually = getReportsIndividually;

            vm.viewReviews = viewReviews;
            vm.reviewClick = reviewClick;

            vm.adminEmployeeFiltersActiveClick = adminEmployeeFiltersActiveClick;
            vm.adminEmployeeFiltersResetClick = adminEmployeeFiltersResetClick;

            vm.clickEditEmployeeCurrentRole = clickEditEmployeeCurrentRole;
            vm.clickEditEmployeeCurrentLocation = clickEditEmployeeCurrentLocation;
            vm.clickEditEmployeeCurrentSupervisor = clickEditEmployeeCurrentSupervisor;
            vm.clickEditEmployeeCurrentHrRep = clickEditEmployeeCurrentHrRep;

            vm.isPasswordValid = isPasswordValid;
            vm.newEmployeeHireDateChange = newEmployeeHireDateChange;
            vm.employeeEmailChanged = employeeEmailChanged;

        }

        function loadCurrentAdminPageData(currentAdminRoute){
            var isCorpAdmin = vm.user_data.isCorporateAdmin;
//            console.log("loadCurrent - " + currentAdminRoute + " ::  ACCESS " + isCorpAdmin)
//            console.log(vm.user_data.isCorporateAdmin)
            if (isCorpAdmin){
                switch(currentAdminRoute) {
                    case 'admin.reviews':
                        loadReviews();
                        break;
                    case 'admin.employees':
                        loadEmployees();
                        break;
                    case 'admin.reports':
                        loadReports();
                        break;
                    case 'admin.locations':
                        loadLocations();
                        break;
                    case 'admin.rules':
                        loadRules();
                        break;
                    default:
                        loadRoles();
                }
            }
            else{
                if (currentAdminRoute=='admin.employees'){
                    //console.log("load emp")
                    loadEmployees();
                }
                else if (currentAdminRoute=='admin.rules' || currentAdminRoute=='admin.locations' || currentAdminRoute=='admin.reviews' || currentAdminRoute=='admin.roles'){
                    //console.log("infinity and beyond " + currentAdminRoute)
//                    console.log($state.href)
//                    $state.current = 'admin.reports';
                    $state.go(defaultAdminRoute);
                }
                else if (currentAdminRoute=='admin.reports'){
//                    console.log("load rep")
                    loadReports();
                }
                else{
                    //console.log("load other")
                    //$state.go('admin.reports');
                }
            }
        }

        function resetPassword() {
            return service.resetEmployeePassword(vm.currentModalEmployee.email).then(function(data) {
                if (data){
                    var messageText  = "Employee password reset. Have them check their account. | " + vm.currentModalEmployee.email;
                    hrToolEvents.broadcastAlertSuccess(messageText);
                }
            });
        }

        function editEmployeeSave() {
        try{
            var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (vm.currentModalEmployee.firstName.length>0 && vm.currentModalEmployee.lastName.length>0 && re.test(vm.currentModalEmployee.email) )
           {
                //TODO: Validation && is email change then udpate
                vm.isModelFieldsFilled = true;
                vm.currentModalEmployee.employeeName = vm.currentModalEmployee.firstName + ' ' + vm.currentModalEmployee.lastName;
                var employeeDataPayload = angular.copy(vm.currentModalEmployee);
//				console.log(employeeDataPayload)
//				console.log($scope.ddlEmployeeObj)
                employeeDataPayload.hireDate = new Date(employeeDataPayload.hireDate).getTime();
                employeeDataPayload.nextReviewDate = new Date(employeeDataPayload.nextReviewDate).getTime();
                employeeDataPayload.lastReviewDate = new Date(employeeDataPayload.lastReviewDate).getTime();
                if (typeof vm.editEmployeeCurrentRole != 'undefined') {
                    if (vm.editEmployeeCurrentRole.hasOwnProperty('_id')) {
                        employeeDataPayload.role = vm.editEmployeeCurrentRole._id;
                        employeeDataPayload.roleName = vm.editEmployeeCurrentRole.roleName;
                    }
                    else{
                        employeeDataPayload.roleName ="";
                    }
                }
                if (typeof vm.editEmployeeCurrentLocation != 'undefined') {
                    if (vm.editEmployeeCurrentLocation.hasOwnProperty('_id')) {
                        employeeDataPayload.location = vm.editEmployeeCurrentLocation._id;
                        employeeDataPayload.locationName = vm.editEmployeeCurrentLocation.name;
                    }
                    else{
                        employeeDataPayload.locationName ="";
                    }
                }
                if (typeof vm.editEmployeeCurrentSupervisor != 'undefined') {
                    if (vm.editEmployeeCurrentSupervisor.hasOwnProperty('_id')) {
                        employeeDataPayload.supervisorName = vm.editEmployeeCurrentSupervisor.employeeName;
                        employeeDataPayload.supervisor = vm.editEmployeeCurrentSupervisor._id;;
                    }
                    else{
                        employeeDataPayload.supervisorName ="";
                    }
                }
                else{
                    console.log("no emp sup");
                }
                if (typeof vm.editEmployeeCurrentHrRep != 'undefined') {
                    if (vm.editEmployeeCurrentHrRep.hasOwnProperty('_id')) {
                        employeeDataPayload.hrRep = vm.editEmployeeCurrentHrRep._id;
                        employeeDataPayload.hrRepName = vm.editEmployeeCurrentHrRep.employeeName;
                    }
                    else{
                        employeeDataPayload.hrRepName ="";
                    }
                }
                else{
                    employeeDataPayload.hrRepName ="";
                }
//				console.log(" ```````````````about to save/create new emp````````````````` ")
                if(vm.isCreatingNewEmployee){
                    if (vm.isPasswordValid()){
//						$log.info("createEmployee() " + JSON.stringify(employeeDataPayload ));
                        return service.newEmployee(employeeDataPayload).then(function(data) {
                            if (data){
                            var broadcastMsg = ("Employee created. (Email: "+ employeeDataPayload.email + ")");
                                hrToolEvents.broadcastAlertSuccess(broadcastMsg);
                                vm.currentModalEmployee = {};
                                $state.reload();
                            }
                        });
                    }
                }
                else{
                    employeeDataPayload.emailHasChanged = vm.editEmployeeEmailHasChanged;
//					$log.info("saveEmployee() " + JSON.stringify(employeeDataPayload ));
                    return service.updateEmployee(employeeDataPayload).then(function(data) {
                        if (data){
                            var broadcastMsg = ("Employee updated. (Email: "+ employeeDataPayload.email + ")");
                            hrToolEvents.broadcastAlertSuccess(broadcastMsg);
                            //TODO": Force Reload?
                            vm.currentModalEmployee = {};
                            $state.reload();
                        }
                    });
                }
            }
            else{
                vm.isModelFieldsFilled = false;
                hrToolEvents.broadcastAlertWarning("Please ensure all fields are correct.")
            }
        }
        catch (modalSaveNewEmployeeErr){
            logger.error("modalSaveNewEmployeeErr() " + modalSaveNewEmployeeErr)
        }

        }

        function editEmployeeCancel() {
            vm.currentModalEmployee = {};
            vm.createOrEditEmployee = false;
        }

        function employeeEmailChanged() {
            if (!vm.isCreatingNewEmployee) {
                vm.editEmployeeEmailHasChanged = true;
             }
        }

        function newEmployeeHireDateChange() {
            if (vm.isCreatingNewEmployee) {
                vm.currentModalEmployee.nextReviewDate = new Date(new Date(vm.currentModalEmployee.hireDate).getTime() + (vm.adminRules.initialReview * 86400000));
            }
        };

        function isPasswordValid(){
            try{
                if (vm.currentModalEmployee.newPassword.match(vm.passwordPattern).length>0){
                    return true;
                }
                else{
                    return false;
                }
            }
            catch (passwordValidatorError){
//    			console.log("passwordValidatorError " + passwordValidatorError);
//                return false;
            }
        }

        function clickEditEmployeeCurrentRole(aRole){
            vm.editEmployeeCurrentRole = aRole;
        }

        function clickEditEmployeeCurrentSupervisor(aSup){
		    vm.editEmployeeCurrentSupervisor = aSup;
        }

        function clickEditEmployeeCurrentLocation(aLoc){
            vm.editEmployeeCurrentLocation = aLoc;
            vm.editEmployeeCurrentSupervisor = {};
            vm.editEmployeeCurrentHrRep = {};
        }

        function getSupervisors(){
            return service.getSupervisors().then(function(data) {
                if (data){
                	vm.adminSupervisors = data;
                }
            });
        };

        function clickEditEmployeeCurrentHrRep(aHrRep){
            vm.editEmployeeCurrentHrRep = aHrRep;
        }

        function getHrReps() {
            return service.getHrReps().then(function(data) {
                if (data){
                	vm.adminHrReps = data;
                }
            });
        }

        function editRole(newRole, ind){
            vm.tempRole = angular.copy(newRole);
            vm.tempRole.ind = ind;
            vm.currentAdminRole = angular.copy(newRole);
        };

        function editRoleClear(){
            vm.currentAdminRole = angular.copy(vm.tempRole);
            vm.tempRole = {};
            vm.currentAdminRole = {};
        };

        function editRoleDelete(){
            return service.deleteRole(vm.currentAdminRole).then(function(data) {
                if (data){
                    angular.forEach(vm.adminRoles, function(aRole, ind) {
                        if (aRole._id == vm.currentAdminRole._id){
                            vm.adminRoles.splice(ind, 1);
                            vm.currentAdminRole = {};
                            vm.tempRole = {};
                        }
                    });
                    hrToolEvents.broadcastAlertSuccess("Role deleted.");
                }
            });
        };

        function newReviewQuestion(){
            if (typeof vm.adminReviews.newQuestion.title == 'undefined' || vm.adminReviews.newQuestion.title == ""){
                hrToolEvents.broadcastAlertWarning("Please enter a question title.");
            }
            else{
                var newQuestion = vm.adminReviews.newQuestion;
                newQuestion.roleId = vm.adminReviews.currentRole._id;
                return service.newReviewQuestion(newQuestion).then(function(data) {
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Question created.");
                        vm.adminReviews.newQuestion = {title: "", _id: "", order: "", active: false, text: "", hasCoreComponentsQuestion: false};
                        vm.adminReviews.currentRole.questions.push(data);
                    }
                });
            }

        }

        function saveReviewQuestion(){
            if (typeof vm.adminReviews.currentQuestion._id == 'undefined' || vm.adminReviews.currentQuestion._id == ""){
                hrToolEvents.broadcastAlertWarning("Please select a question to edit first.");
            }
            else{
                var currentQuestion = vm.adminReviews.currentQuestion;
                currentQuestion.roleId = vm.adminReviews.currentRole._id;
                return service.saveReviewQuestion(currentQuestion).then(function(data) {
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Question updated.");
                        angular.forEach(vm.adminReviews.currentRole.questions, function(aQuestion, ind) {
                            if (aQuestion._id == vm.adminReviews.currentQuestion._id){
                                vm.adminReviews.currentRole.questions[ind] = angular.copy(vm.adminReviews.currentQuestion);
                            }
                        });
                        vm.tempQuestion = {};
                        vm.adminReviews.currentQuestion = {};
                    }
                });
            }
        }

//TODO
        function editEmployee(newModalEmployee, employeeIndex){
            vm.createOrEditEmployee = true;
            var createOrEditEmployeeElement = angular.element(document.getElementById('createOrEditEmployee'))[0];
            $document.scrollToElementAnimated(createOrEditEmployeeElement);

            vm.isCreatingNewEmployee = false;
            vm.isEditingEmployee = true;

            newModalEmployee.employeeIndex;

            newModalEmployee.hireDate = new Date(newModalEmployee.hireDate);
            newModalEmployee.nextReviewDate =  new Date(newModalEmployee.nextReviewDate);
            newModalEmployee.lastReviewDate =  new Date(newModalEmployee.lastReviewDate);
            newModalEmployee.reviews = newModalEmployee.reviews;

            vm.currentModalEmployee = newModalEmployee;

    //       	$log.info("newModalEmployee " + JSON.stringify(newModalEmployee));

            var defaultEditEmployeeCurrentLocation = vm.adminLocations[0];

            if (!defaultEditEmployeeCurrentLocation || vm.adminLocations.length == 0){
                defaultEditEmployeeCurrentLocation = {name: ""};
            }
            var defaultEditEmployeeCurrentRole = vm.adminRoles[0];
            if (!defaultEditEmployeeCurrentRole || vm.adminRoles.length == 0){
                defaultEditEmployeeCurrentRole = {roleName: ""};
            }
            var defaultEditEmployeeCurrentSupervisor = vm.adminSupervisors[0];
            if (!defaultEditEmployeeCurrentSupervisor || vm.adminSupervisors.length == 0){
                defaultEditEmployeeCurrentSupervisor = {employeeName: ""};
            }
            var defaultEditEmployeeCurrentHrRep = vm.adminHrReps[0];
            if (!defaultEditEmployeeCurrentHrRep || vm.adminHrReps.length == 0){
                defaultEditEmployeeCurrentHrRep = {employeeName: ""};
            }

            if (!vm.isCreatingNewEmployee){
                angular.forEach(vm.adminLocations, function(aLoc, ind) {
                    if(aLoc._id == vm.currentModalEmployee.location) {
                        vm.editEmployeeCurrentLocation = vm.adminLocations[ind];
                    }
                });

                angular.forEach(vm.adminRoles, function(aRole, ind) {
                    if(aRole._id == vm.currentModalEmployee.role) {
                        vm.editEmployeeCurrentRole = vm.adminRoles[ind];
                    }
                });

                angular.forEach(vm.adminSupervisors, function(aSup, ind) {
                    if(aSup._id == vm.currentModalEmployee.supervisor) {
                        vm.editEmployeeCurrentSupervisor = vm.adminSupervisors[ind];
                    }
                });

                angular.forEach(vm.adminHrReps, function(aRep, ind) {
                    if(aRep._id == vm.currentModalEmployee.hrRep) {
                        vm.editEmployeeCurrentHrRep = vm.adminHrReps[ind];
                    }
                });
            }
        };

        function finalizeReview(currentReviewData){
//		    console.log(vm.adminRules)

		    currentReviewData.performanceHeaderText = vm.adminRules.performanceHeaderText;
		    currentReviewData.subsequentReview = vm.adminRules.subsequentReview;

//		    console.log(currentReviewData)
		    widgetsDataService.setStorageData("review", currentReviewData); //TODO: pull review storage path from config
            $state.go('review.start');
        }

        function viewReviews(employeeInfo){
            editEmployee(employeeInfo);
            var employeeInfoId = employeeInfo._id;
            return service.getAnEmployeesReviews(employeeInfoId).then(function(data) {
                if (data){
                    vm.currentModalEmployee.reviews = data;
                }
            });
        };

        function reviewClick(aReview){
            hrToolEvents.printReviewEvent(aReview);
        }

        function newEmployee() {
            // Default New Employee Settings
            vm.createOrEditEmployee = true;
//            if (!vm.isCreatingNewEmployee){
                vm.newModalEmployee = {
                    firstName: "",
                    lastName: "",
                    email: "",
                    //lastReviewDate: new Date(),
                    nextReviewDate: new Date(new Date().getTime() + (vm.adminRules.initialReview * 86400000)), //TODO: get this "rules" info from data service
                    hireDate: new Date(),
                    active: true,
                    isAdmin: false,
                    isCorporateAdmin: false,
                    isFacilityAdmin: true,
                    isHR: false,
                    hasReviewAccess: false,
                    hasReports: false,
                    isCreatingNewEmployee: true,
                    initialReview: angular.copy(vm.adminRules.initialReview)
                };
//                vm.createOrEditEmployee = true;
                vm.isCreatingNewEmployee = true;
                var createOrEditEmployeeElement = angular.element(document.getElementById('createOrEditEmployee'))[0];
                $document.scrollToElementAnimated(createOrEditEmployeeElement);
    //            vm.editEmployee(angular.copy(vm.newModalEmployee));
                vm.currentModalEmployee = vm.newModalEmployee;

                vm.editEmployeeCurrentRole = {};
                vm.editEmployeeCurrentLocation = {};
                vm.editEmployeeCurrentSupervisor = {};
                vm.editEmployeeCurrentHrRep = {};
//            }
        };

        function editQuestion(newQuestion, ind){
            vm.tempQuestion = angular.copy(newQuestion);
            vm.tempQuestion.ind = ind;
            vm.adminReviews.currentQuestion = angular.copy(newQuestion);
        };

        function editQuestionClear(){
            vm.adminReviews.currentQuestion = angular.copy(vm.tempQuestion);
            vm.tempQuestion = {};
            vm.adminReviews.currentQuestion = {};
        };

        function editLocation(newLocation, ind){
            vm.tempLocation = angular.copy(newLocation);
            vm.tempLocation.ind = ind;
            vm.currentAdminLocation = angular.copy(newLocation);
        };

        function editLocationClear(){
            vm.adminReviews.currentQuestion = angular.copy(vm.tempQuestion);
            vm.tempLocation = {};
            vm.currentAdminLocation = {};
        };

        function getAdminReportsByLocation(aLoc){
            vm.adminReportsLocationsCurrent = aLoc;
            vm.getReportsIndividually(aLoc.name);
        };

        function loadRoles() {
            return service.getRoles().then(function(data) {
                if (data){
                    vm.adminRoles = data;

                    vm.adminEmployeeFilters.roles = angular.copy(vm.adminRoles);
                    vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
                }
//                else {
//                    hrToolEvents.broadcastAlertWarning("Unable to get roles at this time.")
//                }
            });
        }

        function loadEmployees() {
            vm.createOrEditEmployee = false;
//            console.log("service calls")
            return service.getEmployees().then(function(data) {
//                console.log("getEmployees ")
//                if (data.hasOwnProperty('employees')){
//                if (data.hasOwnProperty('employees')){
                if (!data){
                    console.log("getEmployees No ")
//                    hrToolEvents.broadcastAlertWarning("No employees were found.")
                }
                else{
//                    console.log("getEmployees Yes ")
                    //console.log(vm.adminLocations.length)
                    vm.adminEmployees = data.employees;
                    vm.adminEmployeesIsPayroll = data.isPayroll;
                    //Populate Filter DDLs
                    if (vm.adminEmployeeFilters.locations){
                        if (vm.adminEmployeeFilters.locations.length > 0){
                            vm.adminEmployeeFilters.locations = angular.copy(vm.adminLocations);
                            vm.adminEmployeeFilters.currentLocation = vm.adminEmployeeFilters.locations[0];
                        }
                    }

                    if (vm.adminEmployeeFilters.roles){
                        if (vm.adminEmployeeFilters.roles.length > 0){
                            vm.adminEmployeeFilters.roles = angular.copy(vm.adminRoles);
                            vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
                        }
                    }

                    getHrReps();
                    getSupervisors();

                    //loadLocations();
                    //loadRoles();
                    //loadRules(); //TODO: old call - vm.getSettings();

                    service.getLocations().then(function(data) {
                        if (data){
                            vm.adminLocations = data;
                            vm.adminEmployeeFilters.locations = angular.copy(vm.adminLocations);
                            vm.adminEmployeeFilters.currentLocation = vm.adminEmployeeFilters.locations[0];
                        }
                    });
                    service.getRoles().then(function(data) {
                        if (data){
                            vm.adminRoles = data;

                            vm.adminEmployeeFilters.roles = angular.copy(vm.adminRoles);
                            vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
                        }
                    });
                    service.getRules().then(function(data) {
                        if (data){
                            vm.adminRules = data;
        //                    console.log(data.performanceHeaderText)
//                            if (vm.showAdminAccounts){
//                                vm.getAdminAccounts();
//                            }
                        }
                    });

//                    var loadFunctions = [
//                        getHrReps(),
//                        getSupervisors(),
//                        loadLocations(),
//                        loadRoles(),
//                        loadRules(), //TODO: old call - vm.getSettings();
//                    ];
//
//                    $q.all(loadFunctions).then(function success() {
//        				console.log("loadFunctions: success")
////                        $rootScope.$broadcast("showSpinnerEvent", true);
//                        //console.log(ac.adminEmployees.length)
//                    }.bind(this), function failure(err) {
//        //				console.log("loadFunctions : err")
//                    }.bind(this));


//                    if (vm.adminRoles.length<=0){
//                        return service.getRoles().then(function(data) {
//                            vm.adminEmployeeFilters.roles = data;
////                            vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
//                            if (vm.adminLocations.length<=0){
//                                return service.getLocations().then(function(locData) {
//                                    vm.adminEmployeeFilters.locations = locData;
//                                });
//                            }
//                        });
//                    }

//                    if (vm.adminRoles.length<=0){
//                        return service.getRoles().then(function(data) {
//                            vm.adminEmployeeFilters.roles = data;
//                            vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
//                        });
//                    }
//                    else{
//                        vm.adminEmployeeFilters.roles = angular.copy(vm.adminRoles);
//                        vm.adminEmployeeFilters.currentRole = vm.adminEmployeeFilters.roles[0];
//                    }
//                    console.log(vm.adminLocations.length)
//                    if (vm.adminLocations.length<=0){
//                        return service.getLocations().then(function(data) {
//                            vm.adminEmployeeFilters.locations = data;
//                            vm.adminEmployeeFilters.currentLocation = vm.adminEmployeeFilters.locations[0];
//                        });
//                    }
//                    else{
//                        vm.adminEmployeeFilters.locations = angular.copy(vm.adminLocations);
//                        vm.adminEmployeeFilters.currentLocation = vm.adminEmployeeFilters.locations[0];
//                    }
                }
            });
        }

        function loadReports() {
            return service.getReports().then(function(data) {
//                console.log(data.length)
                if (!data || data.length <= 0 || typeof data.length == 'undefined'){
                    hrToolEvents.broadcastAlertWarning("No reports/employees were found.")
                }
                else{
                    vm.adminReports = data;
                }
            });
        }

        function getReportsIndividually(locationName){
            console.log('getReportsIndividually');
            return service.getReportsIndividually(locationName).then(function(data) {
                if (data){
                    vm.adminReports = data;
                }
            });
        };

        function downloadReport(){
            var csvData = [];
            angular.forEach(vm.adminReports, function(report) {
                var modifiedReport = {
                    employee: report.employeeName,
                    //role: report.role,
                    roleName: report.roleName,
                    //supervisor: report.supervisor,
                    supervisorName: report.supervisorName,
                    //location: report.location,
                    locationName: report.locationName,
                    lastReviewDate: new Date(report.lastReviewDate).toLocaleDateString(),
                    nextReviewDate: new Date(report.nextReviewDate).toLocaleDateString(),
                    active: report.active
                };
              //$log.debug(modifiedReport);
              csvData.push(modifiedReport);
            });
            return csvData;
        };

        function loadReviews() {
//            return service.getReviews().then(function(data) {
            if (vm.user_data.isCorporateAdmin){
                return service.getRoles().then(function(data) {
                    if (data){
                        //vm.adminReviews = data;
                        vm.adminReviews.roles = data;
                        vm.adminReviews.currentRole = vm.adminReviews.roles[vm.adminReviews.roles.length - 1]; //Defaults to most recently created.
                    }
                });
            }
            else{
                $state.go(defaultAdminRoute);
            }
        }

        function addNewRole(){
			if (vm.newAdminRole.roleName == "" || typeof vm.newAdminRole == 'undefined'){
                hrToolEvents.broadcastAlertWarning("Please enter a unique role name.");
			}
			else{
                return service.newRole(vm.newAdminRole).then(function(data) {
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Role created.");
                        vm.adminRoles.push(data);
                        vm.newAdminRole = {roleName: "", hasReports: false, isHR: false, hasCoreComponentsQuestion: false};
                    }
                });
            }
        }

        function saveRole(){
			if (vm.currentAdminRole.roleName == "" || vm.currentAdminRole == undefined){
                hrToolEvents.broadcastAlertWarning("Please select a role to edit first.");
			}
			else{
                return service.saveRole(vm.currentAdminRole).then(function(data) {
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Role updated.");
                        angular.forEach(vm.adminRoles, function(aRole, ind) {
                            if (aRole._id == vm.currentAdminRole._id){
                                vm.adminRoles[ind] = angular.copy(vm.currentAdminRole);
                            }
                        });
                        vm.currentAdminRole = {};
                        vm.tempRole = {};
                    }
                });
            }
        }

        function loadLocations() {
            if (vm.user_data.isCorporateAdmin){
                return service.getLocations().then(function(data) {
                    if (data){
                        vm.adminLocations = data;

                        vm.adminEmployeeFilters.locations = angular.copy(vm.adminLocations);
                        vm.adminEmployeeFilters.currentLocation = vm.adminEmployeeFilters.locations[0];
                    }
                });
            }
            else{
                $state.go(defaultAdminRoute);
            }
        }

        function addNewLocation(){
            try{
                logger.info("addNewLocation() " + JSON.stringify(vm.newAdminLocation));
                if (vm.newAdminLocation.name == "" || typeof vm.newAdminLocation == 'undefined'){
                    hrToolEvents.broadcastAlertWarning("Please enter a unique location name.");
                }
                else{
                    return service.newLocation(vm.newAdminLocation).then(function(data) {
                        if (data){
                            hrToolEvents.broadcastAlertSuccess("Location created.");
                            vm.adminLocations.push(data);
                            vm.newAdminLocation.name = "";
                        }
                    });
                }
            }
            catch (addNewLocationErr){
                logger.error("addNewLocation() " + addNewLocationErr)
            }
        };

        function saveLocation(){
            try{
//                logger.info("addNewLocation() " + JSON.stringify(vm.newAdminLocation));
                if (vm.currentAdminLocation.name == "" || vm.currentAdminLocation == undefined){
                    hrToolEvents.broadcastAlertWarning("Please select a location to edit first.");
                }
                else{
                    return service.updateLocation(vm.currentAdminLocation).then(function(data) {
                        if (data){
                            hrToolEvents.broadcastAlertSuccess("Location updated.");
                            angular.forEach(vm.adminLocations, function(aLoc, ind) {
                                if (aLoc._id == vm.currentAdminLocation._id){
                                    vm.adminLocations[ind] = angular.copy(vm.currentAdminLocation);
                                }
                            });
                            vm.currentAdminLocation = {};
                            vm.tempLocation = {};
                        }
                    });
                }
            }
            catch (saveLocation){
                logger.error("saveLocation() " + addNewLocationErr)
            }
        };

        vm.adminAccounts = {corporatePredicate: "", corporateReverse: "", facilityPredicate: "", facilityReverse: "", corporateAdmins:  [], facilityAdmins: []};
        vm.adminAccountsDDLs = {corporateAdmins: [], facilityAdmins: [], facilityLocations: [], autoComplete: "", autoCompleteFacilityAdmin: ""};
        vm.searchText = "";
        vm.searchTextFacilityAdmin = "";
        vm.adminAccountsCurrent = {corporate: {}, facility: {}, location: {}};
        vm.adminLicencesInfo = {maxNumberOfUsers: 0, maxNumberOfLocations: 0, maxNumberOfRoles: 0, maxNumberOfTemplatesPerRole: 0};

        function searchTextChange(newText){
//            console.log("searchTextChange " + newText);
        };

        function searchTextChangeFacilityAdmin(newText){
            //console.log("searchTextChangeFacilityAdmin " + newText);
        };

        function selectedItemChange(newItem){
            //console.log("selectedItemChange "+ newItem);
        };

        function selectedItemChangeFacilityAdmin(newItem){
            //console.log("selectedItemChangeFacilityAdmin "+ newItem);
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(anAdmin) {
                return (anAdmin.email.indexOf(lowercaseQuery) === 0);
            };

        }

        function querySearch (query) {
            var results = query ? vm.adminAccountsDDLs.corporateAdmins.filter( createFilterFor(query) ) : vm.adminAccountsDDLs.corporateAdmins, deferred;
            return results;
        };

        function querySearchFacilityAdmin (query) {
            //console.log("querySearchFacilityAdmin  "+ query);
            var results = query ? vm.adminAccountsDDLs.facilityAdmins.filter( createFilterFor(query) ) : vm.adminAccountsDDLs.facilityAdmins, deferred;
            return results;
        };

        function loadRules() {
//            console.log('loadRules');
            try{
    //			console.log(userData);
                if (vm.user_data.hasOwnProperty('isCustodian')){
                    if (vm.user_data.isCustodian == true){
                        vm.showAdminAccounts = true;
                    }
                }
            }
            catch(getAdminAccountsEx){
                logger.error("Error Getting Admin Accounts: " + getAdminAccountsEx);
            }

            if (vm.user_data.isCorporateAdmin){
                return service.getRules().then(function(data) {
                    if (data){
                        vm.adminRules = data;
    //                    console.log(data.performanceHeaderText)
                        if (vm.showAdminAccounts){
                            vm.getAdminAccounts();
                        }
                    }
                });
            }
            else{
                $state.go(defaultAdminRoute);
            }
        }

	    function saveRules(){
            try{
    //			logger.info("saveSettings() " + vm.adminRules)
                return service.updateRules(vm.adminRules).then(function(data) {
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Rules/Settings changes have been saved..");
                    }
                });
            }
            catch (saveSettingsErr){
                logger.error("saveSettingsErr() " + saveSettingsErr)
            }
	    };

	    function getAdminAccounts(){
           return service.getAdminAccounts().then(function(data) {
                if (data){
                    vm.adminAccounts.corporateAdmins = data.corporateAdmins;
                    vm.adminAccounts.facilityAdmins = data.facilityAdmins;

                    vm.adminAccountsDDLs.corporateAdmins = angular.copy(data.employees);
                    vm.adminAccountsDDLs.facilityAdmins = angular.copy(vm.adminAccountsDDLs.corporateAdmins);
                    vm.adminAccountsDDLs.facilityLocations = angular.copy(data.locations);

                    vm.newCorpAdminIds = [];
                    vm.newFacAdminIds = [];

                    vm.adminAccountsCurrent.corporate = {};
                    vm.adminAccountsCurrent.facility = {};
                    vm.adminAccountsCurrent.location = {};

                    vm.adminLicencesInfo = data.adminLicencesInfo;
                }
            });
		}

	    function saveAdminAccounts(){
            try{
//    			logger.info("saveSettings() " + vm.adminRules)
//    			logger.info("saveAdminAccounts() " )

                var allAdminIds = [];

                angular.forEach(vm.adminAccounts.corporateAdmins, function(corpAdmin) {
                    allAdminIds.push(corpAdmin._id);
                });

                angular.forEach(vm.adminAccounts.facilityAdmins, function(facAdmin) {
                    allAdminIds.push(facAdmin._id);
                });

//                console.log(vm.adminAccounts.corporateAdmins.length)
//                console.log(vm.adminAccounts.facilityAdmins.length)
//                console.log(vm.newAdminIds.length)
//                console.log(vm.removedAdminIds.length)
//                console.log(allAdminIds);
                var copyRemovedAdminIds= angular.copy(vm.removedAdminIds);
                angular.forEach(copyRemovedAdminIds, function(aRemovedAdminId, aRemovedAdminIndex) {
    //                console.log("aRemovedAdminId: " + aRemovedAdminId + " | " + aRemovedAdminIndex);
                    if (allAdminIds.indexOf(aRemovedAdminId) > -1) {
    //		            console.log("EXISTS"); // stille xists do not set admin field to false
                        vm.removedAdminIds.splice(aRemovedAdminIndex, 1);
                    }
                    else{
    //		            console.log("Does NOt EXISTS");
                    }
                });

                var newAdminAccounts = {corporateAdmins:  angular.copy(vm.adminAccounts.corporateAdmins),
                                        facilityAdmins: angular.copy(vm.adminAccounts.facilityAdmins),
                                        newAdminIds: angular.copy(vm.newAdminIds),
                                        removedAdminIds: angular.copy(vm.removedAdminIds)
                };

                return service.updateAdminAccounts(newAdminAccounts).then(function(data) {
//                    console.log(data)
                    if (data){
                        hrToolEvents.broadcastAlertSuccess("Rules/Settings changes have been saved.");
                    }
                });
            }
            catch (saveSettingsErr){
                logger.error("saveSettingsErr() " + saveSettingsErr)
            }
	    };


        function addNewAdmin(newAdminId, adminType){
//            console.log("addNewAdmin - newAdminId " + newAdminId +   " & adminType " + adminType);
            var newAdminInd = vm.newAdminIds.indexOf(newAdminId);
            if (newAdminInd > -1) {
                // Dup
            }
            else{
                vm.newAdminIds.push(newAdminId);
                if (vm.removedAdminIds.indexOf(newAdminId) > -1){
                    vm.removedAdminIds.splice(vm.removedAdminIds.indexOf(newAdminId), 1); // Remove Id from opposite array.
                }
            }

            if (adminType=='corp'){
        //            vm.adminAccountsDDLs.autoComplete.location = vm.adminAccountsCurrent.location;
                vm.adminAccounts.corporateAdmins.push(vm.adminAccountsDDLs.autoComplete);
            }
            if (adminType=='fac'){
        //            vm.addNewFacilityAdmin();
        //            vm.adminAccounts.facilityAdmins.push(vm.adminAccountsDDLs.autoCompleteFacilityAdmin);
                var newFacilityAdmin = {
                    employeeName: vm.adminAccountsDDLs.autoCompleteFacilityAdmin.employeeName,
                    email: vm.adminAccountsDDLs.autoCompleteFacilityAdmin.email,
                    _id: vm.adminAccountsDDLs.autoCompleteFacilityAdmin._id,
                    locationId: vm.adminAccountsCurrent.location._id,
                    locationName: vm.adminAccountsCurrent.location.name
                };
                vm.adminAccounts.facilityAdmins.push(newFacilityAdmin);
            }
        //        console.log(vm.newAdminIds);
        };

        function removeAdmin(adminIndex, rmAdminId, adminType){
        //        console.log("removeAdmin - adminIndex " + adminIndex +" & rmAdminId " + rmAdminId + " & adminType " + adminType);
            var rmIndex = vm.removedAdminIds.indexOf(rmAdminId)
        //        console.log("removeAdmin - rmIndex " + rmIndex);
            if (rmIndex > -1) {
                // Dup
            }
            else{
                vm.removedAdminIds.push(rmAdminId);
                if (vm.newAdminIds.indexOf(rmAdminId) > -1){
                    vm.newAdminIds.splice(vm.newAdminIds.indexOf(rmAdminId), 1); // Remove Id from opposite array.
                }
            }

            if (adminType=='corp'){
        //            console.log('corpRemove');
                vm.adminAccounts.corporateAdmins.splice(adminIndex, 1);
            }
            if (adminType=='fac'){
        //            console.log('facRemove');
                vm.adminAccounts.facilityAdmins.splice(adminIndex, 1);
            }
        //        console.log(ac.removedAdminIds);
        };

        // #endregion

    }
}());
