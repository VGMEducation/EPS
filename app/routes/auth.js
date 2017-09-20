// auth.js - handles routing necessary for auth and user management
var express = require('express');
var winston = require('winston');
var stormpath = require('stormpath');
var okta = require('@okta/okta-sdk-nodejs');
var http = require('http');
var https = require('https');
var request = require('request');

module.exports = function(config, db) {

    var EmployeeInfo = db.models.EmployeeInfo;

    //'use strict';
    winston.level = config.logging.level;
    var logger = new(winston.Logger)({
        datePattern: config.logging.datePattern,
        transports: [
            new(winston.transports.Console)({ timestamp: true }),
            new(winston.transports.File)({ filename: config.logging.filePath + 'routesAuth.log', maxsize: config.logging.maxsize, maxFiles: config.logging.maxFiles, timestamp: true })
        ]
    });
    var router = express.Router();

    var specialToken = config.specialToken;
    var jwtDefaultExpiration = config.jwtDefaultExpiration;
    var defaultRedirect = config.defaultRedirect;

    var oktaClient = new okta.Client({
        orgUrl: config.okta.OKTA_CLIENT_ORGURL,
        token: config.okta.OKTA_CLIENT_TOKEN
    });

    router.post('/login', function(req, res) {
        try {
            var email = req.body.email || '';
            var password = req.body.password || '';

            if (!email || !password) {
                logger.info('Email or Password not found.');
                res.status(400).send({ error: "Email and Password required." });
            }
            // Danny - beginning of new section
            console.log("------ okta login ------");
            oktaClient.getUser(email).then(oktaUser => {

                var loginurl = oktaClient.baseUrl + '/api/v1/authn';
                var options = {
                    method: 'POST',
                    url: loginurl,
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json'
                    },
                    body: {
                        username: email,
                        password: password
                    },
                    json: true
                };

                request(options, function(error, authResult, body) {
                    if (error) {
                        logger.error("Authentication failed: %s", JSON.stringify(error));
                        res.status(error.status).send({ error: error.userMessage });
                    } else if (authResult.statusCode != 200) {
                        logger.error("Invalid username or password. %s." + email);
                        res.status(404).send({ error: "Invalid username or password." });
                    } else {
                        var sessiontoken = body.sessionToken;
                        redirect_uri = config.okta.redirect_uri;
                        clientId = config.okta.clientId;
                        clientSecret = config.okta.clientSecret;
                        var uid = oktaUser.id;
                        console.log("-------------uid: (%s)" + uid);

                        var authurl = oktaClient.baseUrl + '/oauth2/v1/authorize';
                        var optionss = {
                            method: 'GET',
                            url: authurl,
                            qs: {
                                client_id: clientId,
                                response_type: 'code',
                                scope: 'openid offline_access',
                                redirect_uri: redirect_uri,
                                state: 'staticstate',
                                response_mode: 'fragment',
                                nonce: 'staticnonce',
                                sessionToken: sessiontoken

                            },
                            headers: {
                                'cache-control': 'no-cache',
                                'content-type': 'application/json',
                                accept: 'application/json'
                            }
                        };

                        request(optionss, function(error, response, body) {
                            if (error) throw new Error(error);
                            var rescode = response.request.uri.hash.split("&")[0].replace("#code=", "");
                            base64ClientIdSecret = new Buffer(clientId + ":" + clientSecret).toString('base64');

                            var tokenurl = oktaClient.baseUrl + '/oauth2/v1/token';
                            var options = {
                                method: 'POST',
                                url: tokenurl,
                                headers: {
                                    'content-type': 'application/x-www-form-urlencoded',
                                    'cache-control': 'no-cache',
                                    authorization: 'Basic' + base64ClientIdSecret,
                                    accept: 'application/json'
                                },
                                form: {
                                    grant_type: 'authorization_code',
                                    redirect_uri: redirect_uri,
                                    code: rescode
                                }
                            };

                            request(options, function(error, response, body) {
                                if (error) throw new Error(error);
                                var accessToken = JSON.parse(body).access_token;

                                var customAccount = {
                                    username: oktaUser.profile.login,
                                    email: oktaUser.profile.email,
                                    givenName: oktaUser.profile.firstName,
                                    middleName: '',
                                    surname: oktaUser.profile.lastName,
                                    fullName: oktaUser.profile.displayName,
                                    status: oktaUser.profile.status,
                                    createdAt: oktaUser.created,
                                    modifiedAt: oktaUser.lastUpdated,
                                    jwt: accessToken,
                                    uid: uid
                                };

                                EmployeeInfo.findOne({ uid: uid }, function(err, aUser) {
                                    if (err || !aUser) {
                                        logger.error("No User Account found in DB for User-Id: (%s)" + uid);
                                        res.status(404).send({ error: "No user data found for that email." });
                                    } else if (customAccount.email != email) {

                                        logger.error("Custom Account Returned: (%s). It does not match supplied email %s." + customAccount.email, email);
                                        res.status(404).send({ error: "No user data found for that email." });
                                    } else {
                                        logger.info("--------Custom Account Returned: (%s)" + customAccount.email);
                                        var userInfo = aUser.toObject();

                                        customAccount.location = userInfo.location;
                                        customAccount.employeeName = userInfo.employeeName;
                                        customAccount.firstName = userInfo.firstName;
                                        customAccount.lastName = userInfo.lastName;
                                        customAccount.active = userInfo.active;
                                        customAccount.text = userInfo.text;
                                        customAccount.hrRep = userInfo.hrRep;
                                        customAccount.isHR = userInfo.isHR;
                                        customAccount.supervisor = userInfo.supervisor;
                                        customAccount.role = userInfo.role;
                                        customAccount.lastReviewDate = userInfo.lastReviewDate;
                                        customAccount.nextReviewDate = userInfo.nextReviewDate;
                                        customAccount.supervisorName = userInfo.supervisorName;
                                        customAccount.locationName = userInfo.locationName;
                                        customAccount.roleName = userInfo.roleName;
                                        customAccount.hasReports = userInfo.hasReports;
                                        //                            customAccount.isAdmin = userInfo.isAdmin;
                                        //                            customAccount.isCustodian = userInfo.isCustodian;
                                        //                            customAccount.isCorporateAdmin = userInfo.isCorporateAdmin;
                                        //                            customAccount.isFacilityAdmin = userInfo.isFacilityAdmin;
                                        customAccount.hrRepName = userInfo.hrRepName;
                                        customAccount.createDate = userInfo.createDate;
                                        customAccount.hireDate = userInfo.hireDate;

                                        logger.info("Custom Account Returned: (%s). First: (%s). Last: (%s).", uid, customAccount.firstName, customAccount.lastName);
                                        res.send({ results: customAccount });
                                    }
                                });

                            });
                        });
                    }
                });
            }, function(err) {
                res.status(404).send({ error: "Couldn't find your Username." });
            });
        } catch (stormpathCreateEx) {
            logger.error("/login - Exception: (%s)", stormpathCreateEx)
            res.status(500).send(config.responses.error);
        }
    });

    router.post('/forgot', function(req, res) {
        try {
            var email = req.body.email || '';
            logger.info('Forgot Password Email: %s', email);
            oktaClient.getUser(email).then(oktaUser => {

                recoveryurl = oktaClient.baseUrl + '/api/v1/authn/recovery/password';
                var options = {
                    method: 'POST',
                    url: recoveryurl,
                    headers: {
                        'cache-control': 'no-cache',
                        'content-type': 'application/json',
                        accept: 'application/json'
                    },
                    body: { username: email, factorType: 'EMAIL' },
                    json: true
                };

                request(options, function(error, response, body) {
                    if (response.statusCode == 200) {
                        res.status(404).send({ error: "Email sent successfully." });
                    } else {
                        res.status(404).send({ error: "Something went wrong. Please contact your administrator" });
                    }
                });

            }, function(err) {
                res.status(404).send({ error: "Couldn't find your Username." });
            });

        } catch (stormpathForgotEx) {
            logger.error("/forgot - stormpathForgotEx: " + stormpathForgotEx)
            res.status(500).send(config.responses.error);
        }
    });

    router.post('/resetVerify', function(req, res) {
        try {
            var spToken = req.body.sptoken;
            logger.info('Forgot Password Verify SP-Token: %s.', spToken);
            if (!spToken) {
                logger.warn("Forgot Password Verify requires SP-Token.");
                res.status(404).send({ error: "Token is no longer valid." });
            } else {
                resetverifyurl = oktaClient.baseUrl + '/api/v1/authn/recovery/token';
                var options = {
                    method: 'POST',
                    url: resetverifyurl,
                    headers: {
                        'cache-control': 'no-cache',
                        authorization: config.okta.authorization,
                        'content-type': 'application/json',
                        accept: 'application/json'
                    },
                    body: { recoveryToken: spToken },
                    json: true
                };

                request(options, function(error, response, body) {
                    if (response.statusCode == 200) {
                        res.send(true);
                    } else {
                        res.status(404).send({ error: "Token is no longer valid." });
                    }
                });
            }
        } catch (stormpathResetVerifyEx) {
            logger.error("/resetVerify - stormpathResetVerifyEx: " + stormpathResetVerifyEx)
            res.status(500).send(config.responses.error);
        }
    });

    router.post('/reset', function(req, res) {
        try {
            var newPassword = req.body.password || '';
            var email = req.headers.referer.split("&")[1].replace("email=", "");

            console.log(newPassword);
            console.log(email);

            oktaClient.getUser(email).then(oktaUser => {
                reseturl = oktaClient.baseUrl + '/api/v1/users/' + oktaUser.id;
                var options = {
                    method: 'POST',
                    url: reseturl,
                    headers: {
                        'cache-control': 'no-cache',
                        authorization: config.okta.authorization,
                        'content-type': 'application/json',
                        accept: 'application/json'
                    },
                    body: { credentials: { password: { value: newPassword } } },
                    json: true
                };

                request(options, function(error, response, body) {
                    if (response.statusCode == 200) {
                        res.send(true);
                    } else {
                        res.status(404).send({ error: "Password requirements were not met. Your password must have at least 8 characters, a lowercase letter, an uppercase letter, a number, no parts of your username" });
                    }
                });
            }, function(err) {
                res.status(404).send({ error: "Couldn't find your Username" });
            });

        } catch (stormpathResetEx) {
            logger.error("/reset - stormpathResetEx: " + stormpathResetEx);
            res.status(500).send(config.responses.error);
        }
    });

    // Logout the user, then redirect to the home page.
    router.get('/logout', function(req, res) {
        req.session.destroy();
        req.logout();
        res.redirect('/');
    });

    return router;
};