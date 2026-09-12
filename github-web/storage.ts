import {Month,seed,daysIn} from '../lib/schedule';
type Saved={data:Month;revision:number};
const prefix='campusmong-local-v1:';
const get=(key:string):Saved|null=>JSON.parse(localStorage.getItem(prefix+key)||'null');
export async function localRequest(path:string,init?:RequestInit):Promise<Response>{
 try{
 const u=new URL(path,location.origin),method=init?.method||'GET';
 const editable=Number(localStorage.getItem(prefix+'editor')||0)>Date.now();
 const reply=(data:unknown,status=200)=>Response.json(data,{status});
 if(u.pathname==='/api/editor-session'){
  if(method==='POST'){const {id}=JSON.parse(String(init?.body));if(!id.trim())return reply({error:'ID를 입력해 주세요.'},401);localStorage.setItem(prefix+'editor',String(Date.now()+30*86400000));return reply({canEdit:true});}
  if(method==='DELETE'){localStorage.removeItem(prefix+'editor');return reply({canEdit:false});}return reply({canEdit:editable});
 }
 if(u.pathname!=='/api/schedule')return reply({error:'알 수 없는 요청입니다.'},404);
 if(method==='PUT'){
  if(!editable)return reply({error:'먼저 로그인해 주세요.'},401);
  const {month,data,revision}=JSON.parse(String(init?.body));
  if(data.people.filter((p:{type:string})=>p.type==='D').length!==2)return reply({error:'주간 전담자를 2명으로 설정해 주세요.'},400);
  if((get(month)?.revision||0)!==revision)return reply({error:'다른 창에서 변경되었습니다. 백업 후 새로 불러와 주세요.'},409);
  const savedAt=new Date().toISOString();localStorage.setItem(prefix+month,JSON.stringify({data:{...data,savedAt},revision:revision+1}));return reply({revision:revision+1,savedAt});
 }
 const month=u.searchParams.get('month')!;const saved=get(month);const defaults=seed(month),annual:Record<string,number>={};
 const keys=Object.keys(localStorage).filter(k=>k.startsWith(prefix)&&/^20\d{2}-\d{2}$/.test(k.slice(prefix.length))).map(k=>k.slice(prefix.length)).sort();
 for(const k of keys.filter(k=>k!==month&&k.slice(0,4)===month.slice(0,4))){for(const [id,leave] of Object.entries(get(k)!.data.leave))annual[id]=(annual[id]||0)+leave.length;}
 const prior=keys.filter(k=>k<month).pop();if(prior)defaults.people=get(prior)!.data.people;
 const [y,m]=month.split('-').map(Number);const adj=(delta:number)=>{const d=new Date(y,m-1+delta,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
 const prev=get(adj(-1)),next=get(adj(1));if(prev)defaults.prev=prev.data.rows[daysIn(adj(-1))]||{};if(next)defaults.next=next.data.rows[1]||{};
 return reply({data:saved?.data||null,defaults,revision:saved?.revision||0,annual});
 }catch{return Response.json({error:'이 기기에 저장하거나 불러오지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.'},{status:500});}
}
