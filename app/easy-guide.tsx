'use client';

import {useState} from 'react';
import {CircleHelp,Download,ImageDown,MousePointerClick,Save,Search,CalendarDays,Settings2,ShieldCheck,LogIn,WandSparkles} from 'lucide-react';
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle} from '@/components/ui/sheet';

const steps=[
  {icon:Download,title:'1. 처음 한 번만 설치',text:'위쪽의 ‘설치’ 버튼을 누르세요. 다음부터는 휴대폰이나 컴퓨터의 캠퍼스몽 아이콘으로 바로 열 수 있습니다.'},
  {icon:Search,title:'2. 내 근무를 파란색으로 찾기',text:'‘몽 근무 강조’ 네모를 누르면 몽 근무만 파란색으로 보여 쉽게 찾을 수 있습니다.'},
  {icon:MousePointerClick,title:'3. 날짜를 눌러 크게 보기',text:'휴대폰 위쪽의 간단한 달력에서 날짜를 누르세요. 바로 아래에 그날의 근무와 ‘이날 근무 바꾸기’ 버튼이 나옵니다. ‘근무표 보기’는 아래쪽 전체 근무표로 바로 이동합니다. 전체 표는 좌우로 밀어 볼 수 있습니다. ‘오늘’을 누르면 오늘 날짜를 선택합니다. 느낌표(!)가 있는 날은 배치를 확인해 주세요.'},
  {icon:ImageDown,title:'4. 사진으로 보관하기',text:'‘이미지 저장’을 누른 뒤 PNG 이미지 저장을 누르세요. 기기에 따라 사진첩 또는 다운로드 폴더에 저장됩니다. 아이폰은 미리보기 이미지를 길게 눌러 사진에 저장할 수도 있습니다.'},
  {icon:Save,title:'5. 수정할 때만 로그인하고 저장',text:'근무를 바꿀 때는 ‘편집 로그인’을 먼저 누르세요. 변경을 마친 뒤 ‘근무표 저장’을 눌러야 다른 기기에도 반영됩니다.'},
];

const setupSteps=[
  {icon:LogIn,title:'1. 편집 로그인',text:'화면 위쪽의 ‘편집 로그인’을 누르고, 전달받은 ID를 입력한 뒤 ‘로그인’을 누르세요. ‘편집 중 · 로그아웃’이 보이면 로그인된 상태입니다.'},
  {icon:CalendarDays,title:'2. 만들고 싶은 달 선택',text:'달력 위의 연도와 월을 확인하세요. 옆의 왼쪽·오른쪽 화살표로 달을 바꿀 수 있습니다. 다른 달로 가기 전에는 작업 중인 근무표를 먼저 저장하세요.'},
  {icon:Settings2,title:'3. 근무자와 쉬는 요일 설정',text:'휴대폰과 컴퓨터에서 ‘근무자·휴무 설정’을 누르세요. ‘근무자 관리’에서 이름을 누르면 이름, 주간 전담·야간 근무, 정기휴무를 바꿀 수 있습니다. 매주 쉬는 요일을 정확히 2개 선택하고 ‘설정 저장하고 닫기’를 누르세요. 다른 분들도 같은 방법으로 설정합니다. 주간 전담자는 2명으로 맞춰 주세요.'},
  {icon:Settings2,title:'4. 지난달 마지막 날 근무 확인',text:'다시 ‘근무자·휴무 설정’을 열고 아래의 ‘지난달 마지막 날 / 다음 달 첫날 근무’를 찾으세요. 각 사람의 ‘지난달 말일’에는 지난달 마지막 날의 실제 근무를 넣습니다. ‘다음 달 1일’도 정해져 있다면 입력하세요. 모르는 값은 ‘미확인’으로 두고, 최종 사용 전에 확인하세요. 야간 근무 바로 다음 날 주간 근무가 잡히는 것을 막기 위한 확인입니다.'},
  {icon:WandSparkles,title:'5. 자동으로 한 달 초안 만들기',text:'설정 창을 닫고 ‘자동 편성’(저장된 달은 ‘이번 달 다시 편성’) → ‘초안 만들기’를 누르세요. 정기휴무를 참고해 한 달 근무표가 만들어집니다. 빈자리가 남을 수 있으니 다음 단계에서 확인하세요. 이미 작성한 달에서 다시 누르면 그달의 기존 배치가 새로 만들어집니다.'},
  {icon:ShieldCheck,title:'6. 부족한 자리와 휴식 확인',text:'휴대폰 아래의 ‘점검’ 또는 위쪽 ‘편성 확인이 필요한 날’을 누르세요. 안내된 날짜를 누르면 배치를 고칠 수 있습니다. 주간은 정문·후문 2곳, 야간은 정문·후문·예관·소속관 4곳이 필수입니다. 유치원·창업관의 빈자리는 경고로 안내됩니다. 자동 편성 결과는 실제 근무 기준과 한 번 더 맞춰 주세요.'},
  {icon:Save,title:'7. 마지막에 근무표 저장',text:'‘근무표 저장’을 누르고 ‘근무표를 저장했습니다.’라는 알림이 나오는지 확인하세요. 휴대폰은 화면 아래, 컴퓨터는 위쪽에 저장 버튼이 있습니다. 설정 창의 ‘저장하고 닫기’도 이번 달 근무표 전체를 저장합니다. 저장 실패 안내가 나오면 화면을 닫지 말고, 안내된 문제를 해결한 뒤 다시 저장하세요.'},
];
const editSteps=[
  {icon:MousePointerClick,title:'하루 근무를 바꾸려면',text:'달력의 날짜를 누르세요. 휴대폰은 아래에 나오는 그날의 상세 화면에서 ‘이날 근무 바꾸기’를 한 번 더 누릅니다. 바꿀 사람 이름 옆의 선택 상자를 눌러 주간·야간 근무지 또는 휴무를 고르세요. 다른 사람이 이미 맡은 자리라면, 기존 담당자를 먼저 휴무로 바꾸고 새 담당자를 배치하세요. 끝나면 ‘점검’ 후 ‘근무표 저장’을 누릅니다.'},
  {icon:CalendarDays,title:'연가를 넣으려면',text:'‘개인별 보기’에서 이름을 누르고 ‘연가 신청’에서 날짜와 대신 근무할 분을 고르세요. ‘연가·대체 근무 함께 적용’을 누르면 두 사람의 배치가 함께 바뀝니다. 조건에 맞는 분만 선택할 수 있습니다. 기존 선택 근무지 담당자를 고르면 그 자리는 비게 됩니다. 적용 후 ‘저장하고 닫기’를 누르세요.'},
  {icon:Settings2,title:'근무자가 새로 오셨다면',text:'‘근무자·휴무 설정’의 ‘근무자 추가’에서 이름과 근무 구분을 고르고 ‘추가’를 누르세요. 새로 추가한 분은 토·일이 정기휴무로 되어 있으니 이름을 눌러 실제 쉬는 요일로 바꾸세요. 기존 근무표에 필요한 배치를 확인한 뒤 저장하세요.'},
  {icon:Search,title:'수정 표시와 저장 시간',text:'직접 근무·휴무·연가를 바꾼 날짜에는 ‘수정’ 표시가 남습니다. 저장 전이라는 뜻은 아닙니다. 위쪽 ‘마지막 저장’ 시간과 ‘저장 전 변경 있음’을 함께 확인하세요. 자동 재편성하면 수정 표시는 초기화됩니다. 이전 버전에서 수정한 내역은 표시되지 않을 수 있습니다.'},
  {icon:Save,title:'잘못 바꿨다면',text:'화면 아래 ‘되돌리기’를 누르면 이 화면에서 한 이전 수정으로 돌아갑니다. ‘저장하지 않은 변경’이나 ‘변경 후 저장해 주세요’가 보이면 아직 저장 전입니다. 되돌린 결과도 유지하려면 ‘근무표 저장’을 누르세요. 다른 달로 이동하거나 화면을 새로 열면 이전 수정으로 되돌릴 수 없으니 먼저 확인하세요.'},
];

