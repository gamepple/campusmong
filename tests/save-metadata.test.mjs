import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
import * as schedule from '../lib/schedule.ts';
function load(path,deps,globals={}){const module={exports:{}};const js=ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:id=>{if(!(id in deps))throw Error(id);return deps[id]},Request,Response,URL,Date,console:{error:()=>{}},...globals});return module.exports}
test('server save stamps a trusted time, preserves manual metadata and returns it on reload',async()=>{
 let stored=null,revision=0,changes=1;
 const db={prepare:sql=>({bind:(...args)=>({run:async()=>{if(changes){stored=JSON.parse(args[1]);revision=1}return {meta:{changes}}},first:async()=>stored?{data:JSON.stringify(stored),revision}:null,all:async()=>({results:[]})})})};
 const api=load('../app/api/schedule/route.ts',{'@/lib/schedule':schedule,'@/lib/editor-auth':{isEditor:async()=>true},'@/db/store':{database:()=>db},zod:{z}});
 const m={...schedule.seed('2026-09'),manualDays:{9:true},savedAt:'1900-01-01T00:00:00Z'};
 const req=()=>new Request('https://test/api/schedule',{method:'PUT',body:JSON.stringify({month:'2026-09',revision:0,data:m})});
 const r=await api.PUT(req());assert.equal(r.status,200);const result=await r.json();assert.ok(Date.parse(result.savedAt)>Date.parse('2026-01-01'));assert.equal(stored.savedAt,result.savedAt);assert.equal(stored.manualDays[9],true);
 const loaded=await (await api.GET(new Request('https://test/api/schedule?month=2026-09'))).json();assert.equal(loaded.data.savedAt,result.savedAt);assert.equal(loaded.data.manualDays[9],true);
 changes=0;assert.equal((await api.PUT(req())).status,409);assert.equal(stored.savedAt,result.savedAt);
});
test('local-only storage also persists time and manual markers; failed writes report failure',async()=>{
 const data=new Map([['campusmong-local-v1:editor',String(Date.now()+100000)]]);let fail=false;
 const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('quota');data.set(k,v)}};
 const {localRequest}=load('../github-web/storage.ts',{'../lib/schedule':schedule},{localStorage,location:{origin:'https://test'}});
 const put=revision=>localRequest('/api/schedule',{method:'PUT',body:JSON.stringify({month:'2026-09',revision,data:{...schedule.seed('2026-09'),manualDays:{9:true}}})});
 const result=await (await put(0)).json();const stored=JSON.parse(data.get('campusmong-local-v1:2026-09'));assert.equal(stored.data.savedAt,result.savedAt);assert.equal(stored.data.manualDays[9],true);
 fail=true;assert.equal((await put(1)).status,500);assert.equal(JSON.parse(data.get('campusmong-local-v1:2026-09')).revision,1);
});
