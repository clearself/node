const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');
// const accessKey = '8pIzQRCidxlh0Vg1-3hWoHBnW9CG6ryy3MWmUoCv';
// const secretKey = 'Zvi2lhu9JD5RNSDInGW_X-Kc8zi14Q1H71Vhzxu1';
const accessKey = '8pIzQRCidxlh0Vg1-3hWoHBnW9CG6ryy3MWmUoCv';
const secretKey = 'Zvi2lhu9JD5RNSDInGW_X-Kc8zi14Q1H71Vhzxu1';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const options = {
	scope: 'fuleiyang',
	// callbackUrl: 'http://api.example.com/qiniu/upload/callback',
	// callbackBody: 'key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)'
}
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

exports.putFile = (localFile) => {
	const basename = path.basename(localFile);
	const key = 'vuenode/' + basename;
	// 文件上传成功之后的路径
	// http://cdn.0351zhuangxiu.com/${key}
	return new Promise((resolve, reject) => {
		formUploader.putFile(uploadToken, key, localFile, putExtra, (respErr, respBody, respInfo) => {
			fs.unlinkSync(`${process.cwd()}/tmp/${basename}`);
			if (respErr) reject(respErr);
			else if (respInfo.statusCode === 200) resolve(`http://qiniu.flypa.cn/${key}`);
			else reject();
		});
	});
}