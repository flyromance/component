	/**
	  *	@fileOverview	数据库操作，实现组件库的数据记录
	  *	由于操作不频繁，因此操作完成既关闭连接
	*/

	const mongoose = require('mongoose'),
		DB_URL = 'mongodb://feb:feb123@172.23.12.16:27017/component';
	mongoose.Promise = Promise;


	let ComponentSchema = new mongoose.Schema({
		name : {type: String},
		url : {type: String},
		src : {type: String},
		history : {type: Array}
	});


	let DlogSchema = new mongoose.Schema({
		version : {type: String},
		comps : {type: Array},
    	pubdate : { type: Date, default: Date.now}                
	});
	
	 


	module.exports = {

		init : function(db){
			this.CompModel = db.model('comp', ComponentSchema);
			this.DLogModel = db.model('dlog', DlogSchema);
		},


		exec : function(callback){

			let self = this;

			return new Promise(function(resolve, reject){
	    	
				let db = mongoose.createConnection(DB_URL);

				self.init(db);

				db.on('connected', function () {    
				    console.log('Mongoose connection open to ' + DB_URL);
				    callback(db).then(function(result){
				    	db.close();
				    	resolve(result); 
				    }).catch(function(err){ reject(new Error(err)); }); 
				});    

				db.on('error',function (err) {    
				    console.log('Mongoose connection error: ' + err);  
				});

				db.on('disconnected', function () {    
				    console.log('Mongoose connection disconnected');  
				});

			});
		},


		/**
		  *	@desp	更新组件列表,主要实现新组件的插入操作
		*/
		update : function(items){	
			var self = this, arr = [];		
			return this.exec(function(db){
				items.forEach(function(item, index){
					arr.push(self.CompModel.update({'name':item.name}, {'$set':{'name':item.name,'src':item.src}}, {upsert: true}));
				});
				return Promise.all(arr);
			});

		},


		/**
		  *	@desp	发布日志记录，并更新组建表，插入新的版本
		*/
		record : function(items){
			var self = this, arr = [], version = undefined, ts = new Date().getTime();		
			return this.exec(function(db){
				try{

					items.forEach(function(item, index){
						let obj = {'version': ts, 'url' : item.url};
						arr.push(self.CompModel.findOneAndUpdate({'name':item.name}, {$set:{'src':item.src, 'url':item.url}, $push:{'history':obj}}));
						if(item.version){
							version = item.version;
						}
					});

					if(version){
						arr.push(self.DLogModel.update({'version':version}, {'$set':{'version':version, 'pubdate': ts, 'comps': items}}, {upsert: true}));
					}
					
					return Promise.all(arr);
				}catch(ex){
					return Promise.reject(ex);
				}
			});
		},



		/**
		  *	@desp	获取组件列表
		*/
		getCompList : function(){
			let self = this;
			return this.exec(function(){ 
				return Promise.all([
					self.CompModel.find(),
					self.DLogModel.find()
				]); 
			});
		},



		/**
		  *	@desp	获取日志列表
		*/
		getDLogList : function(){
			let self = this;
			return this.exec(function(db){ return self.DLogModel.find({}); });
		}
	};