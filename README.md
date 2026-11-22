# Unified Map of SeokhyeonLeeMed GitHub

SeokhyeonLeeMed가 GitHub Pages로 운영하는 사이트를 한 장의 지도에 모은 허브 페이지.
정적 HTML/CSS/JS뿐이라 빌드 과정이 없다.

| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 뼈대 (제목 블록, 지도 SVG 자리, 범례) |
| `app.js` | `SITES` 배열이 유일한 데이터. 지도(경위선·등고선·경로·핀)와 범례 목록을 여기서 그린다. 마지막 갱신일은 GitHub 공개 API에서 읽는다(실패해도 페이지는 온전함). |
| `style.css` | 종이 지도(라이트) / 야간 지도(다크) 색 토큰 |
| `icon.svg` | 로고 원본. 탭 아이콘과 홈 화면 아이콘으로만 쓴다(페이지 안에는 넣지 않음). |
| `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | `node _tools/render_icons.cjs`로 `icon.svg`에서 생성 |
| `manifest.webmanifest` | 홈 화면 웹앱 설정 |

## 사이트 추가·수정

`app.js`의 `SITES`에 항목을 넣는다: `repo`(저장소 이름 = Pages 경로), `name`, `title`, `desc`, `kind`(`med`/`study`/`life`/`music`), `locked`(로그인 필요 여부).
지도 좌표는 **손으로 넣지 않는다.** 사이트 개수에 맞춰 지그재그 길(홀수 번호 윗줄, 짝수 번호 아랫줄) 위에 같은 간격으로 놓이고, 언덕 크기·작은 배경 언덕·점선 길도 따라 정해진다(`app.js`의 `X0`·`X1`·`ROW_Y`·`HILL`).
배열 순서가 곧 번호와 길 순서라 같은 분류끼리 붙여 둔다(지금: 의학 → 어학 → 생활 → 음악). 하나를 덧붙이기만 하면 한쪽 구석에 몰리던 예전 문제(2026-11-23 루틴 점검 추가 때)가 생기지 않는다.

## 로컬 미리보기

`index.html`을 브라우저로 열면 된다.

## 로컬 폴더 구성 (`C:\Users\hahah\Claude-assisted Projects`)

| 폴더 | GitHub |
|---|---|
| `med-quiz` (구 `Documents\고려대 의대\퀴즈`) | `_publish/` → SeokhyeonLeeMed/med-quiz |
| `lang-study` (구 `Documents\외국어`) | `_publish/` → SeokhyeonLeeMed/lang-study |
| `general_assistant` (구 `Documents\생활\비서`) | `_publish/` → SeokhyeonLeeMed/general_assistant |
| `med-map` | SeokhyeonLeeMed/med-map |
| `fretaid` (구 `fretlab`) | SeokhyeonLeeMed/fretaid |
| `routine` | `_publish/` → SeokhyeonLeeMed/routine |
| `unified_map` | 이 사이트 (SeokhyeonLeeMed/unified_map) |
| `drosophila-simulator` | 로컬 git만 (원격 없음) |
| `nangbo-site`, `noraeol-session-bot`, `yt-tools`, `입시자료` | git 아님 |

여러 프로젝트의 브라우저 테스트는 `fretaid/node_modules/playwright`를 빌려 쓴다. `fretaid`의 `node_modules`를 지우면 그 테스트들이 깨진다.
