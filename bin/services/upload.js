	const path = require('path');
	const args = require('minimist')(process.argv.slice(2));
	const qcdn = require('@q/qcdn');
	//const crud = require('./crud');
	const filepath = path.resolve(__dirname, '../public/dist');


	/*
	var filePath = args.path || "./dist";

	console.log(filePath);

	qcdn.upload(filePath, {keepName:true, force:true, all:true, domains:["s7.qhres.com"]})
	.then(function(map){
		console.log(map);
		var entity = {count:0};
		for(var pro in map){
		  if(!entity.vid){
		  	try{
		  		entity.vid = map[pro].match(/^(http:\/\/[^\/]*\/)([^\/]*)\/\S*$/)[2];
		  	}catch(ex){
		  		console.log("地址格式有误！！")
		  	}
		    
		  }
		  entity.count++;
		}
		(new crud.Dlog(entity)).save(function(err, res){
		  console.log(err || res);
		});

	});
	*/

	let done = function(name){

		let arr = [], currentPath = '';

		if(name) currentPath = filepath + '/' + name + '.js';
		else currentPath = filepath;

		console.log('上传地址:' + currentPath);

		return new Promise(function(resolve, reject){
			qcdn.upload(currentPath, {keepName:true, force:true, all:true, domains:["s7.qhres.com"]})
			.then(function(map){
				for(let pro in map){
					let entity = {'name':name};
					//上传不成同样会返回正确格式，为避免这种情况
					if(map[pro].indexOf("Error") !== -1) throw new Error(map[pro] + "\n");

			  		if(!entity.name){
			  			entity.name = map[pro].match(/^http:\/\/[^\/]*\/([^\/]*)\/(\S*).js$/)[2];
			  			entity.version = map[pro].match(/^http:\/\/[^\/]*\/([^\/]*)\/(\S*).js$/)[1];
			  		}

			  		entity.src = pro;
			  		entity.url = map[pro];
			  		arr.push(entity);
				}
				resolve(arr);
			}).catch(function(ex){ reject(new Error("上传失败:\n" + ex)); });
		});
		
	};


	module.exports = {
		done : done
	}