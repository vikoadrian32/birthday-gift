import { useEffect, useRef, useState } from "react";
import { config } from "../config";

export default function TabGame({ onWin }) {
  const canvasRef = useRef(null);
  const keysRef   = useRef({ left: false, right: false });
  const gameRef   = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);

  const PLAYER_SPRITE = config.game?.playerSprite || "/assets/player.png";

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const GRAVITY = 0.45;
    const LEVEL_W = 900;

    let state = "intro";
    let sc = 0, lv = 3, cn = 0;
    let camX = 0;
    let animId = null;

    const playerImg = new Image();
    playerImg.src = PLAYER_SPRITE;

    let p = {};
    function resetPlayer() {
      p = { x:30, y:90, w:32, h:42, vx:0, vy:0,
            onGround:false, dir:1, frame:0, frameTimer:0,
            invincible:0 };
    }
    resetPlayer();

    // ── PLATFORMS (termasuk crumble & falling) ──
    const PLATFORM_DEFS = [
      ...Array.from({length:60},(_,i)=>({x:i*16,y:176,w:16,h:24,type:"ground"}))
        .filter(pl=>!(pl.x>=300&&pl.x<328)),
      {x:80, y:142,w:48,h:16,type:"brick"},
      {x:180,y:122,w:32,h:16,type:"brick"},
      {x:260,y:102,w:32,h:16,type:"crumble"}, // hancur
      {x:340,y:130,w:48,h:16,type:"brick"},
      {x:420,y:110,w:48,h:16,type:"falling"},  // jatuh
      {x:500,y:90, w:32,h:16,type:"brick"},
      {x:560,y:120,w:48,h:16,type:"crumble"},  // hancur
      {x:630,y:100,w:48,h:16,type:"falling"},  // jatuh
      {x:710,y:110,w:64,h:16,type:"brick"},
      // Pipa (untuk fireball)
      {x:150,y:152,w:24,h:24,type:"pipe",fireRate:180},
      {x:480,y:144,w:24,h:32,type:"pipe",fireRate:120},
      {x:660,y:144,w:24,h:32,type:"pipe",fireRate:150},
    ];

    let platforms = PLATFORM_DEFS.map(pl=>({
      ...pl,
      crumbleTimer: 0,
      crumbled: false,
      fallVy: 0,
      falling: false,
      fireTimer: Math.floor(Math.random()*180),
    }));

    // ── COINS ──
    let coinItems = [
      {x:88,y:128},{x:104,y:128},{x:188,y:108},{x:268,y:88},
      {x:348,y:116},{x:428,y:96},{x:508,y:76},{x:568,y:106},
      {x:638,y:86},{x:718,y:96},{x:734,y:96},{x:750,y:96},
    ].map(c=>({...c,collected:false}));

    // ── ENEMIES ──
    const ENEMY_DEFS = [{x:200},{x:360},{x:440},{x:540},{x:700},{x:800}];
    let enemies = ENEMY_DEFS.map(e=>({
      ...e,y:160,w:14,h:14,vx:-0.8,vy:0,
      alive:true,stomped:false,stompTimer:0,
    }));

    // ── FIREBALLS ──
    let fireballs = [];

    // ── ROCKS ──
    let rocks = [];
    let rockTimer = 300;

    // ── SPIKES ──
    const spikes = [
      {x:220,y:168,w:16,h:8},
      {x:380,y:168,w:16,h:8},
      {x:590,y:168,w:16,h:8},
      {x:780,y:168,w:24,h:8},
    ];

    // ── GOAL ──
    const goal = {x:860,y:80,w:16,h:96};

    function collide(a,b){
      return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
    }

    function hurtPlayer(){
      if(p.invincible>0) return;
      lv--; setLives(lv);
      p.invincible=90;
      if(lv<=0){state="dead"; return;}
      p.vy=-5; p.vx = p.dir>0?-3:3;
    }

    function resolvePlayer(){
      platforms.forEach(pl=>{
        if(pl.crumbled||pl.type==="pipe") return;
        if(!collide(p,pl)) return;
        const ox=Math.min(p.x+p.w,pl.x+pl.w)-Math.max(p.x,pl.x);
        const oy=Math.min(p.y+p.h,pl.y+pl.h)-Math.max(p.y,pl.y);
        if(ox>oy){
          if(p.y+p.h/2<pl.y+pl.h/2){
            p.y=pl.y-p.h; p.vy=0; p.onGround=true;
            // Crumble
            if(pl.type==="crumble"&&pl.crumbleTimer===0) pl.crumbleTimer=1;
            // Falling
            if(pl.type==="falling") pl.falling=true;
          } else { p.y=pl.y+pl.h; p.vy=0; }
        } else {
          if(p.x+p.w/2<pl.x+pl.w/2) p.x=pl.x-p.w;
          else p.x=pl.x+pl.w;
          p.vx=0;
        }
      });
    }

    function doJump(){
      if(p.onGround&&state==="playing"){p.vy=-9;p.onGround=false;}
    }

    function fullReset(){
      sc=0;lv=3;cn=0;
      setScore(0);setLives(3);setCoins(0);
      coinItems.forEach(c=>c.collected=false);
      platforms=PLATFORM_DEFS.map(pl=>({
        ...pl,crumbleTimer:0,crumbled:false,
        fallVy:0,falling:false,
        fireTimer:Math.floor(Math.random()*180),
      }));
      enemies=ENEMY_DEFS.map(e=>({
        ...e,y:160,w:14,h:14,vx:-0.8,vy:0,
        alive:true,stomped:false,stompTimer:0,
      }));
      fireballs=[]; rocks=[]; rockTimer=300;
      resetPlayer(); camX=0;
    }

    function update(){
      if(state!=="playing") return;

      // Player
      if(keysRef.current.left)      {p.vx=-2.5;p.dir=-1;}
      else if(keysRef.current.right){p.vx=2.5; p.dir=1;}
      else p.vx*=0.8;

      p.vy+=GRAVITY; p.x+=p.vx; p.y+=p.vy;
      p.onGround=false;
      if(p.invincible>0) p.invincible--;
      resolvePlayer();
      if(p.x<0)p.x=0;
      if(p.x+p.w>LEVEL_W)p.x=LEVEL_W-p.w;

      // Fall death
      if(p.y>H+60){
        lv--;setLives(lv);
        if(lv<=0){state="dead";return;}
        resetPlayer();camX=0;
      }

      // Platforms update
      platforms.forEach(pl=>{
        // Crumble
        if(pl.type==="crumble"&&pl.crumbleTimer>0&&!pl.crumbled){
          pl.crumbleTimer++;
          if(pl.crumbleTimer>45) pl.crumbled=true;
        }
        // Falling
        if(pl.type==="falling"&&pl.falling){
          pl.fallVy+=0.3;
          pl.y+=pl.fallVy;
          if(pl.y>H+50){pl.y=110;pl.fallVy=0;pl.falling=false;}
        }
        // Fireball spawn
        if(pl.type==="pipe"){
          pl.fireTimer++;
          if(pl.fireTimer>=pl.fireRate){
            pl.fireTimer=0;
            fireballs.push({
              x:pl.x+pl.w/2-4, y:pl.y-8,
              w:8,h:8, vx:(Math.random()>0.5?1.5:-1.5), vy:-3,
              life:180,
            });
          }
        }
      });

      // Fireballs
      fireballs=fireballs.filter(f=>{
        f.vy+=0.3; f.x+=f.vx; f.y+=f.vy; f.life--;
        // Bounce off ground
        if(f.y+f.h>176){f.y=176-f.h;f.vy*=-0.6;f.vx*=0.95;}
        // Bounce off platforms
        platforms.forEach(pl=>{
          if(pl.crumbled||pl.type==="pipe") return;
          if(collide(f,pl)){f.vy*=-0.6;f.y=pl.y-f.h;}
        });
        // Hit player
        if(collide(f,p)){hurtPlayer();return false;}
        return f.life>0&&f.x>-50&&f.x<LEVEL_W+50;
      });

      // Rocks
      rockTimer--;
      if(rockTimer<=0){
        rockTimer=200+Math.floor(Math.random()*150);
        rocks.push({
          x:camX+W+20, y:50,
          w:12,h:12, vx:-3,vy:0,
          onGround:false,
        });
      }
      rocks=rocks.filter(r=>{
        r.vy+=GRAVITY; r.x+=r.vx; r.y+=r.vy;
        r.onGround=false;
        // Collide platforms
        platforms.forEach(pl=>{
          if(pl.crumbled||pl.type==="pipe") return;
          if(!collide(r,pl)) return;
          const oy=Math.min(r.y+r.h,pl.y+pl.h)-Math.max(r.y,pl.y);
          const ox=Math.min(r.x+r.w,pl.x+pl.w)-Math.max(r.x,pl.x);
          if(ox>oy){
            if(r.y+r.h/2<pl.y+pl.h/2){r.y=pl.y-r.h;r.vy*=-0.3;r.onGround=true;}
          }
        });
        if(r.y+r.h>=176){r.y=176-r.h;r.vy*=-0.2;r.onGround=true;}
        if(collide(r,p)){hurtPlayer();}
        return r.x>-100;
      });

      // Spikes
      spikes.forEach(s=>{
        if(collide(p,s)) hurtPlayer();
      });

      // Coins
      coinItems.forEach(c=>{
        if(c.collected) return;
        if(collide(p,{x:c.x,y:c.y,w:8,h:8})){
          c.collected=true;cn++;sc+=100;
          setCoins(cn);setScore(sc);
        }
      });

      // Enemies
      enemies.forEach(e=>{
        if(!e.alive) return;
        if(e.stomped){e.stompTimer--;if(e.stompTimer<=0)e.alive=false;return;}
        e.x+=e.vx; e.vy=(e.vy||0)+GRAVITY; e.y+=e.vy;
        platforms.forEach(pl=>{
          if(pl.crumbled||pl.type==="pipe") return;
          if(!collide(e,pl)) return;
          const ox=Math.min(e.x+e.w,pl.x+pl.w)-Math.max(e.x,pl.x);
          const oy=Math.min(e.y+e.h,pl.y+pl.h)-Math.max(e.y,pl.y);
          if(ox>oy){if(e.y+e.h/2<pl.y+pl.h/2){e.y=pl.y-e.h;e.vy=0;}
          else{e.y=pl.y+pl.h;e.vy=0;}}
          else e.vx*=-1;
        });
        if(e.y>H) e.alive=false;
        if(e.x<0||e.x>LEVEL_W) e.vx*=-1;
        if(collide(p,e)){
          if(p.vy>0&&p.y+p.h<e.y+e.h*0.6){
            e.stomped=true;e.stompTimer=20;p.vy=-5;sc+=200;setScore(sc);
          } else hurtPlayer();
        }
      });

      // Goal
      if(collide(p,goal)){sc+=1000;setScore(sc);state="win";onWin?.();}

      // Anim
      p.frameTimer++;
      if(p.frameTimer>8){p.frame=(p.frame+1)%2;p.frameTimer=0;}

      // Camera
      camX=Math.max(0,Math.min(p.x-W/3,LEVEL_W-W));
    }

    // ── DRAW ──
    function drawBg(){
      ctx.fillStyle="#5c94fc";ctx.fillRect(0,0,W,H);
      [[60,25],[160,15],[240,35],[360,20]].forEach(([cx,cy])=>{
        ctx.fillStyle="rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.ellipse(cx-camX*0.3,cy,24,14,0,0,Math.PI*2);
        ctx.ellipse(cx+16-camX*0.3,cy-7,18,11,0,0,Math.PI*2);
        ctx.fill();
      });
      ctx.fillStyle="#52a830";
      [[80,176,55],[220,176,45],[400,176,65],[580,176,50],[760,176,60]].forEach(([hx,hy,hr])=>{
        ctx.beginPath();ctx.arc(hx-camX*0.6,hy,hr,Math.PI,0);ctx.fill();
      });
    }

    function drawPlatform(pl){
      const dx=pl.x-camX;
      if(pl.crumbled) return;
      if(dx+pl.w<-20||dx>W+20) return;

      if(pl.type==="ground"){
        ctx.fillStyle="#8B4513";ctx.fillRect(dx,pl.y+4,pl.w,pl.h-4);
        ctx.fillStyle="#52a830";ctx.fillRect(dx,pl.y,pl.w,6);
        ctx.fillStyle="#3d7a22";ctx.fillRect(dx,pl.y,pl.w,2);
      } else if(pl.type==="brick"){
        ctx.fillStyle="#c84c0c";ctx.fillRect(dx,pl.y,pl.w,pl.h);
        ctx.strokeStyle="#a03c08";ctx.lineWidth=1;
        for(let bx=dx;bx<dx+pl.w;bx+=8)ctx.strokeRect(bx,pl.y,8,pl.h);
        ctx.strokeRect(dx,pl.y,pl.w,pl.h);
      } else if(pl.type==="crumble"){
        // Bergetar jika mau hancur
        const shake=pl.crumbleTimer>20?Math.random()*2-1:0;
        const alpha=pl.crumbleTimer>0?Math.max(0,1-(pl.crumbleTimer/45)):1;
        ctx.globalAlpha=alpha;
        ctx.fillStyle="#c8800c";ctx.fillRect(dx+shake,pl.y,pl.w,pl.h);
        ctx.strokeStyle="#a06008";ctx.lineWidth=1;
        for(let bx=dx+shake;bx<dx+shake+pl.w;bx+=8)ctx.strokeRect(bx,pl.y,8,pl.h);
        // Crack lines
        if(pl.crumbleTimer>10){
          ctx.strokeStyle="rgba(0,0,0,0.4)";ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(dx+shake+6,pl.y);ctx.lineTo(dx+shake+10,pl.y+pl.h);ctx.stroke();
          ctx.beginPath();ctx.moveTo(dx+shake+18,pl.y);ctx.lineTo(dx+shake+14,pl.y+pl.h);ctx.stroke();
        }
        ctx.globalAlpha=1;
      } else if(pl.type==="falling"){
        // Warna berbeda — kuning/orange
        ctx.fillStyle=pl.falling?"#cc8800":"#ddaa00";
        ctx.fillRect(dx,pl.y,pl.w,pl.h);
        ctx.strokeStyle="#aa7700";ctx.lineWidth=1;
        ctx.strokeRect(dx,pl.y,pl.w,pl.h);
        // Arrow down indicator
        if(!pl.falling){
          ctx.fillStyle="rgba(0,0,0,0.3)";
          ctx.font="8px sans-serif";ctx.textAlign="center";
          ctx.fillText("↓",dx+pl.w/2,pl.y+pl.h-2);
          ctx.textAlign="left";
        }
      } else if(pl.type==="pipe"){
        ctx.fillStyle="#22aa22";ctx.fillRect(dx-2,pl.y,pl.w+4,8);
        ctx.fillStyle="#118811";ctx.fillRect(dx,pl.y+8,pl.w,pl.h-8);
        ctx.fillStyle="#44cc44";ctx.fillRect(dx+2,pl.y+10,4,pl.h-12);
      }
    }

    function drawSpike(s){
      const dx=s.x-camX;
      if(dx+s.w<0||dx>W) return;
      ctx.fillStyle="#888";
      const count=Math.floor(s.w/8);
      for(let i=0;i<count;i++){
        ctx.beginPath();
        ctx.moveTo(dx+i*8,s.y+s.h);
        ctx.lineTo(dx+i*8+4,s.y);
        ctx.lineTo(dx+i*8+8,s.y+s.h);
        ctx.fill();
      }
      // Shine
      ctx.fillStyle="rgba(255,255,255,0.3)";
      for(let i=0;i<count;i++){
        ctx.beginPath();
        ctx.moveTo(dx+i*8+2,s.y+s.h-2);
        ctx.lineTo(dx+i*8+4,s.y+2);
        ctx.lineTo(dx+i*8+5,s.y+s.h-2);
        ctx.fill();
      }
    }

    function drawCoin(c){
      if(c.collected) return;
      const dx=c.x-camX;
      if(dx<-10||dx>W+10) return;
      ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(dx+4,c.y+4,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ffaa00";ctx.beginPath();ctx.arc(dx+4,c.y+4,2.5,0,Math.PI*2);ctx.fill();
    }

    function drawFireball(f){
      const dx=f.x-camX;
      if(dx<-20||dx>W+20) return;
      // Glow
      ctx.fillStyle="rgba(255,100,0,0.3)";
      ctx.beginPath();ctx.arc(dx+4,f.y+4,8,0,Math.PI*2);ctx.fill();
      // Core
      ctx.fillStyle="#ff6600";ctx.beginPath();ctx.arc(dx+4,f.y+4,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#ffcc00";ctx.beginPath();ctx.arc(dx+4,f.y+4,2,0,Math.PI*2);ctx.fill();
      // Trail
      ctx.fillStyle="rgba(255,100,0,0.2)";
      ctx.beginPath();ctx.arc(dx+4-f.vx*2,f.y+4,3,0,Math.PI*2);ctx.fill();
    }

    function drawRock(r){
      const dx=r.x-camX;
      if(dx<-20||dx>W+20) return;
      ctx.fillStyle="#888";
      ctx.beginPath();ctx.ellipse(dx+6,r.y+6,6,5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#aaa";
      ctx.beginPath();ctx.ellipse(dx+4,r.y+3,3,2,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#666";ctx.lineWidth=0.5;
      ctx.beginPath();ctx.ellipse(dx+6,r.y+6,6,5,0,0,Math.PI*2);ctx.stroke();
    }

    function drawEnemy(e){
      if(!e.alive) return;
      const dx=e.x-camX;
      if(dx<-20||dx>W+20) return;
      if(e.stomped){ctx.fillStyle="#8B4513";ctx.fillRect(dx,e.y+8,e.w,6);return;}
      ctx.fillStyle="#8B4513";ctx.fillRect(dx+1,e.y+4,e.w-2,e.h-4);
      ctx.fillStyle="#a0522d";ctx.beginPath();ctx.ellipse(dx+e.w/2,e.y+5,7,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#fff";ctx.fillRect(dx+2,e.y+2,4,4);ctx.fillRect(dx+8,e.y+2,4,4);
      ctx.fillStyle="#000";ctx.fillRect(dx+3,e.y+3,2,2);ctx.fillRect(dx+9,e.y+3,2,2);
      ctx.fillStyle="#8B4513";ctx.fillRect(dx,e.y+e.h-4,5,4);ctx.fillRect(dx+e.w-5,e.y+e.h-4,5,4);
    }

    function drawPlayer(){
      const dx=p.x-camX;
      ctx.save();
      if(p.invincible>0&&Math.floor(p.invincible/6)%2===0){
        ctx.globalAlpha=0.4;
      }
      if(p.dir<0){ctx.scale(-1,1);ctx.translate(-dx*2-p.w,0);}

      if(playerImg.complete&&playerImg.naturalWidth>0){
        const bounceY=p.onGround?Math.sin(p.frame*Math.PI)*1.5:0;
        ctx.drawImage(playerImg,dx-6,p.y-bounceY,p.w+12,p.h+12);
      } else {
        ctx.fillStyle="#cc2200";ctx.fillRect(dx,p.y,p.w,5);ctx.fillRect(dx-2,p.y+2,p.w+4,4);
        ctx.fillStyle="#ffcc99";ctx.fillRect(dx+1,p.y+5,p.w-2,7);
        ctx.fillStyle="#000";ctx.fillRect(dx+8,p.y+6,3,3);
        ctx.fillStyle="#8B4513";ctx.fillRect(dx+4,p.y+10,p.w-4,2);
        ctx.fillStyle="#3344cc";ctx.fillRect(dx+1,p.y+12,p.w-2,6);
        ctx.fillStyle="#442200";ctx.fillRect(dx,p.y+p.h-3,7,3);ctx.fillRect(dx+7,p.y+p.h-3,7,3);
      }
      ctx.restore();
    }

    function drawGoal(){
      const dx=goal.x-camX;
      if(dx<-20||dx>W+20) return;
      ctx.fillStyle="#aaa";ctx.fillRect(dx+7,goal.y,2,goal.h);
      ctx.fillStyle="#D4A017";
      ctx.beginPath();ctx.moveTo(dx+9,goal.y);ctx.lineTo(dx+26,goal.y+10);ctx.lineTo(dx+9,goal.y+20);ctx.fill();
      ctx.fillStyle="#888";ctx.fillRect(dx+2,goal.y+goal.h-4,12,4);
    }

    function drawOverlay(){
      ctx.textAlign="center";
      if(state==="intro"){
        ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,W,H);
        ctx.fillStyle="#D4A017";ctx.font='8px "Press Start 2P"';
        ctx.fillText("BIRTHDAY RUNNER!",W/2,60);
        ctx.fillStyle="#fff";ctx.font='5px "Press Start 2P"';
        ctx.fillText("🔥 Hindari bola api dari pipa",W/2,85);
        ctx.fillText("💥 Brick merah akan hancur!",W/2,100);
        ctx.fillText("⬇️ Platform kuning akan jatuh!",W/2,115);
        ctx.fillText("🪨 Hindari batu menggelinding!",W/2,130);
        ctx.fillText("🌵 Jangan injak duri!",W/2,145);
        ctx.fillStyle="#c8e8a8";ctx.font='6px "Press Start 2P"';
        ctx.fillText("PRESS JUMP TO START",W/2,172);
      } else if(state==="dead"){
        ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,W,H);
        ctx.fillStyle="#cc2200";ctx.font='9px "Press Start 2P"';ctx.fillText("GAME OVER",W/2,75);
        ctx.fillStyle="#fff";ctx.font='6px "Press Start 2P"';ctx.fillText("SCORE: "+sc,W/2,105);
        ctx.fillStyle="#D4A017";ctx.fillText("PRESS JUMP TO RETRY",W/2,155);
      } else if(state==="win"){
        ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(0,0,W,H);
        ctx.fillStyle="#D4A017";ctx.font='8px "Press Start 2P"';ctx.fillText("YOU WIN!",W/2,55);
        ctx.fillStyle="#fff";ctx.font='6px "Press Start 2P"';ctx.fillText("HAPPY BIRTHDAY",W/2,80);
        ctx.fillStyle="#c8e8a8";ctx.fillText("VANESA! 🎂",W/2,98);
        ctx.fillStyle="#D4A017";ctx.fillText("SCORE: "+sc,W/2,122);ctx.fillText("COINS: "+cn,W/2,140);
        ctx.fillStyle="#fff";ctx.fillText("PRESS JUMP TO PLAY AGAIN",W/2,175);
      }
      ctx.textAlign="left";
    }

    function loop(){
      update();
      ctx.clearRect(0,0,W,H);
      drawBg();
      platforms.forEach(drawPlatform);
      spikes.forEach(drawSpike);
      coinItems.forEach(drawCoin);
      fireballs.forEach(drawFireball);
      rocks.forEach(drawRock);
      drawGoal();
      enemies.forEach(drawEnemy);
      drawPlayer();
      drawOverlay();
      animId=requestAnimationFrame(loop);
    }

    gameRef.current={
      doJump:()=>{
        if(state==="intro"){state="playing";return;}
        if(state==="dead"){fullReset();state="playing";return;}
        if(state==="win"){fullReset();state="playing";return;}
        doJump();
      }
    };

    if(playerImg.complete&&playerImg.naturalWidth>0){
      animId=requestAnimationFrame(loop);
    } else {
      playerImg.onload=()=>{animId=requestAnimationFrame(loop);};
      playerImg.onerror=()=>{animId=requestAnimationFrame(loop);};
    }

    const onKeyDown=e=>{
      if(e.key==="ArrowLeft") keysRef.current.left=true;
      if(e.key==="ArrowRight")keysRef.current.right=true;
      if(e.key==="ArrowUp"||e.key===" ")gameRef.current?.doJump();
    };
    const onKeyUp=e=>{
      if(e.key==="ArrowLeft") keysRef.current.left=false;
      if(e.key==="ArrowRight")keysRef.current.right=false;
    };
    window.addEventListener("keydown",onKeyDown);
    window.addEventListener("keyup",onKeyUp);

    return()=>{
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown",onKeyDown);
      window.removeEventListener("keyup",onKeyUp);
    };
  },[]);

  return (
    <div style={{userSelect:"none"}}>
      <style>{`
        .game-hud{
          display:flex;justify-content:space-between;
          padding:5px 10px;background:#1a0a0a;
          font-family:'Press Start 2P',monospace;font-size:7px;color:#D4A017;
        }
        .game-controls{
          display:flex;justify-content:space-between;
          align-items:center;padding:6px 10px 2px;
        }
        .dpad{display:flex;gap:6px;}
        .gbtn{
          width:44px;height:44px;border-radius:8px;
          background:linear-gradient(180deg,#3c3c3c,#1a1a1a);
          border:none;color:#fff;font-size:16px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 0 #000;touch-action:manipulation;
        }
        .gbtn:active{transform:translateY(2px);box-shadow:0 1px 0 #000;}
        .jump-btn{
          width:56px;height:56px;border-radius:50%;
          background:linear-gradient(180deg,#8B2525,#4A0E0E);
          border:2px solid #D4A017;color:#D4A017;
          font-family:'Press Start 2P',monospace;font-size:6px;
          cursor:pointer;box-shadow:0 3px 0 #4A0E0E;
          display:flex;align-items:center;justify-content:center;
          touch-action:manipulation;
        }
        .jump-btn:active{transform:translateY(2px);}
      `}</style>

      <div className="game-hud">
        <span>SC:{score}</span>
        <span>♥{lives}</span>
        <span>🪙{coins}</span>
      </div>

      <canvas ref={canvasRef} width={420} height={200}
        style={{display:"block",background:"#5c94fc",width:"100%"}}/>

      <div className="game-controls">
        <div className="dpad">
          <button className="gbtn"
            onMouseDown={()=>keysRef.current.left=true}
            onMouseUp={()=>keysRef.current.left=false}
            onTouchStart={e=>{e.preventDefault();keysRef.current.left=true;}}
            onTouchEnd={()=>keysRef.current.left=false}>◀</button>
          <button className="gbtn"
            onMouseDown={()=>keysRef.current.right=true}
            onMouseUp={()=>keysRef.current.right=false}
            onTouchStart={e=>{e.preventDefault();keysRef.current.right=true;}}
            onTouchEnd={()=>keysRef.current.right=false}>▶</button>
        </div>
        <button className="jump-btn"
          onMouseDown={()=>gameRef.current?.doJump()}
          onTouchStart={e=>{e.preventDefault();gameRef.current?.doJump();}}>
          JUMP
        </button>
      </div>
    </div>
  );
}