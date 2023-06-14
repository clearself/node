const { decode } = require('./crypto')
const db = require('../helper/db');
let tokenMiddlWare = async (req,res,next)=>{
  var token = req.headers['token'];
  console.log('tokentoken',token)
  const { id, timespan } = decode(token)
  // 查找数据库中是否存在该 openid，返回是一个数组，如果不存在则返回[]
  const targetList = await db('select openid from tour_openid where openid="' + id + '"');
  if (targetList.length > 0) {
	  // 如果超过设定的过期时间，标记isExpired字段为登陆过期
	  const oneHour = 1000 * 60 * 60 * 24
	  if (Date.now() - timespan > oneHour) {
		//ctx.state.isExpired = true
	  // 跟前台约定，如果code=2说明登陆过期跳登陆页面
		res.json({ code: 2, data: null, message: '登陆过期' })
		//handle(ctx, '', 2, '登陆过期')
	  } else {
		  next()
		  //res.json({ code: 0, data: null, message: '登陆成功' })
		//handle(ctx, '', 0, '登陆过期')
	  }
	 }else{
		 throw new Error(401, '登陆失败')
	 }
}
module.exports = tokenMiddlWare