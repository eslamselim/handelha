/* Intro only. Gameplay, lobby, music and all eight stations remain unchanged. */
let bootDone=false,chatIntroStarted=false,introTimers=[],introAudio=null;
function introLater(fn,ms){const id=setTimeout(()=>{if(!bootDone)fn()},ms);introTimers.push(id);return id}
function introSound(name){
  try{
    if(!introAudio){introAudio=new(window.AudioContext||window.webkitAudioContext)();introAudio.resume().catch(()=>{})}
    const ctx=introAudio,t=ctx.currentTime;
    const play=(f,at,duration,volume,type='sine',end)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,at);if(end)o.frequency.exponentialRampToValueAtTime(end,at+duration);v.gain.setValueAtTime(.0001,at);v.gain.exponentialRampToValueAtTime(volume,at+.008);v.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(v);v.connect(ctx.destination);o.start(at);o.stop(at+duration+.02)};
    if(name==='message'){play(880,t,.13,.055,'triangle');play(1175,t+.105,.22,.045,'sine')}
    else if(name==='send')play(450,t,.18,.055,'sine',1000);
    else if(name==='zoom'){play(160,t,.32,.05,'sine',700);play(320,t+.08,.25,.025,'triangle',1000)}
    else if(name==='land'){play(110,t,.28,.10,'sine',45);[523,659,784,1047].forEach((f,i)=>play(f,t+i*.07,.38,.035,'triangle'))}
  }catch{}
}
function introPhase(phase){$('boot').dataset.phase=phase;$('introPhone').setAttribute('aria-hidden',String(phase==='map'||phase==='title'));$('introPhone').querySelector('.invite-view').setAttribute('aria-hidden',String(phase!=='invite'))}
function addIntroMessage(sender,text,self=false,last=false){
  const bubble=document.createElement('div');bubble.className='intro-message'+(self?' self':'')+(last?' challenge':'');
  const author=document.createElement('b');author.className='intro-sender';author.textContent=sender;
  const content=document.createElement('p');content.textContent=text;
  bubble.append(author,content);$('introMessages').append(bubble);
  const area=$('introMessages').parentElement;area.scrollTop=area.scrollHeight;
  introSound(self?'send':'message');
  $('groupStatus').textContent=last?'الكل مستني ردّك…':self?'مروان بيكتب…':'سلمى بتكتب…';
  if(last)$('typing').hidden=true;
}
function startChatIntro(){
  if(chatIntroStarted||bootDone)return;
  chatIntroStarted=true;AudioEngine.unlock();introSound('message');
  introPhase('chat');$('conversation').hidden=false;$('openChat').disabled=true;
  $('skipBoot').focus({preventScroll:true});
  const messages=[
    [450,'مروان','نازلين النهارده؟ 👀',false,false],
    [1850,'سلمى','فيه يوم ألعاب وأنشطة… والتذكرة بـ٢٠٠ جنيه 🎟️',false,false],
    [3500,'إنت','أنا معايا ٦٠٠ جنيه بس 😂',true,false],
    [5350,'مروان','طب والمواصلات والأكل؟ وهتسيب حاجة للطوارئ؟',false,false],
    [7650,'سلمى','طب هتعرف تهندلها؟ 😏',false,true]
  ];
  messages.forEach(([at,sender,text,self,last])=>introLater(()=>addIntroMessage(sender,text,self,last),at));
  introLater(()=>{$('introPhone').classList.add('challenge-zoom');introSound('zoom')},8700);
  introLater(()=>{introPhase('map');$('introMap').setAttribute('aria-hidden','false');introSound('zoom')},9700);
  introLater(()=>introSound('land'),10600);
  introLater(()=>{introPhase('title');$('introMap').setAttribute('aria-hidden','true');$('chatTitle').setAttribute('aria-hidden','false');introSound('land')},12100);
  introLater(finishBoot,14300);
}
function finishBoot(){
  if(bootDone)return;bootDone=true;
  introTimers.forEach(clearTimeout);introTimers=[];
  if(introAudio){introAudio.close().catch(()=>{});introAudio=null}
  $('game').inert=false;$('game').removeAttribute('aria-hidden');
  document.body.classList.remove('booting');lobby();$('boot').classList.add('leaving');
  setTimeout(()=>{$('boot').hidden=true;},reduced?0:450);
}
window.addEventListener('keydown',e=>{if(mode==='boot'&&e.key==='Escape'){e.preventDefault();finishBoot()}},true);
mode='boot';$('openChat').focus({preventScroll:true});
