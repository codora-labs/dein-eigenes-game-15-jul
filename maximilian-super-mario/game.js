const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const distanceEl = document.querySelector('#distance');
const bestEl = document.querySelector('#best');
const startScreen = document.querySelector('#startScreen');
const gameOverScreen = document.querySelector('#gameOverScreen');
const pauseLabel = document.querySelector('#pauseLabel');
const finalText = document.querySelector('#finalText');

const W = canvas.width, H = canvas.height, ground = 590, gravity = 1900, jumpSpeed = 820;
const keys = {}; let state = 'start', last = 0, camera = 0, score = 0, distance = 0;
let best = Number(localStorage.getItem('frostlauf-best') || 0), spawnAt = 800, particles = [], enemies = [], platforms = [], blocks = [], powerups = [], fireballs = [], season = 'winter';
bestEl.textContent = `${best} m`;

const player = { x:190, y:ground-86, w:58, h:86, vx:0, vy:0, grounded:true, facing:1, fire:false, riding:false, shootDelay:0 };

function reset() {
  Object.assign(player,{x:190,y:ground-player.h,vx:0,vy:0,grounded:true,facing:1,fire:false,riding:false,shootDelay:0}); season='winter';
  camera=0; score=0; distance=0; spawnAt=700; enemies=[]; platforms=[]; blocks=[]; powerups=[]; fireballs=[]; particles=[];
  for(let x=650;x<2500;x+=420+Math.random()*220) addSection(x);
  state='playing'; startScreen.classList.add('hidden'); gameOverScreen.classList.add('hidden'); updateHud();
}
function addEnemy(x, type='mushroom', floorY=ground){
  const lizard=type==='lizard';
  enemies.push({type,x,y:floorY-(lizard?48:55),floorY,w:lizard?78:64,h:lizard?48:55,vx:(lizard?-80:-40)-Math.random()*25,alive:true,squash:0,originX:x,range:lizard?150:90});
}
function addSection(x){
  const raised=Math.random()>.35;
  if(raised){
    const y=[455,500,530][Math.floor(Math.random()*3)], w=190+Math.random()*100;
    platforms.push({x,y,w,h:24});
    addEnemy(x+w*.45,Math.random()>.45?'lizard':'mushroom',y);
  } else addEnemy(x,Math.random()>.55?'lizard':'mushroom',ground);
  if(Math.random()>.48) blocks.push({x:x+100+Math.random()*100,y:ground-205-Math.random()*55,w:54,h:54,used:false,bump:0});
}
function jump(){ if(state==='start'||state==='over'){ reset(); return; } if(state==='paused') return; if(player.grounded){player.vy=-jumpSpeed;player.grounded=false;burst(player.x+player.w/2,ground-3,'#d9faff',8);} }
function gameOver(){ state='over'; best=Math.max(best,Math.floor(distance));localStorage.setItem('frostlauf-best',best);bestEl.textContent=`${best} m`;finalText.textContent=`Du bist ${Math.floor(distance)} Meter weit gekommen.`;gameOverScreen.classList.remove('hidden'); }
function updateHud(){scoreEl.textContent=String(score).padStart(4,'0');distanceEl.textContent=`${Math.floor(distance)} m`;}
function burst(x,y,color,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*260,vy:-Math.random()*240-40,life:.7+Math.random()*.4,color,size:3+Math.random()*6});}
function shoot(){if(state!=='playing'||!player.fire||player.shootDelay>0)return;player.shootDelay=.35;fireballs.push({x:player.x+player.w/2+player.facing*25,y:player.y+38,vx:player.facing*620,vy:-80,life:2.2});burst(player.x+player.w/2+player.facing*35,player.y+40,'#ffb52e',5);}

