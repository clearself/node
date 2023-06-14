const crypto = require('crypto')
const key = Buffer.from('9vApxLk5G3PAsJrM', 'utf8');
const iv = Buffer.from('FnJL7EDzjqWjcaY9', 'utf8');
function encode(text) {
	let sign = '';
	const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	const str = [text, Date.now()].join('|')
	sign += cipher.update(str, 'utf8', 'hex');
	sign += cipher.final('hex');
	return sign;
}

function decode(text) {
	let src = '';
	const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
	src += cipher.update(text, 'hex', 'utf8');
	src += cipher.final('utf8');
	const arr = src.split('|')
	return {
		id: arr[0],
		timespan: parseInt(arr[1])
	}
}
module.exports = {
encode,
decode
}