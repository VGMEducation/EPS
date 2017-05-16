//console.log("hrTool events");
'use strict';

try {
     angular.module('hrTool').service("hrTool.events",function($rootScope) {


         this.broadcast = function() {$rootScope.$broadcast("alertMessageEvent")};
         var messageText = "message root text";
         this.broadcastAlert = function(msgData) {
//            $rootScope.$broadcast("alertMessageEvent", {type: "success", msg: messageText})
            $rootScope.$broadcast("alertMessageEvent", msgData);
//            console.log("broadcastedAlert");
        }


        this.broadcastAlertError = function(messageText) {
            $rootScope.$broadcast("alertMessageEvent", {type: "error", msg: messageText});
        }

        this.broadcastAlertWarning = function(messageText) {
            $rootScope.$broadcast("alertMessageEvent", {type: "warning", msg: messageText});
        }

        this.broadcastAlertSuccess = function(messageText) {
            $rootScope.$broadcast("alertMessageEvent", {type: "success", msg: messageText});
        }

        //$rootScope.$broadcast("alertMessageEvent", {type: "success", msg: messageText});

         this.listen = function(callback) {$rootScope.$on("alertMessageEvent",callback)}

        this.showSpinner = function(args) {
            $rootScope.$broadcast("showSpinnerEvent", args);
        }

        this.loginEvent = function(args) {
            $rootScope.$broadcast("loginEvent", args);
        }

        this.uploadEvent = function(args) {
            $rootScope.$broadcast("uploadEvent", args);
        }

        this.modalEvent = function(args) {
            $rootScope.$broadcast("modalEvent", args);
        }

        this.printReviewEvent = function(args) {
            $rootScope.$broadcast("printReviewEvent", args);
        }
     });

//    console.log("events events events events");

}
catch (hrToolEventsException){
    console.log("hrToolEventsException " + hrToolEventsException);
}