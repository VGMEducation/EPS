
// Script run monthly to notify admins via email about upcoming and over due reviews.
var winston = require('winston');
var async = require('async');
var config = require('../config/config');
var logger = new (winston.Logger)({
    datePattern: config.logging.datePattern,
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: config.logging.filePath + 'monthlyNotifications.log', maxsize: config.logging.maxsize, maxFiles: config.logging.maxFiles})
    ]
});
logger.info("Monthly Notificaitons.js - Started @(%s)", new Date());

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dbUri = config.mongo.dbUri;
var EmployeesColl = require(__dirname + "/../app/models/Employee.js");
var AdminAccountsColl = require(__dirname + "/../app/models/AdminAccount");
var SettingsColl = require(__dirname + "/../app/models/Setting");

mongoose.connect(dbUri);

var defaultOutboundEmailUser = config.defaults.defaultOutboundEmailUser;
var defaultOutboundEmailPassword = config.defaults.defaultOutboundEmailPassword;
var defaultPassword = config.defaults.defaultPassword;
var defaultOriginEmail = config.defaults.defaultOriginEmail;

var nodemailer = require('nodemailer');


var smtpConfig = 'smtps://' +  config.defaults.smtpUser  + ':' + config.defaults.smtpPass + '@' + config.defaults.smtpHost;
var transporter = nodemailer.createTransport(smtpConfig);

transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        logger.info('Email Server  Connection Established');
   }
});

var isOverDue =  function(aDate){
//    logger.info("isOverDue - aDate " + aDate);
    var overDue = false;
    var overDueDate = new Date().getTime();
    if (overDueDate >= aDate){
        overDue = true;
    }
    return overDue
};

var adminRules = {upcomingReview : 180};


var isUpcoming =  function(reviewDate){
    //logger.info("isUpcoming - aDate " + aDate);
    var upcomingDue = false;
    var ct = new Date().getTime();
    var upcomingDueDate = reviewDate - (adminRules.upcomingReview * 86400000);
//		logger.info("isUpcoming " + upcomingDueDate + "& reviewDate " + reviewDate +  " || " + (ct < reviewDate && reviewDate >= upcomingDueDate));
    if (ct < reviewDate && reviewDate >= upcomingDueDate && ct >= upcomingDueDate){
        upcomingDue = true;
    }
    return upcomingDue;
};

