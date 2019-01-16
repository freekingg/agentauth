const KoaRouter = require('koa-router');
let router = new KoaRouter();
const puppeteer = require('puppeteer');
const access_token = require('../../middleware/access_token');
const getAuthCode = require('../../middleware/getAuthCode');

/* 
  @url /agentAuth
  @desc 获取保险网站详细信息
  @params certNo 执业证书编号
*/

router.get('/', async (ctx) => {
  const params = ctx.query;
  console.log(params);
  // 获取百度orc：access_token
  const baidu_access_token = await access_token();
  const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", ]
  });

  const page = await browser.newPage();
	await page.goto('http://iir.circ.gov.cn/web/');
	await page.setViewport({
		width: 1920,
		height: 750
  });

  page.on('dialog', async dialog => {
		console.log('监听对话框');
    console.log(dialog.message());
    ctx.body = {
      code:2,
      msg:'出错,请再次尝试'
    }
    await dialog.dismiss();
  });
  
  // 截图
  await page.screenshot({
		path: 'authCode.png',
		clip: {
			x: 1300,
			y: 220,
			width: 200,
			height: 150
		}
	});

  // 通过执业证书编号查询
  if(params.certNo){
    console.log('本次通过执业证书编号查询',params.certNo);
    await page.focus('input[name=evelop_code]');
    await page.keyboard.sendCharacter(params.certNo);

  }else if(params.userName){
    console.log('本次通过姓名查询',params.userName);
    await page.focus('input[name=name]');
    await page.keyboard.sendCharacter(params.userName);
  }else{
    ctx.body = {
      code:2,
      msg:'不传参数,查个毛线'
    }
    await browser.close()
    return
  }
  // 获取验证码
  const authCode = await getAuthCode(baidu_access_token)
  // 输入验证码
  await page.focus('#valcode0');
  await page.keyboard.sendCharacter(authCode);

  await page.waitFor(3000);
  // 点击搜索按钮
  await page.click("img[src='images_new/button_cx.jpg']");
  var resultData = await getResult()

  function getResult(){
    return new Promise((resolve,reject)=>{
      browser.on('targetcreated', async (target) => {
        console.log(`Created target type ${target.type()} url ${target.url()}`);
        if (target.type() !== 'page') {
          return;
        }else{
          var pages = await target.page();
            const ksbm_bg = await pages.$('ul.xxxx2')
            
            if(ksbm_bg){
            const result = await pages.evaluate(() => {
              
              var data = {}
    
              data.name = document.querySelector('ul.xxxx2 tr:nth-child(1) td').innerText;
    
              data.sex = document.querySelector('ul.xxxx2 tr:nth-child(2) td').innerText;
    
              data.cardAafter4 = document.querySelector('ul.xxxx2 tr:nth-child(3) td').innerText;
    
              data.certification = document.querySelector('ul.xxxx2 tr:nth-child(4) td').innerText;
    
              data.status = document.querySelector('ul.xxxx2 tr:nth-child(5) td').innerText;
    
              data.isValid = document.querySelector('ul.xxxx2 tr:nth-child(6) td').innerText;
    
              data.certNo = document.querySelector('ul.xxxx2 tr:nth-child(7) td').innerText;
    
              data.expiryDate = document.querySelector('ul.xxxx2 tr:nth-child(8) td').innerText;
              
              data.BusinessScope = document.querySelector('ul.xxxx2 tr:nth-child(9) td').innerText;
    
              data.area = document.querySelector('ul.xxxx2 tr:nth-child(10) td').innerText;
    
              data.company = document.querySelector('ul.xxxx2 tr:nth-child(11) td').innerText;
    
              return data
            });

            console.log(result);
            resolve(result)

          }
            
            
        }
    
      })
    })
  }

  ctx.body = {
    code:0,
    data:resultData,
    msg:''
  }

  await browser.close()

})

module.exports = router.routes();