const express = require('express');
const app = express();
var multer=require('multer')
var fs=require('fs')
var path=require('path')
// const tokenMiddlWare = require('./module/token-m');
// const multer = require('./helper/multer');
// const { putFile } = require('./helper/qiniu-oss');
const bodyParser = require('body-parser');
const listenNumber = 8090;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Expose-Headers, Platform, Token, Uid');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, HEAD');
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/tour/auth', require(__dirname + '/module/auth'));
app.use('/tour/user', require(__dirname + '/module/user'));
app.use('/tour/coupon', require(__dirname + '/module/coupon'));
app.use('/tour/region', require(__dirname + '/module/region'));
app.use('/tour/banner', require(__dirname + '/module/banner'));
app.use('/tour/article', require(__dirname + '/module/article'));
app.use('/tour/content', require(__dirname + '/module/content'));
app.use("/upload",express.static(path.join(__dirname,'upload'))); //**设置upload文件夹下的所有文件能通过网址访问,用作静态文件web服务**//
var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);
    }  
};
const cwd = process.cwd();
var uploadFolder = 'upload/img/'; // 保存的路径，需要自己创建
createFolder(uploadFolder);
// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
		console.log(file,'file')
		// cb(null, Date.now() + path.extname(file.originalname))
        let suffix=file.mimetype.split('/')[1];//获取文件格式
        cb(null, file.fieldname + '-' + Date.now()+'.'+suffix);  
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({
		//文件大小数量限制
		  limits:{
			//限制文件大小100kb
			fileSize: 200*1000,
			//限制文件数量
			files: 1
		  },
		//文件格式过滤
		fileFilter: function(req, file, cb){
			// 限制文件上传类型，仅可上传png格式图片
			if(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/gif'){
				cb(null, true)
			} else {
				cb(null, false)
			}
		},
		storage: storage 
	})
app.post("/tour/upload",upload.single('file'), (req, res) => {
    //req.body contains the text fields
        console.log(req.file,'------',req.body,'-------',req.file.path);
        //res.end(req.file.buffer);
        // console.log(req.file.buffer.toString().length); 
		
		const filePath = `https://node.flypa.cn/${uploadFolder}${req.file.filename}`;
		res.json({ code: 0, data: filePath, message: '返回成功' });
 })
 
 
// 七牛云上传图片处理
// app.post("/tour/upload", multer.single('file'), async (req, res) => {
//     //req.body contains the text fields
// 	try {
// 	  const cwd = process.cwd();
// 	  const filePath = `${cwd}/tmp/${req.file.filename}`;
// 	  console.log('文件名称',filePath)
// 	  const fileUrl = await putFile(filePath);
// 	  if (fileUrl) {
// 	    // 后期要换成oss地址
// 	   res.json({ code: 0, data: fileUrl, message: '返回成功' });
// 	  } else {
// 	    res.json({ code: -1, data: null, message: '上传 失败，请重新操作' });
// 	  }
// 	} catch (e) {
// 	  res.json({code: -1, data: null, message: e});
// 	}
//  })

app.listen(listenNumber, () => {
  console.log('express listen port '+listenNumber);
});
