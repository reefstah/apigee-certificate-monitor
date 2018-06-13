import test from 'ava';

const {toPromise} = require('rxjs');

import {main} from './index';

const sinon = require('sinon');


test('getTimedCertificates', t => {

    let stub = sinon.stub();

    stub
        .onFirstCall()
        .resolves(JSON.stringify(['env']));

    stub
        .onSecondCall()
        .resolves(JSON.stringify(['keystore']));

    stub
        .onThirdCall()
        .resolves(JSON.stringify(['cert']));

    stub
        .onCall(3)
        .resolves(JSON.stringify({
            certInfo: [
                {
                    subject: 'something',
                    expiryDate:
                        new Date()
                }]
        }));


    return main(stub)
        .toPromise()
        .then(() => t.pass())
        .catch(e => t.fail(e));
});