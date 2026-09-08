import {Month, daysIn, dow, sites, weekdays} from './schedule';

// One fixed landscape sheet is used for both print and PNG export.
export function scheduleSvg(key:string, month:Month):string {
  const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  const text=(x:number,y:number,s:string,size=17,color='#26364c',max=200,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}"${Array.from(s).length*size>max?` textLength="${max}" lengthAdjust="spacingAndGlyphs"`:''}>${esc(s)}</text>`;
  const n=daysIn(key),first=dow(key,1),weeks=Math.ceil((first+n)/7),cw=224,ch=935/weeks;
  const compact=weeks===6,spacious=weeks<=4;
  const dateY=compact?22:spacious?31:27,dateSize=compact?21:spacious?28:24;
  const dayTop=compact?26:spacious?38:32,dayHeight=compact?33:spacious?44:38,dayBase=compact?50:spacious?69:59;
  const nightTop=compact?63:spacious?87:74,nightHeight=compact?44:spacious?64:54;
  const nightLabelY=compact?78:spacious?106:91,nightNameY=compact?99:spacious?138:119;
  const restY=compact?122:spacious?177:146,leaveY=compact?143:spacious?205:169;
  const dayNameSize=compact?17:spacious?22:20,nightNameSize=compact?17:spacious?22:20,restSize=compact?13:spacious?17:15;
  let out='<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="1120" viewBox="0 0 1640 1120"><rect width="1640" height="1120" fill="white"/><g font-family="Arial, Apple SD Gothic Neo, Malgun Gothic, sans-serif">';
  out+=text(36,48,`${key.slice(0,4)}년 ${Number(key.slice(5))}월 근무편성표`,30,'#223653',1000,700);
  out+=text(36,79,'주간: 정문·후문 / 야간: 정문·후문·예관·소속관 필수, 유치원·창업관 선택',16,'#526782',1500);
  weekdays.forEach((w,i)=>{out+=`<rect x="${36+i*cw}" y="98" width="${cw}" height="32" fill="#f0f4fa"/>`+text(125+i*cw,120,w+'요일',17,i===0?'#bc5252':i===6?'#386bab':'#526782',110);});
  for(let i=0;i<weeks*7;i++){
    const d=i-first+1,x=36+(i%7)*cw,y=130+Math.floor(i/7)*ch;
    out+=`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${d<1||d>n?'#f8fafc':'white'}" stroke="#c8d3e3"/>`;
    if(d<1||d>n)continue;
    const row=month.rows[d]||{};
    const name=(code:string)=>month.people.filter(p=>row[p.id]===code).map(p=>p.name).join('·')||'—';
    const offNames=month.people.filter(p=>row[p.id]==='O').map(p=>p.name).join('·')||'—';
    const leaveNames=month.people.filter(p=>row[p.id]==='L').map(p=>p.name).join('·')||'—';
    out+=text(x+8,y+dateY,String(d),dateSize,(i%7===0?'#bc5252':i%7===6?'#386bab':'#26364c'),58,700);
    out+=`<rect x="${x+5}" y="${y+dayTop}" width="214" height="${dayHeight}" fill="#fff5df"/>`;
    out+=text(x+9,y+dayBase,'주간',compact?11:13,'#94702f',34,400);
    [0,1].forEach(s=>{const bx=x+54+s*82;out+=text(bx,y+dayBase,sites[s][0],compact?11:12,'#a6916c',16,400);out+=text(bx+17,y+dayBase,name('D'+s),dayNameSize,'#665332',60,700);});
    out+=`<rect x="${x+5}" y="${y+nightTop}" width="214" height="${nightHeight}" fill="#edf2fc"/>`;
    for(let s=0;s<6;s++){
      out+=text(x+9+s*35,y+nightLabelY,sites[s][0],compact?10:12,'#65799b',30,400);
      out+=text(x+9+s*35,y+nightNameY,name('N'+s),nightNameSize,'#334f80',31,700);
    }
    out+=text(x+8,y+restY,'휴무 :',restSize,'#738196',48,500);
    out+=text(x+(compact?51:spacious?65:58),y+restY,offNames,restSize,'#53647b',compact?164:spacious?150:157,700);
    out+=text(x+8,y+leaveY,'연가 :',restSize,'#bd746c',48,500);
    out+=text(x+(compact?51:spacious?65:58),y+leaveY,leaveNames,restSize,'#b65750',compact?164:spacious?150:157,700);
  }
  out+=text(36,1102,'Made with love for my father. · © 2026 전성식. All rights reserved.',14,'#60748f',1500);
  return out+'</g></svg>';
}
export const svgDataUrl=(svg:string)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
export async function pngDataUrl(svg:string):Promise<string>{
  await document.fonts.ready;
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('이미지 생성에 실패했습니다. 다시 시도해 주세요.'));image.src=svgDataUrl(svg);});
  const canvas=document.createElement('canvas');canvas.width=3280;canvas.height=2240;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저는 이미지 저장을 지원하지 않습니다.');
  ctx.drawImage(image,0,0,3280,2240);return canvas.toDataURL('image/png');
}
