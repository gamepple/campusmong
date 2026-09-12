import test from 'node:test';
import assert from 'node:assert/strict';
import {holidaysForMonth} from '../lib/korean-holidays.ts';
test('2026 Chuseok Saturday does not invent a substitute holiday',()=>{
 const h=holidaysForMonth('2026-09');assert.equal(h[25].name,'추석');assert.equal(h[26].holiday,true);assert.equal(h[28],undefined);
 assert.equal(holidaysForMonth('2026-10')[5].name,'대체공휴일');
});
test('2027 New Year lunar dates and substitute holidays are year specific',()=>{
 const h=holidaysForMonth('2027-02');assert.equal(h[7].name,'설날');assert.equal(h[9].name,'대체공휴일');assert.equal(h[21].holiday,false);
 assert.equal(holidaysForMonth('2027-07')[19].name,'대체공휴일');
});
test('holidays include 2026 additions and election while festivals remain distinct',()=>{
 assert.equal(holidaysForMonth('2026-05')[1].name,'노동절');assert.equal(holidaysForMonth('2026-07')[17].holiday,true);
 assert.equal(holidaysForMonth('2026-06')[3].name,'지방선거');assert.equal(holidaysForMonth('2026-03')[3].holiday,false);
});
test('unsupported years and invalid months are explicitly unknown',()=>{
 assert.equal(holidaysForMonth('2028-02'),null);assert.equal(holidaysForMonth('2026-13'),null);assert.equal(holidaysForMonth('2026-1'),null);
});
test('all listed dates exist and annual public holiday totals match published dates',()=>{
 for(const [year,expected] of [[2026,22],[2027,24]]){let count=0;
 for(let m=1;m<=12;m++){const h=holidaysForMonth(year+'-'+String(m).padStart(2,'0'));for(const [d,entry] of Object.entries(h)){assert.ok(+d>=1&&+d<=new Date(Date.UTC(year,m,0)).getUTCDate());if(entry.holiday)count++;}}
 assert.equal(count,expected);}
});
