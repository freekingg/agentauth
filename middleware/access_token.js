var https = require('https');
var qs = require('querystring');

const param = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': 'w9d3NhUmPEZkglwi0rvDTxmM',
    'client_secret': 'k6GlGRogp4NocVjQIoBpIM1HqL9U10fH'
});

function getToken(){
    return new Promise((resolve, reject) => {
        https.get({
            hostname: 'aip.baidubce.com',
            path: '/oauth/2.0/token?' + param,
            agent: false
        }, function (res) {
            var data = ''
            res.on('data', (res) => {
                data += res
            })
            res.on('end', (res) => {
                var access_token = JSON.parse(data).access_token
                resolve(access_token)
            })
        })
    })
}

module.exports =  getToken
