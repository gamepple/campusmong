# 캠퍼스몽

대학교 경비 근무자의 월간 근무·휴무·연가 편집기입니다. React / Vinext, Cloudflare Workers / D1을 사용합니다.

## 사용

1. 설정에서 근무자를 추가·삭제하고, 근무자의 이름을 눌러 주간·야간 구분, 매주 정기휴무 2일, 연간 연가 일수를 설정합니다. 주간 전담자는 2명으로 맞춥니다. 삭제된 근무자의 현재 월 기록도 함께 제거되며 비게 된 근무지는 점검에 표시됩니다.
2. 편성 기준에서 전월 말과 다음 달 1일의 근무 상태를 확인합니다.
3. 자동 편성으로 초안을 만들고, 점검 목록에서 부족한 자리를 확인합니다.
4. 날짜를 눌러 배치를 수정합니다. 기존 자리에 다른 사람이 있으면 먼저 휴무로 변경한 다음 배치합니다.
5. 개인 정보에서 연가를 등록합니다. 현재 배치에서 필수 자리를 비우는 연가는 막습니다. 대체자를 먼저 배치해 주세요.
6. 근무표 저장 버튼으로 서버에 저장합니다. 변경 후 저장하지 않으면 다른 기기에 반영되지 않습니다.

달력·개인별 표, 몽 근무 강조, 20회 되돌리기, 인쇄, JSON 백업을 제공합니다. JSON 백업은 내보내기만 지원합니다.

## 편성 규칙과 가정

- 날짜는 근무 시작일 기준입니다. 시각 단위의 근무 시간 및 노동법 적합성은 계산하지 않습니다.
- 주간은 정문·후문 두 자리. 야간은 정문·후문·예관·소속관 필수 네 자리이며 유치원·창업관은 선택 배치입니다.
- 매일 휴무·연가 합계 2명 이상을 목표로 야간을 최대 5명 배치합니다. 선택 근무지는 번갈아 배치합니다. 수동 편집으로 야간 6명까지 배치할 수 있지만 휴무 2명 미달은 안내합니다.
- 야간 다음 날 주간 배치를 금지합니다. 자동 편성은 다음 날 대체 주간으로 서는 사람을 전날 야간에서 제외합니다. 주간 연속 근무는 허용합니다.
- 정기휴무·연가를 강제로 취소하지 않습니다. 여러 주간 대체 조합을 탐색한 뒤 필수 자리 부족을 최소화하는 초안을 제시합니다. 최적해 보장은 없습니다.
- 자동 편성은 수동 배치를 덮어씁니다. 실행 전 확인하며 되돌릴 수 있습니다.
- 2026년 2월 사진의 야간 배치를 전사한 앱은 아닙니다. 전·남의 주간 전담 및 요일별 정기휴무는 사진을 참고한 추정값입니다. 몽의 16·17일 연가는 사진 참고값이며 추정 휴무와 조합하면 필수 인원이 부족합니다. 실제 근무 조건으로 확인해야 합니다.
- 사진은 정·예·소·후·창 5칸, 앱은 설명에 따른 유치원을 포함한 6개 근무지입니다.
- 연간 연가 한도는 기본 0(미설정)입니다. 다른 저장 월의 등록 연가와 현재 월의 연가를 합산하며, 입력되지 않은 과거 연가는 포함하지 않습니다.
- 새 달은 이전 저장 월의 근무자 설정을 가져옵니다. 인접 월이 저장되어 있으면 새 달의 월 경계 상태도 가져옵니다. 기존 달의 월 경계는 해당 달에 저장한 확인값이므로 다른 달을 수정했다면 다시 확인해야 합니다.

## 저장과 접근

D1 `schedules` 테이블에 월별 설정과 배치를 저장하며 수정 번호를 비교해 다른 창의 변경을 덮어쓰지 않도록 합니다. 브라우저 저장소는 근무표의 원본으로 사용하지 않습니다. 사이트는 주소를 아는 누구나 읽을 수 있습니다. 저장·편성·설정 변경은 ID 전용 로그인 후에만 서버가 허용합니다. 로그인은 비밀번호 없는 공유 ID 방식이므로 ID를 아는 사람은 누구나 수정할 수 있습니다. 로그인 쿠키는 30일간 유지됩니다.

## 개발

Node 22.13 이상이 필요합니다. `npm ci` 후 `npm run dev`, 배포용 빌드는 `npm run build`입니다. D1 바인딩은 `.openai/hosting.json`의 `DB`이며 스키마 변경은 `db/schema.ts`를 수정한 뒤 `npm run db:generate`로 마이그레이션을 생성합니다.

순수 편성 로직 테스트:

```sh
node --experimental-strip-types --test tests/schedule.test.mjs
```

`app/scheduler.tsx`: UI 및 편집 흐름. `lib/schedule.ts`: 편성·검증. `app/api/schedule/route.ts`: 서버 저장과 연간 집계.


## Mobile export and GitHub Pages

The calendar shows worker names on mobile. Print uses a single A4 landscape sheet. Image Save generates a PNG that can be downloaded or long-pressed on a phone.

GitHub Pages builds the same editor with browser-local storage. Data is not shared between devices; use https://campusmong.jim46830.workers.dev for shared server storage. The Pages banner explains this distinction.

In repository Settings → Pages, select GitHub Actions as the source. The included workflow builds and deploys on pushes to main. GitHub Free supports Pages for public repositories; private repositories require an eligible paid plan. Do not change repository visibility merely to enable deployment without reviewing the source first.


## Cloudflare shared deployment

The Cloudflare Worker uses the `campusmong` D1 database through the `DB` binding. Configure the connected Cloudflare build with:

- Build command: `npm run build`
- Deploy command: `npm run deploy:cloudflare`

The deploy command applies unapplied SQL migrations before publishing the Worker. Add `EDITOR_LOGIN_ID` and a long random `EDITOR_SESSION_SECRET` as encrypted production variables in Cloudflare. The server intentionally has no public fallback login ID.
