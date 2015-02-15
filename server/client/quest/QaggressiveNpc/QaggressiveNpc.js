//02/08/2015 1:27 AM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QaggressiveNpc',{
	name:"Bipolarity",
	author:"rc",
	thumbnail:"/quest/QaggressiveNpc/QaggressiveNpc.png",
	description:"Activating a switch can have weird effects on villagers.",
	maxParty:4,
	category:['PvE'],
	reward:{"ability":{"Qsystem-player-magicBullet":0.5}}
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
-enter eastCave
-go up to  top of mountain in firstTown
-activate switch
-all npc go aggressive
-you kill them all
-quest complete
*/

s.newVariable({
	toggleSwitch:False,
	killCount:0,
	secretOrder:'check _start'
});

s.newHighscore('speedrun',"Speedrun","Time to complete the quest normally",'ascending',function(key){
	if(s.isChallengeActive(key,'preset') || s.isChallengeActive(key,'secretOrder'))
		return null;
	else 
		return s.stopChrono(key,'timeToKill')*40;
});
s.newHighscore('speedrunPreset',"Speedrun Preset","Time to complete the quest with challenge [Preset].",'ascending',function(key){
	if(s.isChallengeActive(key,'preset'))
		return s.stopChrono(key,'timeToKill')*40;
	else 
		return null
});
s.newHighscore('speedrunOrder',"Speedrun Order","Time to complete the quest with challenge [Secret Order].",'ascending',function(key){
	if(s.isChallengeActive(key,'secretOrder'))
		return s.stopChrono(key,'timeToKill')*40;
	else 
		return null;
});

s.newChallenge('speedrun',"Fast Killer","Kill them all in less than 4 min",2,function(key){
	return s.stopChrono(key,'timeToKill') < 25*60*4;
});
s.newChallenge('preset',"Preset","Complete the quest with preset abilities",2,function(key){
	return true;
});
s.newChallenge('secretOrder',"Secret Order","Kill the villagers in the correct order else they revive.",4,function(key){
	return true;
});

s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-eastCave','t7','main');
	s.setRespawn(key,'QfirstTown-eastCave','t7','main');
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_start',function(key){ //
	s.addQuestMarker(key,'start','QfirstTown-eastCave','t7');
	if(s.isChallengeActive(key,'preset')){
		s.usePreset(key,'preset1');
	}
	var secretOrder = [0,1,2,3,4,5,6,7];
	secretOrder.sort(function(a,b){ return Math.random()-0.5; });
	s.set(key,'secretOrder',secretOrder.join(''))
});
s.newEvent('_hint',function(key){ //
	if(!s.get(key,'toggleSwitch')) return 'I wonder what that switch does...';
	return 'KILL THEM ALL!';
});
s.newEvent('killNpc',function(key,eid){ //
	if(s.isChallengeActive(key,'secretOrder')){
		var numList = s.get(key,'secretOrder');
		var num = +numList[s.get(key,'killCount')];
		if(!s.hasTag(eid,{secretNumber:num})){
			s.callEvent('transformNpc',	eid);
			return;
		}
	}
	
	s.add(key,'killCount',1);
	if(s.get(key,'killCount') >= 8){
		s.teleportTown(key);
		s.completeQuest(key);
	}
});
s.newEvent('toggleSwitch',function(key){ //
	s.forEachActor(key,'fight',function(key2){
		s.callEvent('transformNpc',key2);		
	},'npc',null,{toKill:true});
	
	s.set(key,'toggleSwitch',true);
	s.setRespawn(key,'fight','t2','party');
	s.displayPopup(key,'Kill them all to turn them back to normal.');
	s.startChrono(key,'timeToKill');
});
s.newEvent('transformNpc',function(key){ //
	var type = ['dragon','death','mummy'];
	s.spawnActorOnTop(key,'fight',type.$random(),{
		deathEvent:'killNpc',
		name:s.getAttr(key,'name'),
		sprite:s.newNpc.sprite(s.getAttr(key,'sprite').name),
		tag:s.getTag(key),
	});
});
s.newEvent('clickSwitch',function(key){ //
	s.startDialogue(key,'switch','click');
});
s.newEvent('viewNpc',function(key){ //
	return !s.get(key,'toggleSwitch');
});
s.newEvent('startGame',function(key){ //
	s.removeQuestMarker(key,'start');
	s.teleport(key,'fight','t1');
});

