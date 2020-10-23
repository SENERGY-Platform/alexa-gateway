/*
 *  Copyright 2020 InfAI (CC SES)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const superagent = require('superagent');
const SenergyApiUrl = 'https://api.senergy.infai.org';

class ProcessHelper {
    static findProcessByName(name, token, callback)  {
        let start = new Date();
        superagent.get(SenergyApiUrl + '/api-aggregator/processes?maxResults=3&firstResult=0&nameLike=%25' + name + '%25')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                console.log('Retrieving deployments, code: ' + res.status + ', took ' + (new Date().getTime() - start.getTime()) + 'ms');
                if (res.status > 299) {
                    callback([], 'Laden der Prozesse mit Code ' + res.status + ' fehlgeschlagen.')
                } else {
                    if (res.body == null) {
                        res.body = [];
                    }
                    console.log('Found ' + res.body.length + ' processes')
                    callback(res.body, null)
                }
            }).catch((e) => {
            console.error(e);
            callback([], 'Unerwarteter Fehler aufgetreten: Konnte Prozessliste nicht lesen');
        });
    }

    static startProcess(id, parameter, token, callback) {
        let start = new Date();
        const queryParts = [];
        parameter.forEach((value, key) => {
            queryParts.push(key + '=' + encodeURIComponent(JSON.stringify(value)));
        });
        superagent.get(SenergyApiUrl + '/process/engine/deployment/' + id + '/start?' + queryParts.join('&'))
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                console.log('Starting Process, code: ' + res.status + ', took ' + (new Date().getTime() - start.getTime()) + 'ms');
                if (res.status < 299) {
                    callback(null)
                } else {
                    callback('Prozess konnte nicht gestartet werden. Code: ' + res.status)
                }

            }).catch((e) => {
            console.error(e);
            callback('Unerwarteter Fehler aufgetreten: Konnte Prozess nicht starten');
        });
    }

    static findRunningProcessByName(name, token, callback) {
        let start = new Date();
        superagent.get(SenergyApiUrl + '/process/engine/history/unfinished/process-instance/processDefinitionNameLike/' + name + '/3/0/startTime/desc')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                console.log('Retrieving deployed processes, code: ' + res.status + ', took ' + (new Date().getTime() - start.getTime()) + 'ms');
                if (res.status > 299) {
                    callback(null, 'Laden der deployten Prozesse mit Code ' + res.status + ' fehlgeschlagen.')
                } else {
                    callback(res.body, null)
                }
                    }).catch((e) => {
            console.error(e);
            callback(null, 'Unerwarteter Fehler aufgetreten: Konnte Liste der deployten Prozesse nicht lesen\'');
        });
    }

    static stopRunningProcess(id, token, callback) {
        let start = new Date();
        superagent.delete(SenergyApiUrl + '/process/engine/process-instance/' + id)
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                console.log('Stopping deployed process, code: ' + res.status + ', took ' + (new Date().getTime() - start.getTime()) + 'ms');
                if (res.status < 299) {
                    callback(null);
                } else {
                    callback('Prozess konnte nicht gestoppt werden. Code: ' + res.status);
                }

            }).catch((e) => {
            console.error(e);
            callback('Unerwarteter Fehler aufgetreten: Konnte Prozess nicht stoppen');
        });
    }
}

module.exports = ProcessHelper