function update(dt){
  if(state!=='playing')return;
  const dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
  player.vx += dir*(player.riding?1350:1100)*dt; player.vx *= Math.pow(.003,dt); player.vx=Math.max(player.riding?-340:-280,Math.min(player.riding?510:420,player.vx));
  if(dir)player.facing=dir; player.vy+=gravity*dt; player.x+=player.vx*dt; player.y+=player.vy*dt;
  player.shootDelay=Math.max(0,player.shootDelay-dt);
  if(player.vy<0){
    const oldTop=player.y-player.vy*dt;
    for(const b of blocks){if(player.x+player.w>b.x&&player.x<b.x+b.w&&oldTop>=b.y+b.h&&player.y<=b.y+b.h){player.y=b.y+b.h;player.vy=90;b.bump=.16;if(!b.used){b.used=true;const type=Math.random()>.48?'rider':'flower';powerups.push({type,x:b.x+7,y:b.y,w:type==='rider'?52:40,h:44,vy:-125,rise:.55});score+=50;burst(b.x+b.w/2,b.y,type==='rider'?'#9dea70':'#ffd756',10);}}}
  }
  let landingY=ground;
  if(player.vy>=0){
    const oldFeet=player.y+player.h-player.vy*dt;
    for(const p of platforms){
      if(player.x+player.w>p.x+5&&player.x<p.x+p.w-5&&oldFeet<=p.y&&player.y+player.h>=p.y) landingY=Math.min(landingY,p.y);
    }
  }
  if(player.y+player.h>=landingY){player.y=landingY-player.h;player.vy=0;player.grounded=true;}else{player.grounded=false;}
  player.x=Math.max(camera+35,player.x); camera=Math.max(0,player.x-260); distance=camera/18;
  if(camera+W>spawnAt){addSection(spawnAt+W);spawnAt+=390+Math.random()*330;}
  for(const e of enemies){
    if(!e.alive){e.squash-=dt;continue;} e.x+=e.vx*dt;
    if(e.x<e.originX-e.range||e.x>e.originX+e.range)e.vx*=-1;
    const hit=player.x<e.x+e.w&&player.x+player.w>e.x&&player.y<e.y+e.h&&player.y+player.h>e.y;
    if(hit){const feet=player.y+player.h;if(player.vy>80&&feet<e.y+30){e.alive=false;e.squash=.35;player.vy=-470;score+=e.type==='lizard'?200:100;burst(e.x+e.w/2,e.y,e.type==='lizard'?'#9df06b':'#7eddf2',15);}else gameOver();}
  }
  for(const b of blocks)b.bump=Math.max(0,b.bump-dt);
  for(const p of powerups){p.vy+=500*dt;p.y+=p.vy*dt;if(p.rise>0){p.y-=75*dt;p.rise-=dt;}const hit=player.x<p.x+p.w&&player.x+player.w>p.x&&player.y<p.y+p.h&&player.y+player.h>p.y;if(hit&&!p.taken){p.taken=true;if(p.type==='rider'){player.riding=true;season='spring';score+=750;burst(p.x+20,p.y+20,'#9dea70',28);}else{player.fire=true;score+=500;burst(p.x+20,p.y+20,'#ff7337',22);}}}
  powerups=powerups.filter(p=>!p.taken&&p.y<H);
  for(const f of fireballs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=900*dt;if(f.y+14>=ground){f.y=ground-14;f.vy=-330;}f.life-=dt;for(const e of enemies){if(e.alive&&f.x<e.x+e.w&&f.x+14>e.x&&f.y<e.y+e.h&&f.y+14>e.y){e.alive=false;e.squash=.35;f.life=0;score+=150;burst(e.x+e.w/2,e.y,'#ff9c32',16);}}}
  fireballs=fireballs.filter(f=>f.life>0);
  enemies=enemies.filter(e=>e.x>camera-180&&(e.alive||e.squash>0));platforms=platforms.filter(p=>p.x+p.w>camera-100);blocks=blocks.filter(b=>b.x+b.w>camera-100);
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
  updateHud();
}

