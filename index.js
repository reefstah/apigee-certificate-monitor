const ORGNAME = "";  // Org Name
const BASIC_AUTH = "";  // User Credentials
const HOST = "https://api.enterprise.apigee.com/v1/organizations";
const WEBHOOK = "";  //Slack Webhook URL
const GRACE_PERIOD = 7776000000;

const request = require('request-promise-native');
const {Observable, Subject, ReplaySubject, from, bindCallback, of, range, fromPromise, concatMap} = require('rxjs');

//Step 1 Get all the environments

var uri = HOST + "/" + ORGNAME + "/environments";

function getOptions(uri) {
    return {
        uri: uri,
        headers: {
            'Authorization': BASIC_AUTH,
            'Content-Type': 'application/json'
        },
        method: "GET"
    }
}

function getSlackOptions(uri, payload) {
    return {
        uri: uri,
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"text": JSON.stringify(payload)})
    }
}


function main(request) {

    return Observable
        .fromPromise(request(getOptions(uri)))
        .concatMap(envList => Observable.from(JSON.parse(envList)))
        .concatMap(env => Observable
            .fromPromise(request(getOptions(uri + "/" + env + "/keystores")))
            .concatMap(res => Observable.from(JSON.parse(res)))
            .concatMap(keystore => Observable
                .fromPromise(request(getOptions(uri + "/" + env + "/keystores/" + keystore + "/certs")))
                .concatMap(certList => Observable.from(JSON.parse(certList)))
                .concatMap(cert => Observable
                    .fromPromise(request(getOptions(uri + "/" + env + "/keystores/" + keystore + "/certs/" + cert)))
                )
                .map(certInfoList => JSON.parse(certInfoList))
                .map(certInf => ({
                    env: env,
                    subjectName: certInf.certInfo[0].subject,
                    expiry: certInf.certInfo[0].expiryDate
                }))
            ))
        .filter(cert => (cert.expiry - new Date()) < GRACE_PERIOD)
        //.map(cert => cert.certInfo[0].subject)
}

exports.main = main;

exports.handler = (event, context, callback) => {

    main(request)
        .subscribe((jsonData) => {
            console.log(jsonData);
            request(getSlackOptions(WEBHOOK, jsonData))
        });

};