'use client';

import {useState} from 'react';
import {CircleHelp,Download,ImageDown,MousePointerClick,Save,Search} from 'lucide-react';
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle} from '@/components/ui/sheet';

const steps=[
  {icon:Download,title:'1. 처음 한 번만 설치',text:'위쪽의 ‘설치’ 버튼을 누르세요. 다음부터는 휴대폰이나 컴퓨터의 캠퍼스몽 아이콘으로 바로 열 수 있습니다.'},
  {icon:Search,title:'2. 내 근무를 파란색으로 찾기',text:'‘몽 근무 강조’ 네모를 누르면 몽 근무만 파란색으로 보여 쉽게 찾을 수 있습니다.'},
  {icon:MousePointerClick,title:'3. 날짜를 눌러 크게 보기',text:'휴대폰에서는 보고 싶은 날짜를 누르세요. 그날의 주간·야간·휴무가 아래에 크게 나옵니다.'},
  {icon:ImageDown,title:'4. 사진으로 보관하기',text:'‘이미지 저장’을 누른 뒤 PNG 이미지 저장을 누르세요. 사진첩에서 한 달 근무표를 크게 볼 수 있습니다.'},
  {icon:Save,title:'5. 수정할 때만 로그인하고 저장',text:'근무를 바꿀 때는 ‘편집 로그인’을 먼저 누르세요. 변경을 마친 뒤 ‘근무표 저장’을 눌러야 다른 기기에도 반영됩니다.'},
];

export default function EasyGuide(){
  const [open,setOpen]=useState(false);
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
          <p className="guide-lead">평소에는 <strong>몽 근무 강조 → 날짜 누르기 → 이미지 저장</strong> 세 가지만 기억하시면 됩니다.</p>
          <ol className="guide-steps">
            {steps.map(({icon:Icon,title,text})=><li key={title}><span><Icon size={23}/></span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
          <div className="guide-note"><strong>안심하세요</strong><p>잘못 눌렀다면 저장하지 않고 화면을 다시 열면 됩니다. ‘근무표 저장’을 누르기 전에는 공유 근무표가 바뀌지 않습니다.</p></div>
          <button className="btn primary full" type="button" onClick={()=>setOpen(false)}>안내 닫기</button>
        </div>
      </SheetContent>
    </Sheet>
  </>;
}