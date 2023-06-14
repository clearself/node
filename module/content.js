/**
 * Banner
 * @author: zhaoyiming
 * @since:  2017/9/29
 * @update: 2019/9/14
 */

const express = require('express');
const router = express.Router();
const db = require('../helper/db');
const { decode } = require('./crypto')
const tokenMiddlWare = require('./token-m');
router.get('/get', async (req, res) => {
  try {
    let contentList = await db('select id,content,files,create_time,type from tour_content');
	contentList = contentList.map(item=>{
		item.files = item.files.replace(/'/g,'').split(',')
		return item
	})
    res.json({ code: 0, data: contentList, message: '返回成功' });
  } catch (e) {
    res.json({
      code: -1, data: [], message: '返回失败'
    });
  }
});

/**
 * 发布内容
 */
router.post('/add',tokenMiddlWare, async (req, res) => {
	var token = req.headers['token'];
	const { id, timespan } = decode(token)
	const { type, content, files } = req.body;
	console.log('filesfiles',files)
	if(!type||!content){
		res.json({ code: -1, data: null, message: '参数有误' });
				
	}
	const filesStr = files.map(item=>{
		item = item.replace(/\\/g,'/')
		return item
	})
	await db('insert into tour_content set openid="' + id + '", type="' + type + '", files="' + filesStr.join(',') +  '", content="' + content + '",create_time="' + new Date().getTime() + '"');
	res.json({ code: 0, data: null, message: '添加成功' });
});

module.exports = router;