console.log("bulk stormpath user creation.js");

// Script run monthly to notify admins via email about upcoming and over due reviews.
var winston = require('winston');
var config = require('../config/config');
var stormpath = require('stormpath');
var logger = new (winston.Logger)({
    datePattern: config.logging.datePattern,
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.logging.filePath + 'monthlyNotifications.log', maxsize: config.logging.maxsize, maxFiles: config.logging.maxFiles})
    ]
});
 var stormpathApiKey = new stormpath.ApiKey(
        config.stormpath.STORMPATH_API_KEY_ID,
        config.stormpath.STORMPATH_API_KEY_SECRET
    );
var spClient = new stormpath.Client({ apiKey: stormpathApiKey });

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbUri = config.mongo.dbUri;
var EmployeesColl = require(__dirname + "/../app/models/Employee.js");

mongoose.connect(dbUri);

var adminRules = {upcomingReview : 200};
    var defaultPassword = "Review$123";

try{
    //var spApp;


    var db = mongoose.connection;
    db.on('error', function(cb){
            logger.error("Error connecting to Mongo DB: " + cb);
        }
    );
    db.once('open', function (callback) {
        logger.info("MongoDB One Time Connection Established!")
        var stormpathApp = spClient.getApplication(config.stormpath.STORMPATH_APP_HREF, function(err, spApp) {
        if (err) {
            logger.error("Register user. Email: " + emp.email + " failed (Getting StormpathApp) error: " + err);
            //res.status(500).send(config.responses.error);
            //throw err;
        }
        else{
            logger.info("Registration got StormpathApp successfully.");
//            spApp = spApp;
//            console.log(spApp)

        EmployeesColl.find({uid: { $eq: null } },function (err, employees) {
            if (err) {
                logger.error("Error getting employees: " + err);
                //res.status(500).send(config.responses.error);
            }
            else{
                logger.info('Found (%s) Employees. ', employees.length);

                var count = 1;
                employees.forEach(function(emp, ind){
                    console.log(emp._id);

//                    var newEmployee = {};
//                    newEmployee.isAdmin = emp.isAdmin;
//                    newEmployee.active= emp.active;
//                    newEmployee.firstName= emp.firstName;
//                    newEmployee.lastName = emp.lastName;
//                    newEmployee.email= emp.email;
//                    newEmployee.employeeName= emp.employeeName;
//                    newEmployee.hireDate = emp.hireDate;
//                    newEmployee.nextReviewDate = emp.nextReviewDate;
//                    newEmployee.lastReviewDate = emp.lastReviewDate;
//                    newEmployee.supervisor = emp.supervisor;
//                    newEmployee.location = emp.location;
//                    newEmployee.role = emp.role;
//                    newEmployee.hrRep = emp.hrRep;
//                    newEmployee.hasReports = emp.hasReports;
//                    newEmployee.supervisorName = emp.supervisorName;
//                    newEmployee.locationName = emp.locationName;
//                    newEmployee.roleName = emp.roleName;
//                    newEmployee.hrRepName = emp.hrRepName;
//                    newEmployee.isHR = emp.isHR;
//                    logger.info('Creating Employee Data: %s', JSON.stringify(emp));
                    logger.info('Creating Stormpath Employee Data: %s', emp.email);

                    try{
//                        count ++;


                        spApp.createAccount({
                          givenName: emp.firstName,
                          surname: emp.lastName,
                          username: emp.username,
                          email: emp.email,
                          password: defaultPassword,
                        }, function (err, createdAccount) {
                            if (err) {
                                logger.error("Error Registering user email: " + emp.email + " & error: " + err);
                                //logger.debug(err);
                                //res.status(err.status).send({error: err.userMessage});

                                var updateEmployeeId = emp._id;
                                spApp.authenticateAccount({
                                  username: emp.email,
                                  password: defaultPassword,
                                }, function (err, result) {
                                    logger.debug("Authentication results: " + result);
                                    if (err) {
                                        logger.error("Authentication failed: " + err);
                                    }
                                    else{
                                        logger.info('Authenticated user email = ' + emp.email + ".");
                                        var returnedAccount = result.account;
                                        var userId = returnedAccount.href.substring(38);
                                        emp.uid = userId;
                                        EmployeesColl.update({_id: updateEmployeeId}, emp, { multi: true }, function callback (err, docResults) {
                                            if (err) {
                                                logger.error("Error creating new employee: " + err);
                                                throw new Error('Error creating new employee. ' + err);
                                            }
                                            else{
                                                logger.info('Updated employee. ' + updateEmployeeId);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                logger.info('Registered user email = ' + emp.email  + ".");
                                logger.debug('Created Account: ' + JSON.stringify(createdAccount));
                                logger.info('Creating Mongo Doc for user email = ' + emp.email  + ".");
                                var userId = createdAccount.href.substring(38);
                                //emp.uid = userId;
                                emp.uid = userId;
                                console.log(emp.uid)
                                var updateEmployeeId = emp._id;
                                EmployeesColl.update({_id: updateEmployeeId}, emp, { multi: true }, function callback (err, docResults) {
                                    if (err) {
                                        logger.error("Error creating new employee: " + err);
                                        throw new Error('Error creating new employee. ' + err);
                                    }
                                    else{
                                        logger.info('Updated employee. ' + updateEmployeeId);
                                    }
                                });
                            }
                        });
                        console.log("");
                    }
                    catch (spEx){
                        console.log("exception here in spex: " + spEx);

                    }

                });
                //mongoose.connection.close()

                logger.info('Found (%s) Employees. ', employees.length);
            }
        }).limit(100);

        }

    });

    });
}
catch(dbEx){
    logger.error("Exception connecting to Mongo DB: " + dbEx)
}