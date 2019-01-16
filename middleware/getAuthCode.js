const fs = require('fs');
var path = require('path')
var https = require('https');
var qs = require('querystring');

function getAuthCode(access_token) {
  console.log(access_token);
  return new Promise((resolve, reject) => {
    // 读取文件数据
    let imgData = fs.readFileSync(path.resolve(__dirname+'/../authCode.png')).toString('base64');

    var postData = qs.stringify({
      image: imgData
    })
    var options = {
      hostname: 'aip.baidubce.com',
      path: '/rest/2.0/ocr/V1/numbers?access_token=' + access_token,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    };

    var req = https.request(options, function(res) {
      var data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        var numbers = JSON.parse(data).words_result[0].words
        resolve(numbers)
        console.log('破解验证码:', numbers);


      })
    });
    // 携带数据发送https请求
    req.write(postData);
    req.end();
  })
}

module.exports = getAuthCode