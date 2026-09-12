export type Person={id:string;name:string;type:'D'|'N';off:number[];annual:number};
export type Month={manualDays?:Record<string,boolean>;savedAt?:string;people:Person[];leave:Record<string,number[]>;rows:Record<string,Record<string,string>>;prev:Record<string,string>;next:Record<string,string>;note:string};
export const weekdays=['일','월','화','수','목','금','토'];
export const sites=['정문','후문','예관','소속관','유치원','창업관'];
export const options=['O','L','D0','D1','N0','N1','N2','N3','N4','N5'];
export function label(v:string){return v==='O'?'휴무':v==='L'?'연가':v==='U'?'미확인':v?.[0]==='D'?'주간 '+sites[+v[1]]:v?.[0]==='N'?'야간 '+sites[+v[1]]:'미편성'}
export function daysIn(key:string){const [y,m]=key.split('-').map(Number);return new Date(y,m,0).getDate()}
export function dow(key:string,d:number){const [y,m]=key.split('-').map(Number);return new Date(y,m-1,d).getDay()}
export function seed(key:string):Month {const names=['백','최','전','조','남','김','몽','양','장']; const offs=[[4,5],[1,2],[0,6],[1,2],[0,6],[2,3],[0,6],[3,4],[1,3]];return {people:names.map((name,i)=>({id:String(i),name,type:[2,4].includes(i)?'D':'N',off:offs[i],annual:0})),leave:key==='2026-02'?{'6':[16,17]}:{},rows:{},prev:Object.fromEntries(names.map((_,i)=>[String(i),'U'])),next:Object.fromEntries(names.map((_,i)=>[String(i),'U'])),note:'주간 전담 전·남과 정기휴무는 사진을 참고한 추정값입니다. 실제 조건으로 확인·수정해 주세요. 연간 연가 일수를 입력해 주세요.'}}
export type Issue={day:number;text:string;level:'error'|'info'};
export function inspect(key:string,m:Month):Issue[]{const out:Issue[]=[]; const n=daysIn(key);for(let d=1;d<=n;d++){const row=m.rows[d]||{};const vals=Object.values(row);for(const c of ['D0','D1','N0','N1','N2','N3'])if(!vals.includes(c))out.push({day:d,text:label(c)+' 인원 부족',level:'error'});for(const c of options.filter(v=>v.length===2))if(vals.filter(v=>v===c).length>1)out.push({day:d,text:label(c)+' 중복 배치',level:'error'});for(const p of m.people){const v=row[p.id]; const before=d===1?m.prev[p.id]:m.rows[d-1]?.[p.id];if(!v)out.push({day:d,text:p.name+' 미편성',level:'error'});if(p.type==='D'&&v?.startsWith('N'))out.push({day:d,text:p.name+' 주간 전담자 야간 배치',level:'error'});if(v?.startsWith('D')&&before?.startsWith('N'))out.push({day:d,text:p.name+' 야간 다음 날 주간 배치',level:'error'});if(d===1&&v?.startsWith('D')&&p.type==='N'&&(!before||before==='U'))out.push({day:d,text:p.name+' 전월 말 근무 확인 필요',level:'error'});if(p.off.includes(dow(key,d))&&v&& !['O','L'].includes(v))out.push({day:d,text:p.name+' 정기휴무일 근무',level:'error'});if((m.leave[p.id]||[]).includes(d)&&v!=='L')out.push({day:d,text:p.name+' 연가일 근무 충돌',level:'error'});if(v==='L'&&!(m.leave[p.id]||[]).includes(d))out.push({day:d,text:p.name+' 연가 신청과 불일치',level:'error'});if(d===n&&v?.startsWith('N')&&m.next[p.id]?.startsWith('D'))out.push({day:d,text:p.name+' 다음 달 1일 주간 전 휴식 필요',level:'error'});}
const rests=vals.filter(v=>['O','L'].includes(v)).length;if(rests<2)out.push({day:d,text:'휴무·연가 합계 '+rests+'명 (권장 2명)',level:'info'});const missingOptional=[['N4','유치원'],['N5','창업관']].filter(([code])=>!vals.includes(code)).map(([,name])=>name);if(missingOptional.length)out.push({day:d,text:'야간 선택 근무지 '+missingOptional.join('·')+' 공석',level:'info'});}
if(m.people.some(p=>p.type==='N'&&m.prev[p.id]==='U'))out.push({day:1,text:'전월 말 근무가 미확인입니다. 월 경계의 휴식 여부를 입력해 주세요.',level:'info'});if(m.people.some(p=>m.next[p.id]==='U'))out.push({day:n,text:'다음 달 1일 근무 미확인 · 월말 야간 이후 주간 전환을 확인해 주세요.',level:'info'});return out}
export function stats(key:string,m:Month,id:string){const vals=Array.from({length:daysIn(key)},(_,i)=>m.rows[i+1]?.[id]);return {day:vals.filter(x=>x?.startsWith('D')).length,night:vals.filter(x=>x?.startsWith('N')).length,off:vals.filter(x=>x==='O').length,leave:vals.filter(x=>x==='L').length};}
// 여러 대체 주간 조합을 탐색한다. 정기휴무·연가·전환 휴식을 어기며 빈자리를 채우지 않는다.
export function generate(key:string,m:Month,attempts=180):Month {const n=daysIn(key);let best:Month={...m,manualDays:{},rows:{}};let bestScore=Infinity;let randSeed=73;const rand=()=>{randSeed=(Math.imul(randSeed,1664525)+1013904223)>>>0;return randSeed/4294967296};const available=(p:Person,d:number)=>!p.off.includes(dow(key,d))&&!(m.leave[p.id]||[]).includes(d);
for(let run=0;run<attempts;run++){const day:Record<number,string[]>={};const cnt:Record<string,number>=Object.fromEntries(m.people.map(p=>[p.id,0]));for(let d=1;d<=n;d++){const ready=m.people.filter(p=>available(p,d)&&!(d===1&&p.type==='N'&&!['O','L','D0','D1','D'].includes(m.prev[p.id])));const priorities=Object.fromEntries(ready.map(p=>[p.id,(p.type==='D'?0:30)+cnt[p.id]*.3+rand()*5-((day[d-1]||[]).includes(p.id)?12:0)+(d<n&&m.people.filter(q=>q.type==='D'&&available(q,d+1)).length<2&&!available(p,d+1)?10:0)]));ready.sort((a,b)=>priorities[a.id]-priorities[b.id]);day[d]=ready.slice(0,2).map(p=>p.id);for(const id of day[d])cnt[id]++;}
const rows:Month['rows']={};const nightCounts:Record<string,number>=Object.fromEntries(m.people.map(p=>[p.id,0]));for(let d=1;d<=n;d++){const row:Record<string,string>={};for(const p of m.people)row[p.id]=(m.leave[p.id]||[]).includes(d)?'L':'O';day[d].forEach((id,i)=>row[id]='D'+i);const ready=m.people.filter(p=>p.type==='N'&&available(p,d)&&!day[d].includes(p.id)&&!(day[d+1]||[]).includes(p.id)&&!(d===n&&m.next[p.id]?.startsWith('D')));ready.sort((a,b)=>nightCounts[a.id]-nightCounts[b.id]||a.id.localeCompare(b.id));const slots=[0,1,2,3,d%2?5:4];ready.slice(0,5).forEach((p,i)=>{row[p.id]='N'+slots[(i+d)%Math.min(ready.length,5)];nightCounts[p.id]++});rows[d]=row;}
const candidate={...m,manualDays:{},rows};const issues=inspect(key,candidate);const totals=m.people.filter(p=>p.type==='N').map(p=>{const s=stats(key,candidate,p.id);return s.day+s.night});const score=issues.filter(x=>x.level==='error').length*10000+Math.max(...totals)-Math.min(...totals);if(score<bestScore){bestScore=score;best=candidate;}}
return best}

