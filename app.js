const Koa = require('koa');
const KoaRouter = require('koa-router');

const app = new Koa();

let router = new KoaRouter();

router.use('/agentAuth',require('./routes/api/agent'))
// router.use('/search',require('./routes/api/search'))
/*启动路由*/
app.use(router.routes())
  .use(router.allowedMethods());


app.listen(3000,()=>{
  console.log(`server started on http://localhost:3000`);
});