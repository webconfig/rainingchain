//Map
Init.db.map = function(){
    //[amount of sub-map in X, amount of sub-maps in Y]
    Db.map = {};
	
	var mapDb = {
		'test':[0,0],
		'tutorial':[1,1],
		'pvpF4A':[0,0],
		'goblinLand':[4,8],
	}


	for(var i in mapDb){
		Map.creation(i,mapDb[i]);
	}
}

Map = {};
Map.creation = function(name,info){
	
	var m = {};
	m.name = name;
	m.img = {'a':[],'b':[],m:null};	//a: above, b:below

	for(var layer in {a:1,b:1}){
		for(var i = 0 ; i <= info[0]; i++){
			m.img[layer][i] = [];
			for(var j = 0 ; j <= info[1]; j++){
				var str = "img/map/" + name + "/" + name + layer.capitalize() + '_(' + i + ',' + j + ')' + '.png';
				var im = newImage(str);
				Img.preloader.push(str);
				m.img[layer][i].push(im);
			}
		}
	}
	var str = "img/map/" + name + "/" + name + 'M.png';
	var im = newImage(str);
	Img.preloader.push(str);
	m.img.m = im;		// 8 times smaller than regular map generated by tiled
	
	Db.map[name] = m;
	
}




