// Track explicit row edits only, leaving settings changes and automatic generation unmarked.
export function markManualRows(before:Month,after:Month):Month{
 const manualDays={...after.manualDays};
 for(const day of new Set([...Object.keys(before.rows),...Object.keys(after.rows)])){
  const a=before.rows[day]||{},b=after.rows[day]||{};
  if([...new Set([...Object.keys(a),...Object.keys(b)])].some(id=>a[id]!==b[id]))manualDays[day]=true;
 }
 return {...after,manualDays};
}
export function leaveWithReplacement(key:string,m:Month,id:string,d:number,replacementId='',usedAnnual=0):Month{
 if(!Number.isInteger(d)||d<1||d>daysIn(key))throw Error('연가 날짜를 확인해 주세요.');
 const person=m.people.find(p=>p.id===id);if(!person)throw Error('근무자를 찾을 수 없습니다.');
 if(!m.rows[d])throw Error('먼저 근무표를 만들어 주세요.');
 if((m.leave[id]||[]).includes(d))throw Error('이미 연가로 등록된 날입니다.');
 if(person.off.includes(dow(key,d)))throw Error('정기휴무일에는 연가를 등록할 수 없습니다.');
 if(person.annual>0&&usedAnnual+(m.leave[id]||[]).length>=person.annual)throw Error('연간 연가 일수를 모두 사용했습니다.');
 const next=structuredClone(m),post=m.rows[d][id];
 if(replacementId){
  const replacement=m.people.find(p=>p.id===replacementId);
  if(!replacement||replacementId===id)throw Error('다른 대체 근무자를 선택해 주세요.');
  if(!post||!['D','N'].includes(post[0]))throw Error('대체할 근무지가 없습니다. 대체자 없이 등록해 주세요.');
  if(!['O','N4','N5'].includes(m.rows[d][replacementId]))throw Error('휴무 중이거나 선택 근무지에 배치된 분을 선택해 주세요.');
  if(replacement.off.includes(dow(key,d))||(m.leave[replacementId]||[]).includes(d))throw Error('대체자의 정기휴무·연가를 확인해 주세요.');
  if(replacement.type==='D'&&post.startsWith('N'))throw Error('주간 전담자는 야간 근무를 대신할 수 없습니다.');
  const prev=d===1?m.prev[replacementId]:m.rows[d-1]?.[replacementId];
  if(post.startsWith('D')&&(!prev||prev==='U'||prev.startsWith('N')))throw Error('대체자의 전날 근무와 휴식을 확인해 주세요.');
  next.rows[d][replacementId]=post;
 }
 next.leave[id]=[...(m.leave[id]||[]),d].sort((a,b)=>a-b);next.rows[d][id]='L';
 const oldErrors=new Set(inspect(key,m).filter(i=>i.level==='error').map(i=>i.day+':'+i.text));
 const problems=inspect(key,next).filter(i=>i.level==='error'&&(i.day===d||(i.day===d+1&&!oldErrors.has(i.day+':'+i.text))));
 if(problems.length)throw Error(problems.map(i=>i.text).join(' · '));
 return markManualRows(m,next);
}