export default function EasyGuide(){
  const [open,setOpen]=useState(false);
  const [section,setSection]=useState('setup');
  const shownSteps=section==='setup'?setupSteps:section==='edit'?editSteps:steps;
  return <>
    <button className="btn guide-button" type="button" onClick={()=>setOpen(true)}>
      <CircleHelp size={18}/>사용 안내
    </button>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="detail-sheet guide-sheet">
        <SheetHeader>
          <SheetTitle>캠퍼스몽 쉬운 사용 안내</SheetTitle>
          <SheetDescription>필요할 때 이 안내를 다시 열어 천천히 따라 하세요.</SheetDescription>
        </SheetHeader>
        <div className="sheet-body guide-body">
          <div className="guide-steps" role="group" aria-label="안내 종류">
            {[['setup','처음 근무표 만들기'],['edit','근무·연가 바꾸기'],['view','근무표 보기·설치']].map(([value,title])=><button key={value} type="button" className={'btn full '+(section===value?'primary':'')} aria-pressed={section===value} onClick={()=>setSection(value)}>{title}</button>)}
          </div>
          <p className="guide-lead">{section==='setup'?<>처음에는 <strong>로그인 → 달 선택 → 설정 → 자동 편성 → 점검 → 저장</strong> 순서로 따라 하세요.</>:section==='edit'?<>수정을 마치면 꼭 <strong>점검 → 근무표 저장</strong>을 눌러 주세요.</>:<>평소에는 <strong>몽 근무 강조 → 날짜 누르기 → 이미지 저장</strong>으로 확인하세요.</>}</p>
          <ol className="guide-steps">
            {shownSteps.map(({icon:Icon,title,text})=><li key={title}><span><Icon size={23}/></span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
          <div className="guide-note"><strong>안심하세요</strong><p>잘못 눌렀다면 저장하지 않고 화면을 다시 열면 됩니다. ‘근무표 저장’ 또는 ‘저장하고 닫기’를 누르기 전에는 공유 근무표가 바뀌지 않습니다.</p></div>
          <button className="btn primary full" type="button" onClick={()=>setOpen(false)}>안내 닫기</button>
        </div>
      </SheetContent>
    </Sheet>
  </>;
}

