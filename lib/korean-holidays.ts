/** Calendar annotations only: never used to change shifts or regular days off.
 * Sources: KASA 2026/2027 calendar notices, including the 2026 additions.
 * https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431
 * https://www.kasa.go.kr (2026년 월력요항, 2025-06-30)
 * https://www.mois.go.kr (2026-06-03 지방선거)
 * Reviewed 2026-09-12. Future temporary holidays require a data update.
 * Use explicit year tables instead of guessing lunar or substitute holidays.
 */
export type CalendarHoliday={name:string;holiday:boolean};
const fixed:Record<string,string>={
 '01-01':'신정','03-01':'삼일절','05-01':'노동절','05-05':'어린이날',
 '06-06':'현충일','07-17':'제헌절','08-15':'광복절','10-03':'개천절',
 '10-09':'한글날','12-25':'성탄절',
};
const annual:Record<string,Record<string,string>>={
 '2026':{'02-16':'설 연휴','02-17':'설날','02-18':'설 연휴','03-02':'대체공휴일',
  '05-24':'부처님오신날','05-25':'대체공휴일','06-03':'지방선거',
  '08-17':'대체공휴일','09-24':'추석 연휴','09-25':'추석','09-26':'추석 연휴','10-05':'대체공휴일'},
 '2027':{'02-06':'설 연휴','02-07':'설날','02-08':'설 연휴','02-09':'대체공휴일',
  '05-03':'대체공휴일','05-13':'부처님오신날','07-19':'대체공휴일','08-16':'대체공휴일',
  '09-14':'추석 연휴','09-15':'추석','09-16':'추석 연휴','10-04':'대체공휴일',
  '10-11':'대체공휴일','12-27':'대체공휴일'},
};
const festivals:Record<string,Record<string,string>>={
 '2026':{'03-03':'정월대보름','04-06':'한식','06-19':'단오','08-19':'칠석'},
 '2027':{'02-21':'정월대보름','04-06':'한식','06-09':'단오','08-08':'칠석'},
};
/** null explicitly means not covered, while {} means no named dates this month. */
export function holidaysForMonth(month:string):Record<number,CalendarHoliday>|null{
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return null;
 const [year,mm]=month.split('-');if(!annual[year])return null;
 const result:Record<number,CalendarHoliday>={};
 for(const [date,name] of Object.entries(festivals[year]))if(date.startsWith(mm+'-'))result[Number(date.slice(3))]={name,holiday:false};
 for(const [date,name] of Object.entries({...fixed,...annual[year]}))if(date.startsWith(mm+'-'))result[Number(date.slice(3))]={name,holiday:true};
 return result;
}