// Validate both sides before applying a placement or swap; the original stays intact on failure.
export function placeAtPost(key:string,m:Month,d:number,post:string,id:string):Month{
 if(!Number.isInteger(d)||d<1||d>daysIn(key)||!options.includes(post)||post.length!==2)throw Error('날짜와 근무지를 확인해 주세요.');
 const row=m.rows[d];if(!row)throw Error('먼저 근무표를 만들어 주세요.');
 const selected=m.people.find(p=>p.id===id);if(!selected)throw Error('근무자를 찾을 수 없습니다.');
 const occupants=m.people.filter(p=>row[p.id]===post);
 if(occupants.length>1)throw Error('이 근무지의 중복 배치를 먼저 정리해 주세요.');
 if(row[id]===post)return m;
 const old=row[id]||'O',current=occupants[0];
 const next=structuredClone(m);
 next.rows[d][id]=post;
 if(current)next.rows[d][current.id]=old;
 for(const p of [selected,...(current?[current]:[])]){
  const value=next.rows[d][p.id];
  if(row[p.id]==='L'||(m.leave[p.id]||[]).includes(d))throw Error(p.name+' 님은 연가 중입니다.');
  if(value==='O')continue;
  if(!options.includes(value)||value.length!==2)throw Error('기존 근무를 먼저 확인해 주세요.');
  if(p.off.includes(dow(key,d)))throw Error(p.name+' 님의 정기휴무일입니다.');
  if(p.type==='D'&&value.startsWith('N'))throw Error(p.name+' 님은 주간 전담입니다.');
  const before=d===1?m.prev[p.id]:m.rows[d-1]?.[p.id];
  const after=d===daysIn(key)?m.next[p.id]:m.rows[d+1]?.[p.id];
  if(value.startsWith('D')&&(before?.startsWith('N')||(p.type==='N'&&(!before||before==='U'))))throw Error(p.name+' 님의 전날 근무와 휴식을 확인해 주세요.');
  if(value.startsWith('N')&&after?.startsWith('D'))throw Error(p.name+' 님은 다음 날 주간 근무가 있습니다.');
 }
 if(!current&&['D0','D1','N0','N1','N2','N3'].includes(old))throw Error('이동하면 기존 필수 근무지가 비게 됩니다. 교환할 근무자를 먼저 배치해 주세요.');
 return markManualRows(m,next);
}
