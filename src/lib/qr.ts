import qrcode from 'qrcode-generator'
if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']

export const TYPES={url:'URL',text:'Text',email:'Email',phone:'Phone',wifi:'Wi-Fi'};
export const FIELDS={
 url:[['url','Website address','url','https://example.com']],
 text:[['text','Text','textarea','Anything you want to encode']],
 email:[['to','Email address','email','name@example.com'],['subject','Subject (optional)','text',''],['body','Message (optional)','textarea','']],
 phone:[['phone','Phone number','tel','+91 98765 43210']],
 wifi:[['ssid','Network name (SSID)','text',''],['sec','Security','select',['WPA','WEP','nopass']],['pass','Password','text',''],['hidden','Hidden network','check']]
};
export const SEC={WPA:'WPA / WPA2 / WPA3',WEP:'WEP',nopass:'None (open network)'};
export const S0={size:512,fg:'#14213d',fg2:'#2447f5',grad:false,angle:45,bg:'#ffffff',ecc:'M',margin:4,pattern:'square',eye:'square',logo:'',logoPct:20};
export const PRESETS={
 Classic:{fg:'#000000',bg:'#ffffff',grad:false,pattern:'square',eye:'square'},
 Ink:{fg:'#14213d',bg:'#f3f5f2',grad:false,pattern:'rounded',eye:'rounded'},
 Ocean:{fg:'#0b3d91',fg2:'#00a3a3',bg:'#ffffff',grad:true,angle:45,pattern:'dots',eye:'circle'},
 Sunset:{fg:'#b0125a',fg2:'#e65100',bg:'#fff8f0',grad:true,angle:135,pattern:'rounded',eye:'rounded'},
 Forest:{fg:'#1b5e20',bg:'#f1f8e9',grad:false,pattern:'diamond',eye:'square'},
 Neon:{fg:'#39ff14',bg:'#0a0a0a',grad:false,pattern:'dots',eye:'circle'}
};
export type Settings = typeof S0

