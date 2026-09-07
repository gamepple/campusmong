import {Month, daysIn, dow, sites, weekdays} from './schedule';

// One fixed landscape sheet is used for both print and PNG export.
export function scheduleSvg(key:string, month:Month):string {
  const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  const text=(x:number,y:number,s:string,size=17,color='#26364c',max=200,bold=false)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}"${bold?' font-weight="700"':''}${Array.from(s).length*size>max?` textLength="${max}" lengthAdjust="spacingAndGlyphs"`:''}>${esc(s)}</text>`;
  const n=daysIn(key),first=dow(key,1),weeks=Math.ceil((first+n)/7),cw=224,ch=870/weeks;
  let out='<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="1120" viewBox="0 0 1640 1120"><rect width="1640" height="1120" fill="white"/><g font-family="Arial, Apple SD Gothic Neo, Malgun Gothic, sans-serif">';
  out+=text(36,48,`${key.slice(0,4)}년 ${Number(key.slice(5))}월 근무편성표`,30,'#223653',1000,true);
  out+=text(36,79,'주간: 정문·후문 / 야간: 정문·후문·예관·소속관 필수, 유치원·창업관 선택',16,'#526782',1500);
  weekdays.forEach((w,i)=>{out+=`<rect x="${36+i*cw}" y="98" width="${cw}" height="32" fill="#f0f4fa"/>`+text(125+i*cw,120,w+'요일',17,i===0?'#bc5252':i===6?'#386bab':'#526782',110);});
  for(let i=0;i<weeks*7;i++){
    const d=i-first+1,x=36+(i%7)*cw,y=130+Math.floor(i/7)*ch;
    out+=`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${d<1||d>n?'#f8fafc':'white'}" stroke="#c8d3e3"/>`;
    if(d<1||d>n)continue;
    const row=month.rows[d]||{};
    const name=(code:string)=>month.people.filter(p=>row[p.id]===code).map(p=>p.name).join('·')||'—';
    out+=text(x+8,y+21,String(d),19,(i%7===0?'#bc5252':i%7===6?'#386bab':'#26364c'),50,true);
    out+=`<rect x="${x+5}" y="${y+27}" width="214" height="28" fill="#fff5df"/>`;
    out+=text(x+9,y+46,'주',12,'#94702f',20);
    [0,1].forEach(s=>{out+=text(x+29+s*94,y+46,sites[s][0]+' '+name('D'+s),16,'#665332',88,true);});
    out+=`<rect x="${x+5}" y="${y+59}" width="214" height="49" fill="#edf2fc"/>`;
    for(let s=0;s<6;s++){
      out+=text(x+9+s*35,y+75,sites[s][0],11,'#65799b',30);
      out+=text(x+9+s*35,y+97,name('N'+s),17,'#334f80',31,true);
    }
    out+=text(x+8,y+124,'휴무 '+month.people.filter(p=>row[p.id]==='O').map(p=>p.name).join('·'),12,'#5f6f82',207);
    out+=text(x+8,y+140,'연가 '+month.people.filter(p=>row[p.id]==='L').map(p=>p.name).join('·'),12,'#ad5c55',207);
  }
  out+=text(36,1030,'검토용 근무표 · 필수 인원과 월 경계 휴식 조건을 확인해 주세요.',15,'#60748f',1500);
  out+=text(36,1078,'Made with love for my father. · © 2026 전성식. All rights reserved.',15,'#60748f',1500);
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
