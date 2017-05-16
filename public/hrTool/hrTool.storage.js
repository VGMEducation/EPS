//console.log("hrTool storage");
'use strict';

try {
     angular.module('hrTool').service("hrTool.storage", ['$sessionStorage', 'hrTool.events', '$log', 'config', 'jwtHelper',  function($sessionStorage, hrToolEvents, logger, config, jwtHelper) {
        var storage;
        var baseStoragePath =  "hrTool.";
        var jwtTokenKey = "jwt";
//        var userStoragePath = "user";
//        var userStoragePath = "profile";
        var userStoragePath = config.user_info_path;
        //var jwtTokenPath = baseStoragePath + userStoragePath + "." + jwtTokenKey;

        storage = $sessionStorage;

        this.getStorage = function(dataPath){
            var dataPath = baseStoragePath+ dataPath;
           // console.log("getStorage " + dataPath);
            var storageData = {};
            storageData = storage[dataPath];;
            return storageData;
        };

        this.setStorage = function(dataPath, storageData){
            var dataPath = baseStoragePath + dataPath;
//            console.log("setStorage " + dataPath);
            storage[dataPath] = storageData;
            return true;

        };


//        this.updateUserStorage = function(dataPath, newStorageData){
//            var dataPath = baseStoragePath + userStoragePath + "."+ dataPath;
////            console.log("updateUserStorage: " + dataPath)
////            var currentUserStorage = storage[(baseStoragePath + userStoragePath)];
////            currentUserStorage[dataPath] = newStorageData;
////            console.log(currentUserStorage)
////            console.log(currentUserStorage[dataPath])
//             storage[dataPath] = newStorageData;
//            return true;
//        };

        this.deleteStorage = function(dataPath){
//            console.log("deleteStorage");
            var dataPath = baseStoragePath + dataPath;
            delete storage[dataPath];
            return true;
        };

        this.deleteAllStorage = function(dataPath){
//            console.log("deleteAllStorage");
            storage.$reset();
            return true;
        };

        this.isLoggedIn = function(){
            var loggedInStatus = false;
            try{
//                console.log('isLoggedIn')
//                console.log(jwtHelper)
    //            console.log(hrToolEvents)
    //            console.log($sessionStorage)
                var userStorageP = baseStoragePath + userStoragePath
    //            console.log(userStorageP)
                var jwtToken = storage[userStorageP][jwtTokenKey];
    //	        console.log(jwtTokenPath);
    //	        console.log(jwtTokenKey);
    //	        console.log(typeof jwtToken);
    //	        console.log(typeof jwtToken != 'undefined');
//    	        console.log(jwtToken);

                if (typeof jwtToken !== 'undefined'){
//    	            console.log(" 1 notejwtToken");
                    if (!jwtHelper.isTokenExpired(jwtToken)){
//                        logger.info("!hrTool.storage !tokenExpired");
                        loggedInStatus = true;
                    }
                    else{
//                        logger.warn("hrTool.storage tokenExpired");
                    }
                }
            }
            catch (isLoggedInEx){
                logger.warning("hrTool.storage !loggedInStatus: " + isLoggedInEx);
            }
            finally{
//                console.log("loggedInStatus " + loggedInStatus);
                if (!loggedInStatus){
//                    hrToolEvents.broadcastAlertWarning("User is being logout due to timeout...")
                    this.logoutUser();
                }
                return loggedInStatus;
            }
        };

        this.loginUser = function(userData){
            //console.log("logging in user storgae")
            return this.setStorage(userStoragePath, userData);
        };

        this.logoutUser = function(){
            //console.log("logoutUser in user storgae")
            return this.deleteAllStorage();
        };

        this.setLastUpload = function(file) {
//            console.log("setLastUpload")
//            console.log(file)
            this.setStorage("lastUpload", file);
        };

        this.getLastUpload = function(file) {
            return this.getStorage("lastUpload", file);
        };


     }]);
}
catch (hrToolStorageException){
    console.log("hrToolStorageException " + hrToolStorageException);
    //return false;
}