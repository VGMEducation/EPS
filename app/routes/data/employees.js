// employees.js
var async = require('async');
var stormpath = require('stormpath');
var okta = require('@okta/okta-sdk-nodejs');
var winston = require('winston');
var http = require('http');
var https = require('https');
var request = require('request');

module.exports = function(config, db, logger, router, aws) {
    logger.info('Employees.js');

    var AdminAccounts = db.models.AdminAccount;
    var Employees = db.models.Employee;
    var EmployeeInfo = db.models.EmployeeInfo;

    var adminAccountsQuery = { settingName: "adminAccounts" };

    var stormpathApiKey = new stormpath.ApiKey(
        config.stormpath.STORMPATH_API_KEY_ID,
        config.stormpath.STORMPATH_API_KEY_SECRET
    );
    var spClient = new stormpath.Client({ apiKey: stormpathApiKey });

    var oktaClient = new okta.Client({
        orgUrl: config.okta.OKTA_CLIENT_ORGURL,
        token: config.okta.OKTA_CLIENT_TOKEN
    });
    logger.info("oktaClient: (%s)", oktaClient);

    var defaultPassword = config.defaults.defaultPassword;
    var defaultOriginEmail = config.defaults.defaultOriginEmail;
    var defaultDestinationSalaryEmails = config.defaults.defaultDestinationSalaryEmails;

    var defaultOutboundEmailUser = config.defaults.defaultOutboundEmailUser;
    var defaultOutboundEmailPassword = config.defaults.defaultOutboundEmailPassword;


    logger.add(winston.transports.File, {
        name: 'employees',
        filename: config.logging.filePath + 'routes.data.employees.log',
        maxsize: config.logging.maxsize,
        maxFiles: config.logging.maxFiles,
        colorize: 'true',
        timestamp: true
    });

    var updateAdminAccountInfo = function(employeeId, newEmail, newFullName) {
        var adminAccountsFilter = 'employees locations';
        logger.info("updateAdminAccountInfo - employeeId: (%s).", employeeId);
        EmployeeInfo.findOne({ uid: employeeId }, function(err, employeeDoc) {
            var userId = employeeDoc._id;
            AdminAccounts.findOne(adminAccountsQuery, function(err, theAdminAccounts) {
                if (err) {
                    logger.error("Getting Admin Accounts - Error: (%s).", err);
                    res.status(404).send(config.responses.dataError);
                } else {
                    var isCorpAdmin = false;
                    var isFacilityAdmin = false;
                    theAdminAccounts.corporateAdmins.forEach(function(corpAdmin) {
                        if (corpAdmin._id == userId) {
                            isCorpAdmin = true;
                            logger.info("updateAdminAccountInfo - isCorpAdmin: (%s).", userId);
                            corpAdmin.email = newEmail;
                            corpAdmin.employeeName = newFullName;
                        }
                    });

                    theAdminAccounts.facilityAdmins.forEach(function(facAdminLoc) {
                        if (facAdminLoc._id == userId) {
                            isFacilityAdmin = true;
                            logger.debug("updateAdminAccountInfo - isFacilityAdmin: (%s).", userId);
                            facAdminLoc.email = newEmail;
                            facAdminLoc.employeeName = newFullName;
                        }
                    });

                    if (!isCorpAdmin || !isPayroll) {
                        logger.info('No updated needed. Not a Corp Admin or Payroll employee. updateAdminAccountInfo.');
                    } else {
                        var upsertData = {
                            corporateAdmins: theAdminAccounts.corporateAdmins,
                            facilityAdmins: theAdminAccounts.facilityAdmins
                        };

                        AdminAccounts.update(adminAccountsQuery, upsertData, { upsert: true }, function callback(err, updatedAdminAccountDoc) {
                            if (err) {
                                logger.error("Error Updating Admin Accounts - Error updateAdminAccountInfo: (%s).", err);
                            } else {
                                logger.info('Updated Admin Account - updateAdminAccountInfo.');
                            }
                        });
                    }
                }
            });
        });
    }


    var getAdminAccountInfo = function(employeeId, callback) {
        logger.info("getAdminAccountInfo - employeeId: (%s).", employeeId);
        EmployeeInfo.findOne({ uid: employeeId }, function(err, employeeDoc) {
            var userId = employeeDoc._id;
            AdminAccounts.findOne(adminAccountsQuery, function(err, theAdminAccounts) {
                if (err || !employeeDoc) {
                    logger.error("getAdminAccountInfo - Error: (%s).", err);
                    callback(null, { isCorpAdmin: false, facilityAdminLocations: [], currentEmployeeId: "" });
                } else {
                    logger.info("getAdminAccountInfo - Found Admin Account for employeeId: (%s).", employeeId);
                    var isCorpAdmin = false;
                    var isPayroll = false;
                    theAdminAccounts.corporateAdmins.forEach(function(corpAdmin) {
                        if (corpAdmin._id == userId) {
                            isCorpAdmin = true;
                            logger.info("getAdminAccountInfo - isCorpAdmin: (%s).", isCorpAdmin);
                        }
                    });
                    var facilityAdminLocations = [];
                    theAdminAccounts.facilityAdmins.forEach(function(facAdminLoc) {
                        if (facAdminLoc._id == userId) {
                            facilityAdminLocations.push(facAdminLoc.locationId.toString());
                            if (facAdminLoc.hasOwnProperty('isPayroll')) {
                                if (facAdminLoc.isPayroll) {
                                    isPayroll = true;
                                    logger.debug("getAdminAccountInfo - isPayroll: (%s).", isPayroll);
                                }
                            }
                        }
                    });
                    logger.info("getAdminAccountInfo ", JSON.stringify({ isCorpAdmin: isCorpAdmin, facilityAdminLocations: facilityAdminLocations }));
                    callback(null, { isCorpAdmin: isCorpAdmin, facilityAdminLocations: facilityAdminLocations, currentEmployeeId: userId, isPayroll: isPayroll });
                }
            });
        });
    };

    router.get('/employees', function(req, res) {
        try {
            function getSelectEmployees(adminAccountInfo) {
                logger.info('Getting Admin Employees Data.');
                var supervisorId = adminAccountInfo.currentEmployeeId;
                var employeeQuery = {};
                if (adminAccountInfo.isCorpAdmin) {
                    logger.info("isCorpAdmin - display all");
                } else {
                    if (adminAccountInfo.facilityAdminLocations.length > 0) {
                        employeeQuery = { $or: [{ 'supervisor': supervisorId }, { location: { $in: adminAccountInfo.facilityAdminLocations } }] };
                    } else {
                        employeeQuery = { 'supervisor': supervisorId };
                    }
                }
                Employees.find(employeeQuery, function(err, employees) {
                    if (err || !employees) {
                        logger.error("Error getting employees: " + err);
                        res.status(500).send(config.responses.error);
                    } else {
                        logger.info('Found (%s) Employees. ', employees.length);
                        if (employees.length <= 0) {
                            res.status(404).send(config.responses.dataError);
                        } else {
                            var isPayroll = false;
                            if (adminAccountInfo.hasOwnProperty('isPayroll')) {
                                if (adminAccountInfo.isPayroll == true) {
                                    isPayroll = true;
                                }
                            }
                            var employeesResults = { isPayroll: isPayroll, employees: employees };
                            res.send({ results: employeesResults });
                        }
                    }
                });
            };

            async.waterfall([
                async.apply(getAdminAccountInfo, req.headers.uid),
                getSelectEmployees
            ], function(err, result) {
                logger.error("/employees - (async err): " + err)
                res.status(500).send(config.responses.error);
            });
        } catch (employeesEx) {
            logger.error("/employees - employeesEx: " + employeesEx);
            res.status(500).send(config.responses.serverError);
        }
    });

    router.post('/employees/save', function(req, res) {
        try {
            var updateEmployee = {};
            updateEmployee.isAdmin = req.body.isAdmin;
            updateEmployee.active = req.body.active;
            updateEmployee.firstName = req.body.firstName;
            updateEmployee.lastName = req.body.lastName;
            updateEmployee.email = req.body.email;
            updateEmployee.employeeName = req.body.employeeName;
            updateEmployee.hireDate = req.body.hireDate;
            updateEmployee.nextReviewDate = req.body.nextReviewDate;
            updateEmployee.lastReviewDate = req.body.lastReviewDate;
            updateEmployee.supervisor = req.body.supervisor;
            updateEmployee.location = req.body.location;
            updateEmployee.role = req.body.role;
            updateEmployee.hrRep = req.body.hrRep;
            updateEmployee.hasReviewAccess = req.body.hasReviewAccess;
            updateEmployee.hasReports = req.body.hasReports;
            updateEmployee.supervisorName = req.body.supervisorName;
            updateEmployee.locationName = req.body.locationName;
            updateEmployee.roleName = req.body.roleName;
            updateEmployee.hrRepName = req.body.hrRepName;
            updateEmployee.isHR = req.body.isHR;

            var emailHasChanged = req.body.emailHasChanged;

            var updateEmployeeId = req.body._id;
            var uid = req.headers.uid;
            var updateUserUid = req.body.uid;
            console.log(updateUserUid);
            var newEmail = req.body.email;
            var newFullName = req.body.firstName + " " + req.body.lastName;

            logger.info('Saving Admin Employee Data User-Id: (%s).', updateUserUid);
            //                logger.info('Update Employee Data: %s', JSON.stringify(updateEmployee));
            Employees.update({ _id: updateEmployeeId }, updateEmployee, { multi: true }, function callback(err, docResults) {
                if (err) {
                    logger.error("Error Updating Employee: (%s).", err);
                    res.status(404).send(config.responses.dataError);
                } else {
                    //                       logger.info('Employee Updated. (%s) %s', updateEmployeeId, JSON.stringify(docResults));
                    logger.info('Employee Updated (%s).', updateEmployeeId);

                    //TODO: Limit Calls
                    //                        console.log(emailHasChanged)
                    if (!emailHasChanged) {
                        updateAdminAccountInfo(updateUserUid, newEmail, newFullName);
                        res.send({ results: true });
                    } else {
                        try {

                            var saveuserurl = oktaClient.baseUrl + '/api/v1/users/';
                            var options = {
                                method: 'POST',
                                url: saveuserurl + updateUserUid,
                                headers: {
                                    'cache-control': 'no-cache',
                                    authorization: config.okta.authorization,
                                    'content-type': 'application/json',
                                    accept: 'application/json'
                                },
                                body: {
                                    profile: {
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        email: newEmail,
                                        login: newEmail
                                    }
                                },
                                json: true
                            };

                            console.log(options);

                            request(options, function(error, response, body) {
                                if (err) {
                                    logger.error("Error updating employee: " + err);
                                    throw new Error('Error creating new employee. ' + err);
                                } else {
                                    logger.info("Email Update for (%s) Successful.");
                                    updateAdminAccountInfo(updateUserUid, newEmail, newFullName);
                                    res.send({ results: true });
                                }
                            });
                        } catch (appEx) {
                            logger.error("Exception StormpathAlterUser: (%s),", appEx);
                            //res.send({results: true});
                            throw new Error("Exception StormpathAlterUser: " + appEx);
                        }
                    }
                }
            });
        } catch (employeesSaveEx) {
            logger.error("/employees/save - employeesSaveEx: " + employeesSaveEx);
            res.status(500).send(config.responses.serverError);
        }

    });

    router.post('/employees/new', function(req, res) {
        try {

            oktaClient.getUser(req.body.email).then(oktaUser => {
                res.status(404).send({ error: "User exists." });
            }, function(err) {

                logger.info('Admin Creating New Employee Data.');
                var newEmployee = {};
                newEmployee.isAdmin = req.body.isAdmin;
                newEmployee.active = req.body.active;
                newEmployee.firstName = req.body.firstName;
                newEmployee.lastName = req.body.lastName;
                newEmployee.email = req.body.email;
                newEmployee.employeeName = req.body.employeeName;
                newEmployee.hireDate = req.body.hireDate;
                newEmployee.nextReviewDate = req.body.nextReviewDate;
                newEmployee.lastReviewDate = req.body.lastReviewDate;
                newEmployee.supervisor = req.body.supervisor;
                newEmployee.location = req.body.location;
                newEmployee.role = req.body.role;
                newEmployee.hrRep = req.body.hrRep;
                newEmployee.hasReports = req.body.hasReports;
                newEmployee.supervisorName = req.body.supervisorName;
                newEmployee.locationName = req.body.locationName;
                newEmployee.roleName = req.body.roleName;
                newEmployee.hrRepName = req.body.hrRepName;
                newEmployee.isHR = req.body.isHR;
                newEmployee.hasReviewAccess = req.body.hasReviewAccess;
                newEmployee.newPassword = req.body.newPassword;
                //            logger.info('Creating Employee Data: %s', JSON.stringify(newEmployee));
                logger.info('Creating Employee Data: %s.', newEmployee.email);

                var newuserurl = oktaClient.baseUrl + '/api/v1/users';
                var options = {
                    method: 'POST',
                    url: newuserurl,
                    qs: { activate: 'true' },
                    headers: {
                        'cache-control': 'no-cache',
                        authorization: config.okta.authorization,
                        'content-type': 'application/json',
                        accept: 'application/json'
                    },
                    body: {
                        profile: {
                            firstName: newEmployee.firstName,
                            lastName: newEmployee.lastName,
                            email: newEmployee.email,
                            login: newEmployee.email,
                        },
                        credentials: { password: { value: newEmployee.newPassword } }
                    },
                    json: true
                };

                request(options, function(error, response, body) {
                    if (error) {
                        throw new Error(error);
                        logger.error("Error Registering user email: " + newEmployee.email + " & error: " + error);
                        res.status(error.status).send({ error: error.userMessage });
                    } else {
                        logger.info('Registered user email = ' + newEmployee.email + ".");
                        logger.info('Creating Mongo Doc for user email = ' + newEmployee.email + ".");
                        var userId = body.id;
                        newEmployee.uid = userId;
                        var assignappurl = oktaClient.baseUrl + '/api/v1/apps/' + config.okta.clientId + '/users';
                        var options = {
                            method: 'POST',
                            url: assignappurl,
                            headers: {
                                'cache-control': 'no-cache',
                                authorization: config.okta.authorization,
                                'content-type': 'application/json',
                                accept: 'application/json'
                            },
                            body: {
                                id: userId,
                                scope: 'USER',
                                credentials: {
                                    userName: newEmployee.email,
                                    password: { value: newEmployee.newPassword }
                                }
                            },
                            json: true
                        };

                        request(options, function(error, response, body) {
                            if (error) {
                                logger.error("Error adding new employee to OKTA application: " + error);
                                throw new Error(error);
                            } else {
                                logger.info("new employee added to OKTA application: " + error);
                            }
                        });
                        Employees.create(newEmployee, function callback(err, newEmployeeDoc) {
                            if (err) {
                                logger.error("Error creating new employee: " + err);
                                throw new Error('Error creating new employee. ' + err);
                            } else {
                                logger.info('Created new employee. ' + newEmployeeDoc);
                                res.send({ results: newEmployeeDoc });
                            }
                        });
                    }
                });
            });

        } catch (employeesNewEx) {
            logger.error("/employees/new - employeesNewEx: " + employeesNewEx);
            res.status(500).send(config.responses.serverError);
        }
    });

    return router;
};