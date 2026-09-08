import React from 'react';
import {createRoot} from 'react-dom/client';
import Scheduler from '../app/scheduler';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<><div className="no-print" style={{padding:12,textAlign:'center',background:'#eaf1ff',fontSize:14}}>이 버전의 근무표는 현재 기기에만 저장됩니다. 여러 기기에서 같은 표를 사용하려면 <a href="https://campusmong.jim46830.workers.dev" style={{textDecoration:'underline'}}>공유 근무표 열기</a></div><Scheduler/></>);
