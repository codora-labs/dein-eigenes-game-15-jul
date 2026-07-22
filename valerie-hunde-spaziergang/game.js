(function () {
  "use strict";
  const { drawEmoji, mount } = window.ExampleKit;
  const W = 960, GROUND = 470;
  const game = {
    title: "Hunde Spaziergang",
    instructions: "Leertaste oder ↑: gemeinsam springen · P: Pause · R: Neustart",
    create() { return { status:"ready", time:0, distance:0, level:1, bones:0, cucumbers:0, jumps:0, speed:235, jumpHeld:false, jumpCount:0, walker:{y:GROUND-62,vy:0}, dog:{y:GROUND-52,vy:0}, obstacles:[], bonesOnTrack:[], cucumberTargets:[], nextObstacle:1.3, nextBone:1.05, nextCucumber:3.2, stripe:0 }; },
    update(s, dt, input) {
      const down = input.down("ArrowUp", "Space"), pressed = input.consumeAction() || (down && !s.jumpHeld); s.jumpHeld = down;
      s.time += dt; s.distance += s.speed * dt; s.level = 1 + Math.floor(s.distance / 900); s.speed = Math.min(720, 235 + s.level * 8); s.stripe = (s.stripe + s.speed * dt) % 70; s.nextObstacle -= dt; s.nextBone -= dt; s.nextCucumber -= dt;
      if (s.nextObstacle <= 0) { const kind = Math.floor(Math.random() * 3); s.obstacles.push({x:W+30,w:kind===1?92:kind===2?78:60,h:kind===1?48:kind===2?72:60,kind}); s.nextObstacle=Math.max(.48,1.35-s.level*.035)+Math.random()*.45; }
      if (s.nextBone <= 0) { s.bonesOnTrack.push({x:W+30,y:GROUND-75-Math.random()*125,bob:Math.random()*6.28}); s.nextBone=.85+Math.random()*1.1; }
      if (s.nextCucumber <= 0) { s.cucumberTargets.push({x:W+30,y:GROUND-70-Math.random()*110,baseY:GROUND-70-Math.random()*110,phase:Math.random()*6.28,splash:0}); s.nextCucumber=3.2+Math.random()*2.2; }
      for (const o of s.obstacles) o.x -= s.speed*dt;
      for (const b of s.bonesOnTrack) { b.x -= s.speed*dt; b.bob += dt*5; }
      for (const c of s.cucumberTargets) { c.x -= s.speed*dt; c.phase += dt * (s.level >= 6 ? 4 : 1); if (s.level >= 6) c.y = c.baseY + Math.sin(c.phase) * 42; c.splash=Math.max(0,c.splash-dt); }
      s.obstacles=s.obstacles.filter((o)=>o.x>-100); s.bonesOnTrack=s.bonesOnTrack.filter((b)=>b.x>-60); s.cucumberTargets=s.cucumberTargets.filter((c)=>c.x>-70);
      for (const actor of [s.walker,s.dog]) { actor.vy += 1700*dt; actor.y += actor.vy*dt; if (actor.y>GROUND-(actor===s.walker?62:52)) { actor.y=GROUND-(actor===s.walker?62:52); actor.vy=0; s.jumpCount=0; } }
      const hx=205, hy=s.dog.y+20;
      const cucumber=s.cucumberTargets.find((c)=>c.x>hx-35&&c.x<hx+145);
      if(cucumber&&pressed){cucumber.splash=.5;cucumber.x=-200;s.cucumbers+=1;}
      if(!cucumber&&pressed&&s.jumpCount<2){s.walker.vy=-650;s.dog.vy=-690;s.jumpCount+=1;s.jumps+=1;}
      if (s.obstacles.some((o)=>o.x<hx+34&&o.x+o.w>hx-28&&hy>GROUND-o.h-15)) s.status="lost";
      s.bonesOnTrack=s.bonesOnTrack.filter((b)=>{ if(Math.hypot(b.x-hx,b.y-hy)<48){s.bones+=1;return false;} return true; });
    },
    draw(ctx,s) {
      const sky=ctx.createLinearGradient(0,0,0,600); sky.addColorStop(0,"#8bd0d0"); sky.addColorStop(1,"#e8d69b"); ctx.fillStyle=sky; ctx.fillRect(0,0,W,600);
      ctx.fillStyle="#79a56b"; ctx.beginPath(); ctx.moveTo(0,GROUND); for(let x=0;x<=W;x+=90)ctx.lineTo(x,390+Math.sin(x*.018)*22); ctx.lineTo(W,GROUND); ctx.fill();
      ctx.fillStyle="#83b978"; ctx.fillRect(0,GROUND,W,130); ctx.fillStyle="#d6bd75"; for(let x=-s.stripe;x<W;x+=70)ctx.fillRect(x,GROUND+20,38,5);
      const flowers=[[70,515,"#f08b9d"],[135,555,"#ffd166"],[270,520,"#fff4c2"],[360,565,"#b88cff"],[520,515,"#f08b9d"],[635,555,"#ffd166"],[755,525,"#fff4c2"],[885,565,"#b88cff"]];
      for(const [x,y,color] of flowers){ctx.strokeStyle="#3f814b";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x-2,y-2);ctx.stroke();ctx.fillStyle=color;for(let a=0;a<5;a++){const angle=a*Math.PI*2/5;ctx.beginPath();ctx.arc(x+Math.cos(angle)*7,y+Math.sin(angle)*7,5,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#f4c95d";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle="#8c633c"; ctx.lineWidth=6; for(let x=20;x<940;x+=75){ctx.beginPath();ctx.moveTo(x,410);ctx.lineTo(x,470);ctx.stroke();} ctx.beginPath();ctx.moveTo(0,430);ctx.lineTo(W,430);ctx.stroke();
      for(const o of s.obstacles){
        const top=GROUND-o.h;
        if(o.kind===0){ctx.strokeStyle="#e8e2c7";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(o.x+8,GROUND);ctx.lineTo(o.x+8,top);ctx.moveTo(o.x+o.w-8,GROUND);ctx.lineTo(o.x+o.w-8,top);ctx.stroke();ctx.strokeStyle="#e05e52";ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(o.x,top+8);ctx.lineTo(o.x+o.w,top+8);ctx.stroke();ctx.fillStyle="#f5c85d";ctx.fillRect(o.x-6,top+3,o.w+12,6);}
        else if(o.kind===1){ctx.fillStyle="#4b91a0";ctx.beginPath();ctx.arc(o.x+o.w/2,GROUND,o.w/2,Math.PI,0);ctx.lineTo(o.x+o.w,GROUND);ctx.lineTo(o.x,GROUND);ctx.fill();ctx.strokeStyle="#d6edf0";ctx.lineWidth=5;ctx.stroke();ctx.fillStyle="#376b78";ctx.fillRect(o.x+8,GROUND-8,o.w-16,8);}
        else{ctx.fillStyle="#d87b45";ctx.beginPath();ctx.moveTo(o.x,GROUND);ctx.lineTo(o.x+o.w,GROUND);ctx.lineTo(o.x+o.w-8,top+18);ctx.lineTo(o.x+12,top);ctx.closePath();ctx.fill();ctx.fillStyle="#f4cf63";ctx.fillRect(o.x+9,top+8,o.w-18,8);ctx.strokeStyle="#fff0c2";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(o.x+16,GROUND-5);ctx.lineTo(o.x+o.w-14,GROUND-5);ctx.stroke();}
      }
      for(const b of s.bonesOnTrack) drawEmoji(ctx,"\u{1F9B4}",b.x,b.y+Math.sin(b.bob)*5,34,{rotation:-.18});
      for(const c of s.cucumberTargets){drawEmoji(ctx,"🥒",c.x,c.y,36,{rotation:-.18});if(c.x>110&&c.x<350){ctx.fillStyle="#fff8df";ctx.font="700 16px 'Trebuchet MS'";ctx.fillText("TREFFER!",c.x-25,c.y-30);}}
      ctx.strokeStyle="#6f4d32"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(166, s.walker.y+5); ctx.quadraticCurveTo(185, s.walker.y-16, 202, s.dog.y+5); ctx.stroke();
      drawEmoji(ctx,"\u{1F9D1}",160,s.walker.y,64,{offsetY:8}); drawEmoji(ctx,"\u{1F415}",205,s.dog.y,53,{offsetY:8});
      ctx.fillStyle="rgba(28,65,58,.86)";ctx.fillRect(24,102,250,96);ctx.fillStyle="#fff8df";ctx.font="700 20px 'Trebuchet MS'";ctx.fillText(`LEVEL ${s.level}`,40,132);ctx.fillText(`KNOCHEN ${s.bones}`,40,160);ctx.fillText(`GURKEN ${s.cucumbers}`,40,188);
      ctx.fillStyle="rgba(28,65,58,.9)";ctx.fillRect(790,28,140,58);ctx.strokeStyle="#ffd166";ctx.lineWidth=3;ctx.strokeRect(790,28,140,58);ctx.fillStyle="#fff8df";ctx.textAlign="center";ctx.font="700 18px 'Trebuchet MS'";ctx.fillText("LEVEL",860,51);ctx.font="700 25px 'Trebuchet MS'";ctx.fillText(String(s.level),860,77);ctx.textAlign="left";
    },
    hud(s){return [{label:"ZEIT",value:`${s.time.toFixed(1)} s`},{label:"LEVEL",value:String(s.level)},{label:"KNOCHEN",value:String(s.bones)},{label:"GURKEN",value:String(s.cucumbers)},{label:"SPRÜNGE",value:String(s.jumps)}];},
    overlay(s){if(s.status==="ready")return{title:"Bereit für den Hundepark?",message:"Springt gemeinsam über Hindernisse und sammelt so viele Knochen wie möglich.",action:"Spaziergang starten"};if(s.status==="paused")return{title:"Kurze Pause",message:"Mensch und Hund warten auf dich.",action:"Weitergehen"};return{title:"Parcours beendet",message:`Ihr habt ${s.bones} Knochen gesammelt und Level ${s.level} erreicht.`,action:"Nochmal spazieren"};}
  };
  mount(game);
})();
