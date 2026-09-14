const ESP32="http://192.168.4.1";

let state={front:-1,rear:-1,speed:70,mode:"manual",lights:false,emergency:false,signal:"off"};
let holdTimer=null;
let currentCommand="S";
let emergencyActive=false;
let currentSignal="off";
let lightsActive=false;

const $=id=>document.getElementById(id);

function command(path){
  return fetch(ESP32+path,{method:"GET",mode:"no-cors",cache:"no-store"}).catch(()=>{});
}

async function getStatus(){
  const r=await fetch(ESP32+"/status?t="+Date.now(),{cache:"no-store"});
  if(!r.ok)throw new Error();
  return r.json();
}

function setOnline(online){
  $("railDot").classList.toggle("online",online);
  $("railStatusText").textContent=online?"CONECTADO":"DESCONECTADO";
  $("commandDot").classList.toggle("online",online);
  $("commandConnection").textContent=online?"CONECTADO":"DESCONECTADO";
  $("radarConnection").textContent=online?"EN VIVO":"ESPERANDO";
}

function dist(v){
  return v!=null&&v>=0?Number(v).toFixed(1)+" cm":"-- cm";
}

function signalName(v){
  if(v==="left")return "IZQUIERDA";
  if(v==="right")return "DERECHA";
  if(v==="hazard")return "INTERMITENTES";
  return "OFF";
}

function render(data){
  state=data;
  setOnline(true);

  $("heroMode").textContent=data.mode==="manual"?"MANUAL":"AUTOMÁTICO";
  $("heroSpeed").textContent=data.speed+"%";
  $("heroFront").textContent=dist(data.front);
  $("heroRear").textContent=dist(data.rear);

  $("bpFront").textContent=dist(data.front);
  $("bpRear").textContent=dist(data.rear);

  $("frontMetric").textContent=data.front>=0?Number(data.front).toFixed(1):"--";
  $("rearMetric").textContent=data.rear>=0?Number(data.rear).toFixed(1):"--";
  $("speedMetric").textContent=data.speed;
  $("modeMetric").textContent=data.mode==="manual"?"MANUAL":"AUTOMÁTICO";

  $("frontBar").style.width=Math.min(100,Math.max(0,(data.front/400)*100))+"%";
  $("rearBar").style.width=Math.min(100,Math.max(0,(data.rear/400)*100))+"%";
  $("speedBar").style.width=data.speed+"%";

  $("miniFront").textContent=dist(data.front);
  $("miniRear").textContent=dist(data.rear);
  $("miniLights").textContent=data.lights?"ON":"OFF";
  $("miniSignal").textContent=signalName(data.signal);
  $("miniMode").textContent=data.mode==="manual"?"MANUAL":"AUTOMÁTICO";
  $("miniSpeed").textContent=data.speed+"%";
  $("speedValue").textContent=data.speed+"%";

  if(document.activeElement!==$("speedRange"))$("speedRange").value=data.speed;

  lightsActive=!!data.lights;
  emergencyActive=!!data.emergency;
  currentSignal=data.signal||"off";

  paintActions();
  updateEmergency();
  setModeUI(data.mode);

  if(emergencyActive)$("driveState").textContent="EMERGENCIA";
}

async function poll(){
  try{render(await getStatus())}
  catch{setOnline(false)}
}
setInterval(poll,500);
poll();

// DRIVE
const driveMap={
  forward:["F","AVANZANDO"],
  back:["B","RETROCEDIENDO"],
  left:["L","IZQUIERDA"],
  right:["R","DERECHA"]
};

function sendMove(cmd){command("/cmd?m="+cmd)}

function clearDrive(){
  document.querySelectorAll(".drive-control").forEach(b=>b.classList.remove("active"));
}

function startMove(cmd,label){
  if(emergencyActive){$("driveState").textContent="EMERGENCIA";return}
  stopMove(false);
  currentCommand=cmd;
  sendMove(cmd);
  $("driveState").textContent=label;
  holdTimer=setInterval(()=>sendMove(cmd),250);
}

function stopMove(sendStop=true){
  if(holdTimer){clearInterval(holdTimer);holdTimer=null}
  if(sendStop)sendMove("S");
  currentCommand="S";
  clearDrive();
}

document.querySelectorAll(".drive-control").forEach(btn=>{
  const action=btn.dataset.command;

  if(action==="stop"){
    btn.addEventListener("click",()=>{
      stopMove();
      $("driveState").textContent="DETENIDO";
    });
    return;
  }

  const press=e=>{
    e.preventDefault();
    const cfg=driveMap[action];
    clearDrive();
    btn.classList.add("active");
    startMove(cfg[0],cfg[1]);
  };

  const release=()=>{
    if(currentCommand!=="S"){
      stopMove();
      if(!emergencyActive)$("driveState").textContent="DETENIDO";
    }
  };

  btn.addEventListener("pointerdown",press);
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>btn.addEventListener(ev,release));
});

