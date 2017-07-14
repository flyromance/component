const express = require('express');
const router = express.Router();
const upload = require("../services/upload");
const crud = require("../services/crud");
const moment = require("moment");



router.get("/list.html", function(req, res){
	crud.getCompList().then(function(result){
		let comps = result[0], logs = result[1];
		res.render("list", {"section":"list", "comps":format(comps), "logs" : logs});
	});
});


router.post("/list/deploy", function(req, res){
	
	let name = req.body.name;

	upload.done(name)
	.then(function(result, version){
		console.log("上传成功:");
		console.log(result);
		return crud.record(result);
	}).then(function(result){
		res.render('info', {'title' : '发布成功', 'message' : result, 'ref' : '/list.html'});
	}).catch(function(error){
		//res.send(error+"");
		res.render('info', {'title' : '发布失败', 'message' : error, 'ref' : '/list.html'});
	});
	

	// crud.record({
	//  	'/home/feb/component/public/dist/feb/common.js': 'http://s7.qhres.com/!a81112/feb/common.js',
	// 	'/home/feb/component/public/dist/feb/phenix/index.js': 'http://s7.qhres.com/!a43332/feb/phenix/index.js',
	// 	'/home/feb/component/public/dist/feb/seed/index.js': 'http://s7.qhres.com/!a88fb5b3/feb/seed/index.js',
	// 	'/home/feb/component/public/dist/feb/seed/infoflow.js': 'http://s7.qhres.com/!a8ff8fb5b3/feb/seed/infoflow.js',
	// 	'/home/feb/component/public/dist/feb/slide/default.js': 'http://s7.qhres.com/!a88fb5b3/feb/slide/default.js',
	// 	'/home/feb/component/public/dist/feb/test/index.js': 'http://s7.qhres.com/!a88fb5b3/feb/test/index.js',
	// 	'/home/feb/component/public/dist/require.btime.js': 'http://s7.qhres.com/!a88fb5b3/require.btime.js' 
	// }).then(function(result){
	// 	res.send(result);
	// });
});


let format = function(data){
	data.forEach(function(item, index){
		item.example = item.name.replace("feb","") + ".html";
		item.history.forEach(function(item, index){
			item.version = moment(item.version).format('YYYYMMDDHHmmssSSS');
		});
		item.history.reverse();
	});
	return data;
};



module.exports = router;