/* ---------- validation ---------- */
export function payload(ty:string,v:any){
 const e:any={};let d='';const t=k=>(v[k]||'').trim();
 if(ty==='url'){let u=t('url');
  if(!u)e.url='Enter a web address.';
  else{if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(u))u='https://'+u;
   try{const x=new URL(u);if(!/^https?:$/.test(x.protocol)||!x.hostname.includes('.'))throw 0;d=u}catch(_){e.url='Enter a valid address, like https://example.com.'}}}
 else if(ty==='text'){if(!t('text'))e.text='Enter some text to encode.';else d=v.text}
 else if(ty==='email'){
  if(!t('to'))e.to='Enter an email address.';
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t('to')))e.to='Enter a valid email address, like name@example.com.';
  else{const p=[];if(t('subject'))p.push('subject='+encodeURIComponent(t('subject')));if(t('body'))p.push('body='+encodeURIComponent(v.body.trim()));d='mailto:'+t('to')+(p.length?'?'+p.join('&'):'')}}
 else if(ty==='phone'){const p=t('phone'),dg=p.replace(/\D/g,'');
  if(!p)e.phone='Enter a phone number.';
  else if(!/^\+?[\d\s().-]+$/.test(p)||dg.length<6||dg.length>15)e.phone='Use 6 to 15 digits. Digits, spaces, dashes and a leading + are allowed.';
  else d='tel:'+(p.startsWith('+')?'+':'')+dg}
 else if(ty==='wifi'){const sec=v.sec||'WPA',ss=t('ssid'),pw=v.pass||'',q=x=>x.replace(/([\\;,:"])/g,'\\$1');
  if(!ss)e.ssid='Enter the network name.';else if(ss.length>32)e.ssid='Network names are 32 characters or fewer.';
  if(sec!=='nopass'){if(!pw)e.pass='Enter the password, or set security to None.';else if(sec==='WPA'&&(pw.length<8||pw.length>63))e.pass='WPA passwords are 8 to 63 characters.'}
  if(!Object.keys(e).length)d=`WIFI:T:${sec};S:${q(ss)};${sec==='nopass'?'':'P:'+q(pw)+';'}${v.hidden?'H:true;':''};`}
 return{d,e}}

/* ---------- renderer: one SVG used for preview, PNG and SVG ---------- */
export function build(data:string,st:Settings,px:number|string,id:string){
 const q=qrcode(0,st.ecc as any);q.addData(data);q.make();
 const n=q.getModuleCount(),m=st.margin,T=n+2*m,f=st.grad?`url(#${id})`:st.fg;
 const a=st.angle*Math.PI/180,h=T/2,c=Math.cos(a)*h,sn=Math.sin(a)*h;
 const crisp=st.pattern==='square'&&st.eye==='square';
 let o=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" width="${px}" height="${px}"${crisp?' shape-rendering="crispEdges"':''}>`;
 if(st.grad)o+=`<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${h-c}" y1="${h-sn}" x2="${h+c}" y2="${h+sn}"><stop offset="0" stop-color="${st.fg}"/><stop offset="1" stop-color="${st.fg2}"/></linearGradient></defs>`;
 o+=`<rect width="${T}" height="${T}" fill="${st.bg}"/>`;
 const L=st.logo?n*st.logoPct/100:0,b0=h-L/2-.5,b1=h+L/2+.5;
 const eyes=[[m,m],[m+n-7,m],[m,m+n-7]];
 let p='';
 for(let r=0;r<n;r++)for(let k=0;k<n;k++){
  if(!q.isDark(r,k)||(r<7&&(k<7||k>=n-7))||(r>=n-7&&k<7))continue;
  const x=k+m,y=r+m;
  if(L&&x+1>b0&&x<b1&&y+1>b0&&y<b1)continue;
  if(st.pattern==='dots')p+=`M${x+.08} ${y+.5}a.42 .42 0 1 0 .84 0a.42 .42 0 1 0 -.84 0z`;
  else if(st.pattern==='diamond')p+=`M${x+.5} ${y}l.5 .5l-.5 .5l-.5 -.5z`;
  else if(st.pattern==='rounded')p+=`M${x+.34} ${y+.04}h.32a.3 .3 0 0 1 .3 .3v.32a.3 .3 0 0 1 -.3 .3h-.32a.3 .3 0 0 1 -.3 -.3v-.32a.3 .3 0 0 1 .3 -.3z`;
  else p+=`M${x} ${y}h1v1h-1z`}
 o+=`<path d="${p}" fill="${f}"/>`;
 const R={square:[0,0],rounded:[1.6,.8],circle:[3,1.5]}[st.eye];
 eyes.forEach(([x,y])=>{o+=`<rect x="${x+.5}" y="${y+.5}" width="6" height="6" rx="${R[0]}" fill="none" stroke="${f}" stroke-width="1"/><rect x="${x+2}" y="${y+2}" width="3" height="3" rx="${R[1]}" fill="${f}"/>`});
 if(L)o+=`<rect x="${b0}" y="${b0}" width="${L+1}" height="${L+1}" rx=".8" fill="${st.bg}"/><image href="${st.logo}" x="${h-L/2}" y="${h-L/2}" width="${L}" height="${L}" preserveAspectRatio="xMidYMid meet"/>`;
 return{svg:o+'</svg>',n}}
export function toPNG(svg,px){return new Promise<Blob>((res,rej)=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=px;c.getContext('2d').drawImage(i,0,0,px,px);c.toBlob(b=>res(b as Blob),'image/png')};i.onerror=rej;i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}

/* ---------- scan reliability ---------- */
export const lum=h=>{const[r,g,b]=[1,3,5].map(i=>{const c=parseInt(h.substr(i,2),16)/255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
export const cr=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
export function check(n,st){
 const w=[],fgs=st.grad?[st.fg,st.fg2]:[st.fg],r=Math.min(...fgs.map(c=>cr(c,st.bg)));
 if(r<2)w.push(['bad',`Contrast is only ${r.toFixed(1)}:1. Most scanners will fail. Aim for 4:1 or more.`]);
 else if(r<4)w.push(['warn',`Contrast is ${r.toFixed(1)}:1. Darken the foreground or lighten the background (aim for 4:1 or more).`]);
 if(fgs.some(c=>lum(c)>lum(st.bg)))w.push(['warn','Light code on a dark background is unreadable to some scanner apps. Dark on light is safest.']);
 if(st.margin<1)w.push(['bad','There is no quiet zone. Add at least 2 modules of margin; 4 is the standard.']);
 else if(st.margin<4)w.push(['warn',`A ${st.margin}-module margin is tight. The standard quiet zone is 4.`]);
 const px=st.size/(n+2*st.margin);
 if(px<4)w.push(['warn',`Each module is ${px.toFixed(1)}px wide. Increase the size so it stays sharp when printed small.`]);
 if(st.pattern!=='square'&&st.ecc==='L')w.push(['warn','Rounded, dotted and diamond modules read best with error correction M or higher.']);
 if(st.logo){const cov=Math.pow((n*st.logoPct/100+1)/n,2),cap={L:.07,M:.15,Q:.25,H:.3}[st.ecc];
  if(cov>cap)w.push(['bad',`The logo hides about ${Math.round(cov*100)}% of the code, but level ${st.ecc} recovers only ${Math.round(cap*100)}%. Shrink the logo or raise error correction.`]);
  else if(cov>cap*.7)w.push(['warn',`The logo hides about ${Math.round(cov*100)}% of the code, close to the ${Math.round(cap*100)}% limit for level ${st.ecc}.`])}
 if(n>=57)w.push(['warn','This is a dense code. Keep it large, or shorten the content.']);
 return w}