s.newAbility('simple','attack',{
	name:"Lightning",
	icon:'offensive.bullet',
	description:"This is an ability.",
	periodOwn:15
},{
	type:'bullet',
	amount:1,
	dmg:s.newAbility.dmg(125,'lightning'),
	hitAnim:s.newAbility.anim('lightningHit',0.4),
	sprite:s.newAbility.sprite('lightningball',1)
});
s.newAbility('simple2','attack',{
	name:"Lightning",
	icon:'offensive.bullet',
	description:"This is an ability.",
	periodOwn:15,
	costMana:25
},{
	type:'bullet',
	amount:3,
	dmg:s.newAbility.dmg(150,'lightning'),
	hitAnim:s.newAbility.anim('lightningHit',0.4),
	sprite:s.newAbility.sprite('lightningball',0.8)
});
s.newAbility('simple3','attack',{
	name:"Lightning Strike",
	icon:'offensive.bullet',
	description:"This is an ability."
},{
	type:'strike',
	amount:1,
	dmg:s.newAbility.dmg(500,'lightning'),
	initPosition:s.newAbility.initPosition(0,100),
	delay:2,
	width:25,
	height:25,
	preDelayAnim:s.newAbility.anim('lightningHit',1)
});

s.newPreset('preset1',s.newPreset.ability(['simple3','simple','simple2','','','']),null,False,False,False,False);

s.newDialogue('switch','Switch','',[ //{ 
	s.newDialogue.node('click',"for(var i in npcList)<br> npcList[i].aggressive = true;<br>Are you sure you want to activate this?",[ 
		s.newDialogue.option("Yes!",'','toggleSwitch'),
		s.newDialogue.option("No. That's scary.",'','')
	],'')
]); //}

s.newMap('fight',{
	name:"Town",
	lvl:0,
	graphic:'QfirstTown-main',
},{
	spot:{n6:{x:1616,y:944},n5:{x:1296,y:1008},t1:{x:1488,y:1328},n4:{x:1200,y:1392},n1:{x:2064,y:1456},q1:{x:1520,y:1488},t2:{x:1584,y:1680},n8:{x:2000,y:1744},n3:{x:1200,y:1776},n2:{x:1616,y:1904},n7:{x:944,y:1936}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			if(!s.get(key,'toggleSwitch'))
				s.message(key,'Don\'t you feel the urge to activate that switch?');
			else
				s.teleport(key,'fight','t2');
		},'underground');
		
		m.spawnToggle(spot.q1,function(key){ 
			return !s.get(key,'toggleSwitch');
		},'clickSwitch');
		
		m.spawnTeleporter(spot.t2,function(key){
			s.displayPopup(key,"Don't be a coward. Fight!",25*5);
		},'cave');
		
		m.spawnActor(spot.n1,'npc',{
			name:'Biglemic',
			sprite:s.newNpc.sprite('villager-male0'),
			tag:{toKill:true,secretNumber:0},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n2,'npc',{
			name:'Zeldo',
			sprite:s.newNpc.sprite('villager-male1'),
			tag:{toKill:true,secretNumber:1},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n3,'npc',{
			name:'Condsmo',
			sprite:s.newNpc.sprite('villager-male2'),
			tag:{toKill:true,secretNumber:2},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n4,'npc',{
			name:'Klappa',
			sprite:s.newNpc.sprite('villager-male3'),
			tag:{toKill:true,secretNumber:3},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n5,'npc',{
			name:'Ben',
			sprite:s.newNpc.sprite('villager-male4'),
			tag:{toKill:true,secretNumber:4},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n6,'npc',{
			name:'Mjolk',
			sprite:s.newNpc.sprite('villager-male5'),
			tag:{toKill:true,secretNumber:5},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n7,'npc',{
			name:'Esvea',
			sprite:s.newNpc.sprite('villager-male6'),
			tag:{toKill:true,secretNumber:6},
			viewedIf:'viewNpc',
		});
		m.spawnActor(spot.n8,'npc',{
			name:'Zehefgee',
			sprite:s.newNpc.sprite('villager-male7'),
			tag:{toKill:true,secretNumber:7},
			viewedIf:'viewNpc',
		});
	}
});
s.newMapAddon('QfirstTown-eastCave',{
	spot:{e1:{x:1392,y:688},t7:{x:1232,y:1456},e2:{x:1392,y:1968}},
	load:function(spot){
		m.spawnTeleporter(spot.t7,'startGame','zoneLight','down');
		
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list('salamander',1),
			m.spawnActorGroup.list('mosquito',2),
		]);
				
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list('ghost',1),
			m.spawnActorGroup.list('plant',2),
		]);
	}
});
s.newMapAddon('QfirstTown-main',{
	spot:{t1:{x:1488,y:1328},q1:{x:1520,y:1488}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){ 	//should never be used
			s.teleport(key,'QfirstTown-eastCave','t7','main');			
		},'underground');
		
		m.spawnToggle(spot.q1,function(){ return false; },function(){});
	}
});

s.exports(exports);
