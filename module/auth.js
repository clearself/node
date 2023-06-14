/**
 * 登录、注册相关
 * @author zhaoyiming
 * @since  2017/9/16
 * @update 2019/9/13
 */

const express = require('express');
const router = express.Router();
const db = require('../helper/db');
// const {createToken} = require('./jwt')
const crypto = require('crypto');
const jwt = require("jsonwebtoken")
const { encode } = require('./crypto')

const secret = "kjafhkjsal";
const createToken = (data,expiresIn)=>{//创建token的方法
    let obj = {};
    obj.data = data || {};//存入token的数据
    obj.ctime = (new Date()).getTime();//token的创建时间
    obj.expiresIn = expiresIn;
	//1000*60*60*24*7//设定的过期时间
    let token = jwt.sign(obj,secret)
    return token;
}
/**
 * 登录
 */
router.post('/loginForm', async (req, res) => {
	const md5 = crypto.createHash('md5');
	const loginMsg = req.body;
	const phone = loginMsg.phone;
	const pwd = md5.update(loginMsg.pwd).digest('hex');
	console.log('11',phone)
	try {
		const result = await db('select * from tour_user where user_phone="' + phone + '" and user_pwd="' + pwd + '"');
		console.log('result',result)
		const [item] = result;
		console.log('userInfo',item)
		if (!item) {
			res.json({ code: -1, data: null, message: '用户不存在或密码错误' });
		}else {
			let token = createToken({item},1000*60*60*24*7)
			res.json({ code: 0, data: {user_name:item.user_name,user_phone:item.user_phone,user_sex:item.user_sex,user_id:item.id,token: token}, message: '登陆成功' });
		}
	} catch (err) {
		res.json({ code: -1, data: null, message: '登录失败，请重新操作' });
	}
});
let Login = (code)=>{
	return new Promise((resolve,reject)=>{
		let appid = 'wx8c30f959d5baceac'
		//"wx46a4889dbf556a66"; //自己小程序后台管理的appid，可登录小程序后台查看
		let secret = '77518a32bc5adfeda671f31ab897af45'
		//"e5a288969004e8a314ed040dad0ba246"; //小程序后台管理的secret，可登录小程序后台查看
		let grant_type = "authorization_code"; // 授权（必填）默认值
		let url =
		  "https://api.weixin.qq.com/sns/jscode2session?grant_type=" +
		  grant_type +
		  "&appid=" +
		  appid +
		  "&secret=" +
		  secret +
		  "&js_code=" +
		  code;
		let openid, sessionKey;
		let https = require("https");
		https.get(url, (res1) => {
		  res1
		    .on("data", (d) => {
		      console.log("返回的信息: ", JSON.parse(d));
		      openid = JSON.parse(d).openid; //得到openid
		      sessionKey = JSON.parse(d).session_key; //得到session_key
		      
		      let data = {
		        openid: openid,
		        sessionKey: sessionKey,
		      };
			  console.log('data',data)
		      //返回前端
			  resolve(data)
		    })
		    .on("error", (e) => {
		      console.error(e);
			  reject(e)
		    });
		});
	})
}
 router.post('/get_openid', async (req, res) => {
    // let encryptedData = params.encryptedData;//获取小程序传来的encryptedData
    // let iv = params.iv;//获取小程序传来的iv（ iv 是加密算法的初始向量）  uni.getUserInfo获取
    const { code } = req.body
    const session = await Login(code)
	console.log('session',session)
    if (session) {
		const { session_key, openid } = session
		// 查找数据库中是否已经存有openid，如果 hasOpenid 为null说明是新用户
		const result = await db('select openid from tour_openid where openid="' + openid + '"');
		console.log('result1111111111111',result)
		let timespan = Date.now()
		if(result.length===0){
		// 数据库存储openid,时间戳
			console.log('new Date().getTime()',Date.now())
			await db('insert into tour_openid set openid="' + openid + '", timespan="' + timespan + '"');
		}
		res.json({ code: 0, data: { token: encode(openid), message: '操作成功' }});
    } else {
		throw new Error('登陆失败')
    }
  });

/**
 * 注册
 */
router.post('/registForm', async (req, res) => {
	const md5 = crypto.createHash('md5');
	const registMsg = req.body;
	const phone = registMsg.phone;
	const pwd = md5.update(registMsg.pwd).digest('hex');

	try {
		const result = await db('select id from tour_user where user_phone="' + phone + '"');
		const [data] = result;
		if (result.length > 1) {
			res.json({ code: -1, data: null, message: '该手机号已被注册' });
		} else {
			const inserted = db('insert into tour_user set user_phone="' + phone + '", user_pwd="' + pwd + '"');
			if (inserted) res.json({ code: 0, data: null, message: '注册成功' });
			else res.json({ code: -1, data: null, message: '注册失败' });
		}
	} catch (err) {
		res.json({ code: -1, data: null, message: err });
	}
});

/**
 * 获取短信验证码
 */
router.post('/getPhoneCode', async (req, res) => {
	const msg = req.body;
	const phone = msg.phone;

	try {
		const [data] = await db('select id from tour_user where user_phone="' + phone + '"');
		if (!data) {
			res.json({ code: -1, data: null, message: '手机号码不存在' });
		} else {
			// ...模拟一系列获取短信验证码接口的代码
			let code = '';
			for (let i = 0; i < 6; i += 1) {
				code += Math.floor(Math.random() * 10);
			}
			res.json({ code: 0, data: code, message: '' });
		}
	} catch (err) {
		res.json({ code: -1, data: null, message: err });
	}
});

/**
 * 重置密码
 */
router.post('/resetPassword', async (req, res) => {
	const md5 = crypto.createHash('md5');
	const { phone, pwd } = req.body;
	const _pwd = md5.update(pwd).digest('hex');

	try {
		const result = await db('update tour_user set user_pwd="' + _pwd + '" where user_phone="' + phone + '"');
		res.json({ code: 0, data: null, message: '密码重置成功' });
	} catch (e) {
		res.json({ code: -1, data: null, message: e });
	}
});

module.exports = router;