// KEYBOARD
const keyMap={w:"F",arrowup:"F",s:"B",arrowdown:"B",a:"L",arrowleft:"L",d:"R",arrowright:"R"};
const keyLabel={F:"AVANZANDO",B:"RETROCEDIENDO",L:"IZQUIERDA",R:"DERECHA"};

document.addEventListener("keydown",e=>{
  if(["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;

  if(e.code==="Space"){
    e.preventDefault();
    stopMove();
    $("driveState").textContent="DETENIDO";
    return;
  }

  const cmd=keyMap[e.key.toLowerCase()];
  if(!cmd)return;

  e.preventDefault();

  if(currentCommand!==cmd)startMove(cmd,keyLabel[cmd]);
});

document.addEventListener("keyup",e=>{
  if(!keyMap[e.key.toLowerCase()])return;
  e.preventDefault();
  stopMove();
  if(!emergencyActive)$("driveState").textContent="DETENIDO";
});

window.addEventListener("blur",()=>{if(currentCommand!=="S")stopMove()});

// SPEED
let speedTimer=null;
$("speedRange").addEventListener("input",()=>{
  const v=$("speedRange").value;
  $("speedValue").textContent=v+"%";
  $("speedMetric").textContent=v;
  $("miniSpeed").textContent=v+"%";
  $("heroSpeed").textContent=v+"%";
  $("speedBar").style.width=v+"%";

  clearTimeout(speedTimer);
  speedTimer=setTimeout(()=>command("/speed?v="+v),70);
});

// MODES
function setModeUI(mode){
  const manual=mode==="manual";
  $("manualMode").classList.toggle("active",manual);
  $("autoMode").classList.toggle("active",!manual);
}

$("manualMode").addEventListener("click",()=>{
  stopMove();
  command("/mode?m=manual");
  setModeUI("manual");
  $("driveState").textContent="DETENIDO";
});

$("autoMode").addEventListener("click",()=>{
  stopMove();
  command("/mode?m=auto");
  setModeUI("auto");
  $("driveState").textContent="AUTOMÁTICO";
});

// FUNCTIONS
const actions={};
document.querySelectorAll(".function-btn").forEach(b=>actions[b.dataset.action]=b);

function paintActions(){
  actions.lights?.classList.toggle("active",lightsActive);
  actions.leftSignal?.classList.toggle("active",currentSignal==="left");
  actions.rightSignal?.classList.toggle("active",currentSignal==="right");
  actions.hazard?.classList.toggle("active",currentSignal==="hazard");
}

actions.lights?.addEventListener("click",()=>command("/light?toggle=1"));

function toggleSignal(s){
  currentSignal=currentSignal===s?"off":s;
  paintActions();
  command("/signal?s="+currentSignal);
}
actions.leftSignal?.addEventListener("click",()=>toggleSignal("left"));
actions.rightSignal?.addEventListener("click",()=>toggleSignal("right"));
actions.hazard?.addEventListener("click",()=>toggleSignal("hazard"));

const hornOn=()=>{actions.horn?.classList.add("active");command("/horn?state=on")};
const hornOff=()=>{actions.horn?.classList.remove("active");command("/horn?state=off")};
actions.horn?.addEventListener("pointerdown",hornOn);
["pointerup","pointerleave","pointercancel"].forEach(ev=>actions.horn?.addEventListener(ev,hornOff));

const brakeOn=e=>{
  e.preventDefault();
  stopMove(false);
  actions.brake?.classList.add("active");
  sendMove("BR");
  $("driveState").textContent="FRENANDO";
};
const brakeOff=()=>{
  actions.brake?.classList.remove("active");
  sendMove("S");
  if(!emergencyActive)$("driveState").textContent="DETENIDO";
};
actions.brake?.addEventListener("pointerdown",brakeOn);
["pointerup","pointerleave","pointercancel"].forEach(ev=>actions.brake?.addEventListener(ev,brakeOff));

// EMERGENCY
function updateEmergency(){
  $("emergency").classList.toggle("active",emergencyActive);
  $("emergency").querySelector("span").textContent=emergencyActive?"TOCA PARA":"EMERGENCIA";
  $("emergency").querySelector("strong").textContent=emergencyActive?"REARMAR":"DETENER";
}
$("emergency").addEventListener("click",()=>{
  if(emergencyActive){
    command("/emergency?state=off");
    emergencyActive=false;
    $("driveState").textContent="DETENIDO";
  }else{
    stopMove(false);
    command("/emergency?state=on");
    emergencyActive=true;
    $("driveState").textContent="EMERGENCIA";
  }
  updateEmergency();
});

// BLUEPRINT TABS
const bpMap={
  core:["ESP32","ESP32 // CONTROLADOR PRINCIPAL"],
  drive:["L298N","TRACCIÓN // 4 MOTORES DC"],
  sense:["HC-SR04","SENSORES // ULTRASONIDO"],
  safe:["SEGURIDAD","SEGURIDAD // SEÑALIZACIÓN Y FRENO"]
};
document.querySelectorAll(".bp-step").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".bp-step").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const cfg=bpMap[btn.dataset.system];
    $("bpCore").textContent=cfg[0];
    $("blueprintCaption").textContent=cfg[1];
  });
});