function mountains(offset,base,color,step,height){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,H);for(let x=-step;x<W+step;x+=step){const wx=x+((offset%step)+step)%step-step;ctx.lineTo(wx,base);ctx.lineTo(wx+step*.52,base-height-(Math.sin((x+offset)*.01)+1)*25);ctx.lineTo(wx+step,base);}ctx.lineTo(W,H);ctx.fill();}
function drawSnow(){for(let i=0;i<85;i++){const x=(i*193-camera*(.05+(i%4)*.02))%W;const y=(i*83)%520;ctx.globalAlpha=.25+(i%5)*.1;ctx.fillStyle='#dffaff';ctx.fillRect((x+W)%W,y,2+(i%3),2+(i%3));}ctx.globalAlpha=1;}
function drawSpring(){for(let i=0;i<55;i++){const x=((i*241-camera*.12)%W+W)%W,y=70+(i*97)%440;ctx.globalAlpha=.25+(i%4)*.12;ctx.fillStyle=i%2?'#fff6b0':'#ffd6ed';ctx.beginPath();ctx.arc(x,y,2+i%3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
function drawPlayer(){
  const x=player.x-camera,y=player.y,bob=player.grounded&&Math.abs(player.vx)>20?Math.sin(performance.now()*.02)*2:0;ctx.save();ctx.translate(x+player.w/2,y+player.h/2+bob);ctx.scale(player.facing,1);ctx.translate(-player.w/2,-player.h/2);
  if(player.riding){ctx.fillStyle='#2d914f';ctx.beginPath();ctx.ellipse(28,76,34,20,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#65ce68';ctx.fillRect(42,61,24,23);ctx.beginPath();ctx.arc(59,61,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5ffff';ctx.fillRect(58,54,7,9);ctx.fillStyle='#11283b';ctx.fillRect(62,56,3,6);ctx.fillStyle='#f35a42';ctx.fillRect(66,68,12,6);ctx.fillStyle='#f4e5b7';ctx.fillRect(7,84,20,8);ctx.fillRect(40,84,20,8);ctx.translate(0,-25);}
  ctx.fillStyle='#093f70';ctx.fillRect(10,50,18,31);ctx.fillRect(35,50,18,31);ctx.fillStyle='#eafcff';ctx.fillRect(5,76,25,10);ctx.fillRect(33,76,25,10);
  ctx.fillStyle=player.fire?'#f5f3e8':'#e54045';ctx.fillRect(8,25,44,36);ctx.fillStyle=player.fire?'#e85035':'#118fbd';ctx.fillRect(14,39,32,31);ctx.fillStyle=player.fire?'#f5f3e8':'#e54045';ctx.fillRect(4,42,12,27);ctx.fillRect(45,42,12,27);
  ctx.fillStyle='#ffcfad';ctx.fillRect(15,9,35,30);ctx.fillStyle='#6b321e';ctx.fillRect(14,22,12,13);ctx.fillRect(43,26,9,5);ctx.fillStyle='#07172c';ctx.fillRect(38,16,5,8);
  ctx.fillStyle=player.fire?'#f5f3e8':'#e43b43';ctx.fillRect(9,2,42,12);ctx.fillRect(4,10,53,8);ctx.fillStyle=player.fire?'#e85035':'#eafcff';ctx.fillRect(26,5,9,7);ctx.restore();
}
function drawBlock(b){const x=b.x-camera,y=b.y-(b.bump>0?Math.sin(b.bump*20)*7:0);ctx.fillStyle=b.used?'#67839a':'#f2a72b';ctx.fillRect(x,y,b.w,b.h);ctx.strokeStyle=b.used?'#96afbf':'#ffd85a';ctx.lineWidth=5;ctx.strokeRect(x+3,y+3,b.w-6,b.h-6);ctx.fillStyle=b.used?'#3d5d72':'#fff3a1';ctx.font="28px 'Press Start 2P'";ctx.textAlign='center';ctx.fillText(b.used?'·':'?',x+b.w/2,y+38);ctx.textAlign='left';}
function drawPowerup(p){const x=p.x-camera,y=p.y;if(p.type==='rider'){ctx.fillStyle='#f7f1d5';ctx.beginPath();ctx.ellipse(x+25,y+25,25,21,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#50b75c';ctx.beginPath();ctx.ellipse(x+18,y+19,9,13,-.4,0,Math.PI*2);ctx.ellipse(x+34,y+29,8,11,.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#263a3c';ctx.fillRect(x+21,y+17,4,6);return;}ctx.fillStyle='#f2f1df';ctx.fillRect(x+8,y+20,24,23);ctx.fillStyle='#f04d32';ctx.beginPath();ctx.arc(x+20,y+18,20,Math.PI,Math.PI*2);ctx.lineTo(x+40,y+20);ctx.lineTo(x,y+20);ctx.fill();ctx.fillStyle='#ffd349';ctx.fillRect(x+6,y+10,9,9);ctx.fillRect(x+25,y+5,9,9);ctx.fillStyle='#172235';ctx.fillRect(x+13,y+27,5,8);ctx.fillRect(x+25,y+27,5,8);}
function drawPlatform(p){const x=p.x-camera;ctx.fillStyle='#e8fcff';ctx.fillRect(x,p.y,p.w,10);ctx.fillStyle='#65cbe0';ctx.fillRect(x+7,p.y+10,p.w-14,15);ctx.fillStyle='#2291b8';ctx.beginPath();ctx.moveTo(x+7,p.y+25);ctx.lineTo(x+p.w-7,p.y+25);ctx.lineTo(x+p.w-28,p.y+48);ctx.lineTo(x+28,p.y+48);ctx.fill();for(let i=22;i<p.w-10;i+=48){ctx.fillStyle='#a9edf6';ctx.beginPath();ctx.moveTo(x+i,p.y+10);ctx.lineTo(x+i+13,p.y+10);ctx.lineTo(x+i-3,p.y+33);ctx.fill();}}
function drawEnemy(e){
  const x=e.x-camera,y=e.y;if(!e.alive){ctx.fillStyle=e.type==='lizard'?'#39743f':'#713926';ctx.fillRect(x,y+e.h-16,e.w,16);return;}
  if(e.type==='lizard'){
    const flip=e.vx<0?-1:1;ctx.save();ctx.translate(x+e.w/2,y);ctx.scale(flip,1);ctx.translate(-e.w/2,0);
    ctx.fillStyle='#2f7049';ctx.beginPath();ctx.moveTo(8,31);ctx.lineTo(0,17);ctx.lineTo(25,25);ctx.lineTo(39,8);ctx.lineTo(67,12);ctx.lineTo(76,31);ctx.lineTo(61,43);ctx.lineTo(24,43);ctx.fill();
    ctx.fillStyle='#6bcf69';ctx.fillRect(27,15,39,25);ctx.fillStyle='#b9f27d';ctx.fillRect(43,31,25,9);ctx.fillStyle='#efffff';ctx.fillRect(54,17,9,10);ctx.fillStyle='#102436';ctx.fillRect(59,19,4,7);
    ctx.fillStyle='#9de36d';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(27+i*11,17);ctx.lineTo(33+i*11,3);ctx.lineTo(39+i*11,17);ctx.fill();}ctx.fillRect(19,39,20,8);ctx.fillRect(53,39,19,8);ctx.restore();return;
  }
  ctx.fillStyle='#69321f';ctx.fillRect(x+8,y+18,48,35);ctx.fillStyle='#a75b35';ctx.beginPath();ctx.ellipse(x+32,y+20,32,22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0e4cf';ctx.fillRect(x+14,y+19,36,24);ctx.fillStyle='#172032';ctx.fillRect(x+18,y+24,7,10);ctx.fillRect(x+40,y+24,7,10);ctx.fillStyle='#e8faff';ctx.fillRect(x+8,y+49,22,7);ctx.fillRect(x+37,y+49,22,7);
}
function draw(){
  const spring=season==='spring',g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,spring?'#6dc8ef':'#071b35');g.addColorStop(.6,spring?'#d4f1dc':'#176f9c');g.addColorStop(1,spring?'#fff1bc':'#bff5ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=spring?'#fff4b855':'#bdefff18';ctx.beginPath();ctx.arc(1000,125,78,0,Math.PI*2);ctx.fill();mountains(camera*.08,470,spring?'#70a77a':'#0c3e61',310,210);mountains(camera*.16,540,spring?'#91c789':'#17698a',230,155);spring?drawSpring():drawSnow();
  ctx.fillStyle=spring?'#83d369':'#dffaff';ctx.fillRect(0,ground,W,H-ground);ctx.fillStyle=spring?'#4da84f':'#83d9ed';ctx.fillRect(0,ground+13,W,18);ctx.fillStyle=spring?'#6c913d':'#3aa6c9';ctx.fillRect(0,ground+31,W,H-ground-31);
  for(let x=-((camera*.7)%150);x<W;x+=150){ctx.fillStyle=spring?'#92b957':'#baf0f8';ctx.beginPath();ctx.moveTo(x,ground+31);ctx.lineTo(x+58,ground+31);ctx.lineTo(x+18,H);ctx.lineTo(x-60,H);ctx.fill();if(spring){ctx.fillStyle=x%300===0?'#fff27b':'#ff8fc4';ctx.fillRect(x+70,ground-8,6,10);ctx.beginPath();ctx.arc(x+73,ground-10,7,0,Math.PI*2);ctx.fill();}}
  for(const p of platforms)drawPlatform(p);for(const b of blocks)drawBlock(b);for(const p of powerups)drawPowerup(p);for(const e of enemies)drawEnemy(e);for(const f of fireballs){const x=f.x-camera,g=ctx.createRadialGradient(x+7,f.y+7,1,x+7,f.y+7,12);g.addColorStop(0,'#fff6a2');g.addColorStop(.45,'#ff9a27');g.addColorStop(1,'#ef392c00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+7,f.y+7,12,0,Math.PI*2);ctx.fill();}drawPlayer();for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-camera,p.y,p.size,p.size);}ctx.globalAlpha=1;
  ctx.fillStyle='#ffffff12';ctx.fillRect(0,0,W,4);ctx.fillRect(0,H-4,W,4);
}
function loop(t){const dt=Math.min(.032,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);

addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump();}if(['KeyF','KeyX'].includes(e.code)&&!e.repeat)shoot();if(e.code==='Enter'&&(state==='start'||state==='over'))reset();if(e.code==='KeyP'&&(state==='playing'||state==='paused')){state=state==='playing'?'paused':'playing';pauseLabel.classList.toggle('hidden',state!=='paused');}});
addEventListener('keyup',e=>keys[e.code]=false);
document.querySelector('#startBtn').onclick=reset;document.querySelector('#restartBtn').onclick=reset;
for(const [id,code] of [['leftBtn','ArrowLeft'],['rightBtn','ArrowRight']]){const b=document.querySelector('#'+id);b.onpointerdown=e=>{e.preventDefault();keys[code]=true};b.onpointerup=b.onpointercancel=()=>keys[code]=false;}
document.querySelector('#jumpBtn').onpointerdown=e=>{e.preventDefault();jump();};