try{
    var db = mongoose.connection;
    db.on('error', function(cb){
            logger.error("Error connecting to Mongo DB: " + cb);
        }
    );

    db.once('open', function (callback) {
        logger.info("MongoDB One Time Connection Established!")

        function setUpcomingReviewThreshold (callback){
            logger.info("getLocationAdminEmails ");
            SettingsColl.findOne({ settingName: "rules"}, function (err, rulesSettings) {
                if (err) {
                    logger.error("Error getting settings: " + err);
                }
                else{
                    //logger.info('Found Settings Data. ' + JSON.stringify(rulesSettings));
                    logger.info('Found Settings Data.');
//                    logger.info(adminRules.upcomingReview);
                    adminRules.upcomingReview = rulesSettings.upcomingReview;
//                    logger.info(adminRules.upcomingReview);
                    callback(null);
                }
            });
        };

        function getLocationAdminEmails (callback){
            logger.info("getLocationAdminEmails ");
            AdminAccountsColl.findOne({ settingName: "adminAccounts"}, function (err, theAdminAccounts) {
                if (err) {
                    logger.error("Error getLocationAdminEmails: " + err);
                    callback(null, {facilityAdminEmails: {},corporateAdminEmails:[]});
                }
                else{
                    var facilityAdminEmails = {};
                    var corporateAdminEmails = [];
                    theAdminAccounts.corporateAdmins.forEach(function(corpAdmin) {
                        if (corporateAdminEmails.indexOf(corpAdmin.email) == -1) {
                            corporateAdminEmails.push(corpAdmin.email);
                        }
                    });

                    theAdminAccounts.facilityAdmins.forEach(function(facAdmin) {
                        if (!facilityAdminEmails.hasOwnProperty(facAdmin.locationId)){
                            //logger.info("new location " + facAdmin.locationId);
                            facilityAdminEmails[facAdmin.locationId] = [];
                        }
                        if (facilityAdminEmails[facAdmin.locationId].indexOf(facAdmin.email) == -1) {
                            facilityAdminEmails[facAdmin.locationId].push(facAdmin.email);
                        }
                    });
                    //console.log("corpadminemails " + JSON.stringify(theAdminAccounts.corporateAdmins));
                    logger.info("corporateAdminEmails [" + corporateAdminEmails + "]");
                    //logger.info("getLocationAdminEmails ", facilityAdminLocations);
                    logger.info("getLocationAdminEmails ", JSON.stringify(facilityAdminEmails));
                    callback(null, {facilityAdminEmails: facilityAdminEmails,corporateAdminEmails:corporateAdminEmails});
                }
            });
        };

        function findAndSendEmails(adminAccountEmails, callback){
            EmployeesColl.find({}, function (err, employees) {
                if (err) {
                    logger.error("Error getting employees: " + err);

                }
                else{
                    logger.info('Found (%s) Employees. ', employees.length);

                    EmployeesColl.aggregate([
                            {
                                $group: {
                                    _id: '$location',
    //                                users: {$push: '$employeeName'}
                                    employees: {$push: '$$ROOT'},
                                    count: { $sum: 1 }
                                }
                            }
                        ], function (err, employeesByLocation) {
                            if (err) {
                                logger.error("Exception grouping employees by location: " + err);
                            } else {
                                employeesByLocation.forEach(function(aLoc, ind){
                                    //logger.info();
                                    var currentLocationId = aLoc._id;
                                    if (aLoc._id){
                                        var currentLocationName = aLoc.employees[0].locationName;
                                        //logger.info("Location: " + aLoc.employees[0].locationName);
                                        var locationEmail = ("Location: " + currentLocationName + "\n");
                                        aLoc.employees.forEach(function(empAtLoc, ind){
                                            if (isOverDue(empAtLoc.nextReviewDate) ||  isUpcoming(empAtLoc.nextReviewDate)){
                                                //logger.info(empAtLoc.employeeName + " - isOverDue: " + isOverDue(empAtLoc.nextReviewDate) + " || isUpcoming: " +  isUpcoming(empAtLoc.nextReviewDate));
                                                locationEmail += ("-" + empAtLoc.employeeName + " : Next Review Due " + new Date(empAtLoc.nextReviewDate).toLocaleDateString() + " (" + empAtLoc.email + ") \n");
                                            }
                                        });
                                        //logger.info(locationEmail); // Location Email Preview

                                        var emailSubject = "Monthly Reviews Report - " + currentLocationName;
                                        var emailTextBody =  locationEmail;
                                        //var emailToAddresses = [defaultOriginEmail];
                                        var emailToAddresses =  adminAccountEmails.facilityAdminEmails[currentLocationId];
                                        if (typeof emailToAddresses != "undefined"){
                                            //emailToAddresses = emailToAddresses.concat(adminAccountEmails.corporateAdminEmails);
                                            adminAccountEmails.corporateAdminEmails.forEach(function(corpAdminEmail) {
                                                if (emailToAddresses.indexOf(corpAdminEmail) == -1) {
                                                    emailToAddresses.push(corpAdminEmail);
                                                }
                                            });
                                            //emailToAddresses = adminAccountEmails.facilityAdminEmails[currentLocationId].concat(adminAccountEmails.corporateAdminEmails);
                                        }
                                        else{
                                            emailToAddresses = adminAccountEmails.corporateAdminEmails;
                                        }

                                        logger.info("Location (%s) for Emails: [%s]", currentLocationName, emailToAddresses);
                                        if (typeof emailToAddresses != "undefined"){
                                            if (emailToAddresses.length>0){
                                               // Have Email Address to Send To
                                                var mailOptions = {
                                                    from: defaultOriginEmail,
                                                    to: emailToAddresses,
                                                    subject: emailSubject,
                                                    text: emailTextBody,
                                                    //html: ''
                                                };

                                                transporter.sendMail(mailOptions, function(error, info){
                                                    if(error){ logger.error('Monthly Reviews Message Not Sent: ' + JSON.stringify(error));}
                                                    else{ logger.info('Monthly Reviews Message Sent: ' + JSON.stringify(info));}
                                                });
                                            }
                                        }
                                    }
                                });
                                callback(null);

                            }
                        });
                }
            });
        }

        async.waterfall([
                setUpcomingReviewThreshold,
                getLocationAdminEmails,
                findAndSendEmails,
                function(arg1){
                    logger.info("Closing Mongoose Connection.")
                    mongoose.connection.close()
                }
            ]
            , function (err, result) {
               logger.error("/locations - locationsEx (async err): " + err)
            }
        );

    });
}
catch(dbEx){
    logger.error("Exception connecting to Mongo DB: " + dbEx)
}