// RADAR
const canvas=$("radarCanvas"),ctx=canvas.getContext("2d");
let phase=0;

function resizeRadar(){
  const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;
  canvas.width=r.width*dpr;
  canvas.height=r.height*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize",resizeRadar);
resizeRadar();

function drawRadar(){
  const r=canvas.getBoundingClientRect(),w=r.width,h=r.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#070c12";
  ctx.fillRect(0,0,w,h);

  ctx.strokeStyle="rgba(80,233,255,.055)";
  ctx.lineWidth=1;
  for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}

  const cx=w/2,cy=h/2,carW=Math.min(160,w*.28),carH=70,max=Math.min(w*.31,230);

  ctx.strokeStyle="#50e9ff";
  ctx.fillStyle="rgba(51,136,255,.09)";
  ctx.beginPath();
  ctx.roundRect(cx-carW/2,cy-carH/2,carW,carH,12);
  ctx.fill();ctx.stroke();

  ctx.fillStyle="#50e9ff";
  ctx.font="700 9px Arial";
  ctx.textAlign="center";
  ctx.fillText("ROBO-COC",cx,cy+3);

  const pulse=.82+Math.sin(phase)*.06;

  ctx.fillStyle="rgba(80,233,255,.035)";
  ctx.strokeStyle="rgba(80,233,255,.2)";
  ctx.beginPath();
  ctx.moveTo(cx+carW/2,cy);
  ctx.arc(cx+carW/2,cy,max*pulse,-.45,.45);
  ctx.closePath();ctx.fill();ctx.stroke();

  ctx.fillStyle="rgba(51,136,255,.035)";
  ctx.strokeStyle="rgba(51,136,255,.2)";
  ctx.beginPath();
  ctx.moveTo(cx-carW/2,cy);
  ctx.arc(cx-carW/2,cy,max*pulse,Math.PI-.45,Math.PI+.45);
  ctx.closePath();ctx.fill();ctx.stroke();

  if(state.front>0&&state.front<=400){
    const x=cx+carW/2+(Math.min(state.front,400)/400)*max;
    ctx.strokeStyle=state.front<30?"#ff415c":"#50e9ff";
    ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x,cy-40);ctx.lineTo(x,cy+40);ctx.stroke();
  }

  if(state.rear>0&&state.rear<=400){
    const x=cx-carW/2-(Math.min(state.rear,400)/400)*max;
    ctx.strokeStyle="#3388ff";
    ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x,cy-35);ctx.lineTo(x,cy+35);ctx.stroke();
  }

  phase+=.04;
  requestAnimationFrame(drawRadar);
}
drawRadar();

// REVEAL
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")});
},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>revealObs.observe(el));

// NAV
const navLinks=[...document.querySelectorAll(".rail-nav a")];
const sectionObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id));
  });
},{rootMargin:"-35% 0px -55% 0px"});
document.querySelectorAll("section[id]").forEach(s=>sectionObs.observe(s));

// CURSOR
document.addEventListener("mousemove",e=>{
  $("cursor").style.left=e.clientX+"px";
  $("cursor").style.top=e.clientY+"px";
  $("cursorTrail").style.left=e.clientX+"px";
  $("cursorTrail").style.top=e.clientY+"px";
});

// HERO 3D
$("vehicleStage").addEventListener("mousemove",e=>{
  const r=$("vehicleStage").getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5;
  const y=(e.clientY-r.top)/r.height-.5;
  $("vehicleIso").style.transform=`rotateX(${58-y*7}deg) rotateZ(${-28+x*8}deg) translateZ(18px)`;
});
$("vehicleStage").addEventListener("mouseleave",()=>{
  $("vehicleIso").style.transform="rotateX(58deg) rotateZ(-28deg)";
});
