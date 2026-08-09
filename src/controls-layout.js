'use strict';
const actions=document.getElementById('actions');
const shoulders=document.getElementById('shoulders');
const middleBtns=document.getElementById('middleBtns');
const dpadButtons=[...document.querySelectorAll('#dpad .padBtn')];
let directionMode='digital';let activeProfile='two';
const FACE_POS={twoA:[74,92],twoB:[136,42],n:[76,0],e:[140,50],s:[76,100],w:[12,50],six1:[6,16],six2:[78,16],six3:[150,16],six4:[6,92],six5:[78,92],six6:[150,92],n64A:[54,96],n64B:[112,106],cu:[157,0],cl:[132,28],cr:[178,28],cd:[157,56]};
function face(label,input,pos,cls=''){const p=FACE_POS[pos];return{label,input,x:p[0],y:p[1],cls};}
function shoulder(label,input,side,slot=0){return{label,input,side,slot};}
const PROFILES={
 one:{faces:[face('FIRE',0,'twoB')],middle:[['START',3]]},
 two:{faces:[face('A',8,'twoA'),face('B',0,'twoB')],middle:[['SELECT',2],['START',3]]},
 lowres:{faces:[face('A',8,'twoA'),face('B',0,'twoB')],middle:[['PAUSE',3]]},
 gba:{faces:[face('A',8,'twoA'),face('B',0,'twoB')],shoulders:[shoulder('L',10,'left'),shoulder('R',11,'right')],middle:[['SELECT',2],['START',3]]},
 snes:{faces:[face('X',9,'n'),face('A',8,'e'),face('B',0,'s'),face('Y',1,'w')],shoulders:[shoulder('L',10,'left'),shoulder('R',11,'right')],middle:[['SELECT',2],['START',3]]},
 psx:{faces:[face('△',9,'n'),face('○',8,'e'),face('✕',0,'s'),face('□',1,'w')],shoulders:[shoulder('L1',10,'left',0),shoulder('L2',12,'left',1),shoulder('R1',11,'right',0),shoulder('R2',13,'right',1)],middle:[['SELECT',2],['START',3]]},
 psp:{faces:[face('△',9,'n'),face('○',8,'e'),face('✕',0,'s'),face('□',1,'w')],shoulders:[shoulder('L',10,'left'),shoulder('R',11,'right')],middle:[['SELECT',2],['START',3]],analogToggle:true,defaultAnalog:true},
 md6:{faces:[face('X',9,'six1','compact'),face('Y',10,'six2','compact'),face('Z',11,'six3','compact'),face('A',1,'six4','compact'),face('B',0,'six5','compact'),face('C',8,'six6','compact')],middle:[['MODE',2],['START',3]]},
 saturn:{faces:[face('X',9,'six1','compact'),face('Y',10,'six2','compact'),face('Z',11,'six3','compact'),face('A',1,'six4','compact'),face('B',0,'six5','compact'),face('C',8,'six6','compact')],shoulders:[shoulder('L',10,'left'),shoulder('R',11,'right')],middle:[['SELECT',2],['START',3]]},
 n64:{faces:[face('A',8,'n64A'),face('B',0,'n64B'),face('C▲',23,'cu','tinyFace'),face('C◀',21,'cl','tinyFace'),face('C▶',20,'cr','tinyFace'),face('C▼',22,'cd','tinyFace')],shoulders:[shoulder('L',10,'left',0),shoulder('Z',12,'left',1),shoulder('R',11,'right',0)],middle:[['START',3]],analogToggle:true,defaultAnalog:true},
 six:{faces:[face('1',0,'six1','compact'),face('2',8,'six2','compact'),face('3',1,'six3','compact'),face('4',9,'six4','compact'),face('5',10,'six5','compact'),face('6',11,'six6','compact')],middle:[['SELECT',2],['START',3]]},
 arcade6:{faces:[face('1',0,'six1','compact'),face('2',8,'six2','compact'),face('3',1,'six3','compact'),face('4',9,'six4','compact'),face('5',10,'six5','compact'),face('6',11,'six6','compact')],middle:[['COIN',2],['START',3]]},
 arcade4:{faces:[face('C',9,'n'),face('D',1,'e'),face('A',0,'s'),face('B',8,'w')],middle:[['COIN',2],['START',3]]},
 pce:{faces:[face('II',0,'twoA'),face('I',8,'twoB')],middle:[['SELECT',2],['RUN',3]]},
 pcfx:{faces:[face('IV',9,'six1','compact'),face('V',10,'six2','compact'),face('VI',11,'six3','compact'),face('I',0,'six4','compact'),face('II',8,'six5','compact'),face('III',1,'six6','compact')],middle:[['SELECT',2],['RUN',3]]},
 ws:{faces:[face('A',8,'twoA'),face('B',0,'twoB')],middle:[['START',3]],wsToggle:true},
 doom:{faces:[face('MAP',9,'n'),face('USE',8,'e'),face('FIRE',0,'s'),face('RUN',1,'w')],shoulders:[shoulder('STRAFE L',10,'left'),shoulder('STRAFE R',11,'right')],middle:[['SELECT',2],['START',3]]},
 computer:{faces:[face('FIRE 1',0,'twoA'),face('FIRE 2',8,'twoB')],middle:[['SELECT',2],['START',3]]}
};
