console.log("--stormpath alter user--");
console.log("--stormpath alter user--");
console.log("--stormpath alter user--");
console.log("--stormpath alter user--");

// Script run monthly to notify admins via email about upcoming and over due reviews.
var winston = require('winston');
var config = require('../config/config');
var stormpath = require('stormpath');
var logger = new (winston.Logger)({
    datePattern: config.logging.datePattern,
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.logging.filePath + 'stormpathAlterUser.log', maxsize: config.logging.maxsize, maxFiles: config.logging.maxFiles})
    ]
});
 var stormpathApiKey = new stormpath.ApiKey(
        config.stormpath.STORMPATH_API_KEY_ID,
        config.stormpath.STORMPATH_API_KEY_SECRET
    );
var spClient = new stormpath.Client({ apiKey: stormpathApiKey });

var currentEmail = 'matthew.s.schmitz@gmail.com'
var currentPassword = "Review$123";

//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
//var dbUri = config.mongo.dbUri;
//var EmployeesColl = require(__dirname + "/../app/models/Employee.js");
//mongoose.connect(dbUri);
//var adminRules = {upcomingReview : 200};
//var defaultPassword = "Review$123";

//TODO: CHECK AND HANDLE FOR UNIQUE EMAIL!
try{
    var stormpathApp = spClient.getApplication(config.stormpath.STORMPATH_APP_HREF, function(err, spApp) {
        if (err) {
            logger.error("stormpath failed (Getting StormpathApp) error: " + err);
            //res.status(500).send(config.responses.error);
            //throw err;
        }
        else{
            logger.info("stormpath got StormpathApp successfully.");
//            try{
                spApp.authenticateAccount({
                  username: currentEmail,
                  password: currentPassword,
                }, function (err, result) {
                    if (err) {
                        logger.error("Error Registering user email: " + emp.email + " & error: " + err);
                    }
                    else{
                        result.getAccount(function(err, account) {
                            if (err) throw err;
//                            account.email = "Matthew.S.Schmitz@gmail.com";
//                            account.username= "Matthew.S.Schmitz@gmail.com";
                                console.log(account.email);
//                            account.save(function(err) {
//                                console.log(account);
//                            });
                        });
                    }
                });
                console.log("");
//            }
//            catch (spEx){
//                console.log("stormpath exception: " + spEx);
//
//            }
        }
    });
}
catch(appEx){
    logger.error("Exception stormpathAlterUser: " + appEx)
}