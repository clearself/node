/*
 * 数据库配置
 * @author: zhaoyiming
 * @since:  2017/9/16
*/

// const mysql = require('mysql');

// const db = mysql.createConnection({
// 	host: '101.43.221.193',
// 	user: 'mytour',
// 	password: '198819880210zxc',
// 	database: 'mytour',
// 	connectTimeout: 60*1000
// });
// db.connect();

var mysql = require('mysql');
var db;
function handleError () {
    db = mysql.createConnection({
       	host: '101.43.221.193',
       	user: 'mytour',
       	password: '198819880210zxc',
       	database: 'mytour',
       	connectTimeout: 60*1000
    });
 
    //连接错误，2秒重试
    db.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleError , 2000);
        }
    });
 
    db.on('error', function (err) {
        console.log('db error', err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleError();
        } else {
            throw err;
        }
    });
}
handleError();

module.exports = (sql, callback) => {
	return new Promise((resolve, reject) => {
		db.query(sql, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});
};