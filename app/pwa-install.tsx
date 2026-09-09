'use client';

import {useEffect,useState} from 'react';
import {Download} from 'lucide-react';
import {AlertDialog,AlertDialogAction,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogTitle} from '@/components/ui/alert-dialog';

interface InstallPromptEvent extends Event {
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>;
}

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in window.navigator && (window.navigator as Navigator&{standalone?:boolean}).standalone===true);
}

export default function PwaInstall(){
  const [prompt,setPrompt]=useState<InstallPromptEvent|null>(null);
  const [installed,setInstalled]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);
  const [ios,setIos]=useState(false);

  useEffect(()=>{
    setInstalled(isStandalone());
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const ready=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPromptEvent)};
    const done=()=>{setInstalled(true);setPrompt(null);setHelpOpen(false)};
    window.addEventListener('beforeinstallprompt',ready);
    window.addEventListener('appinstalled',done);
    if('serviceWorker' in navigator){
      const workerUrl=new URL('sw.js',document.baseURI);
      navigator.serviceWorker.register(workerUrl.href,{scope:new URL('.',document.baseURI).pathname}).catch(()=>{});
    }
    return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',done)};
  },[]);

  async function install(){
    if(!prompt){setHelpOpen(true);return}
    await prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice.outcome==='accepted')setInstalled(true);
    setPrompt(null);
  }

  if(installed)return null;
  return <>
    <button className="btn install-app-button" type="button" onClick={install} aria-label="캠퍼스몽 앱 설치">
      <Download size={17}/><span className="install-label"><span className="install-label-wide">앱 </span>설치</span>
    </button>
    <AlertDialog open={helpOpen} onOpenChange={setHelpOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>캠퍼스몽 설치하기</AlertDialogTitle>
        <AlertDialogDescription className="install-help">
          {ios
            ? <>Safari 아래쪽의 <strong>공유</strong> 버튼을 누른 다음 <strong>홈 화면에 추가</strong>를 선택해 주세요.</>
            : <>브라우저 메뉴에서 <strong>앱 설치</strong> 또는 <strong>바로가기 만들기</strong>를 선택해 주세요. Chrome이나 Edge에서는 주소창 오른쪽의 설치 아이콘으로도 설치할 수 있습니다.</>}
        </AlertDialogDescription>
        <AlertDialogFooter><AlertDialogAction onClick={()=>setHelpOpen(false)}>확인</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}