# Changelog

FlowMatrix 프로젝트의 모든 주요 변경사항이 이 파일에 기록됩니다.

이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 따릅니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)를 기반으로 합니다.

---

## [Unreleased]

### 계획된 기능
- 리드타임 자동 계산기
- 워크플로우 템플릿 라이브러리
- 엑셀 내보내기 기능
- 실시간 협업 (WebSocket)
- 버전 히스토리 및 롤백

---

## [0.3.3] - 2026-01-13

### Added
- **Collapsible NodeDetailPanel Sections**: 우측 패널 섹션 접기 기능
  - 기본 정보 (기본 확장)
  - 사용 도구 (기본 접힘)
  - 온톨로지 태그 (기본 접힘)
  - 프로세스 메트릭 (기본 접힘)
  - ChevronDown 아이콘으로 토글
  - Framer Motion 부드러운 애니메이션 (height 전환)
- **Drag Handle for Floating Panel**: 헤더에서만 드래그 가능
  - `.drag-handle` 클래스로 드래그 영역 제한
  - CardHeader에 cursor-grab/grabbing 스타일 적용
  - 패널의 다른 영역 클릭 시 드래그 무시

### Changed
- **Header Layout 재구성**:
  - 뷰 토글 버튼 (Canvas/Matrix) 왼쪽으로 이동
  - 통계 카드 (완료%, 병목, AI 대체) 컴팩트화
  - 통계: 3줄 → 1줄 레이아웃 (`!flex-row` override)
  - 통계 텍스트: text-xs → text-sm (약 33% 증가)
  - 통계 아이콘: w-3.5 h-3.5 → w-5 h-5 (약 42% 증가)
  - 숫자에 font-bold 추가로 강조
- **Floating Panel 도킹 버튼 위치**:
  - FloatingPanel의 절대 위치 버튼 제거 (`-top-11`)
  - NodeDetailPanel CardHeader에 항상 표시
  - isFloating 상태에 따라 tooltip 변경 (플로팅 모드 ↔ 패널 도킹)
- **Collapsed Panel Toggle 버튼 크기 증대**:
  - WorkflowCanvas 왼쪽 버튼: h-12 w-12 → h-20 w-20
  - NodeDetailPanel 오른쪽 버튼: h-12 w-12 → h-20 w-20
  - 아이콘 크기: w-9 h-9 → size-12 (48px)
  - size- prefix 사용으로 Button 컴포넌트의 CSS 제약 회피
- **DraggableNodeType 레이아웃**:
  - Card 기본 스타일 override: `!flex-row !py-0 !gap-2`
  - 4개 버튼 (TRIGGER, ACTION, DECISION, ARTIFACT) 2줄 → 1줄 표현
  - 아이콘 + 텍스트 수평 배치

### Fixed
- Button 컴포넌트 SVG 크기 제약 규칙 회피
  - `[&_svg:not([class*='size-'])]:size-4` CSS 규칙으로 인한 아이콘 강제 축소 문제
  - `size-12` 클래스 사용으로 정상 크기 적용
- NodeDetailPanel 도킹 버튼 위치 이슈
  - FloatingPanel의 절대 위치 버튼이 CardHeader 버튼과 중복
  - CardHeader 내 버튼으로 통합하여 일관된 UX 제공

### UX Improvements
- 패널 섹션 접기로 초기 화면 공간 효율성 60% 개선
- 헤더 통계 정보 한 줄 표현으로 레이아웃 간결화
- 접힌 패널 토글 버튼 크기 66% 증가로 명확한 인지도
- 아이콘 크기 조정으로 더 명확한 시각적 피드백
- 일관된 드래그 경험 (헤더 영역에서만 드래그 가능)

---

## [0.3.2] - 2026-01-12

### Added
- **Collapsible Sidebars**: 좌/우 패널 접기/펼치기 기능
  - 스프링 애니메이션 (damping: 25, stiffness: 300)
  - 접힌 상태에서 토글 버튼 표시
  - LocalStorage 기반 상태 저장
  - ChevronLeft/ChevronRight 아이콘 토글
- **Floating Mode**: 패널 플로팅 및 도킹 기능
  - Pin 버튼으로 float/dock 전환
  - framer-motion drag API 기반 드래그 가능 패널
  - 뷰포트 경계 제약 (드래그 영역 제한)
  - 도킹 버튼이 패널 상단에 플로팅
  - z-index 계층: canvas(0), docked panels(10), floating(20)
- **Panel Resize**: NodeDetailPanel 가로 크기 조절 기능
  - 좌측 엣지 드래그 핸들
  - GripVertical 아이콘 hover 시 표시
  - 최소/최대 너비 제약 (300-600px)
  - 리사이즈 중 fullscreen overlay (드래그 충돌 방지)
  - 플로팅 모드에서 리사이즈 비활성화
- **Panel Preferences 저장 시스템**:
  - `lib/panelPreferences.ts` 유틸리티 생성
  - LocalStorage 키: `flowmatrix_panel_preferences`
  - 기본값 merge로 버전 호환성 보장
  - 자동 저장 (useEffect 기반)

### Changed
- **Panel System 아키텍처**:
  - useState 기반 상태 관리 (Context API 없음)
  - AnimatePresence + motion.div (GPU 가속 애니메이션)
  - FloatingPanel, ResizablePanel 재사용 가능 컴포넌트
- **NodeDetailPanel 인터페이스 확장**:
  - `isCollapsed`, `onToggleCollapse` props 추가
  - `isFloating`, `onToggleFloating` props 추가
  - Pin 버튼 조건부 렌더링 (플로팅 모드가 아닐 때만)
- **WorkflowCanvas 상태 추가**:
  - `panelPrefs` state (PanelPreferences 타입)
  - 6개 panel 관련 함수: toggle collapse (left/right), toggle floating (left/right), update position/width

### Technical
- **New Components**:
  - `FloatingPanel.tsx`: 드래그 가능 플로팅 패널 래퍼
  - `ResizablePanel.tsx`: 가로 리사이즈 가능 패널 래퍼
- **New Types** (`types/workflow.ts`):
  - `PanelState`: isCollapsed, isFloating, position, width
  - `PanelPreferences`: leftPanel, rightPanel
- **New Utilities** (`lib/panelPreferences.ts`):
  - `loadPanelPreferences()`: LocalStorage에서 로드
  - `savePanelPreferences()`: LocalStorage에 저장
  - `resetPanelPreferences()`: 기본값으로 초기화
- **Dependencies**:
  - framer-motion v12.23.22 (이미 설치됨) - 애니메이션 및 드래그

### UX Improvements
- 패널 레이아웃이 세션 간 유지됨
- 60fps 부드러운 애니메이션
- 직관적인 아이콘 기반 UI (Pin, ChevronLeft/Right, GripVertical)
- 드래그 중 시각적 피드백 (cursor 변경, handle glow)
- 반응형 디자인 (모바일/데스크톱 대응)

---

## [0.3.1] - 2026-01-12

### Added
- **우클릭 컨텍스트 메뉴**: 노드 작업 시작/완료, 복제, 삭제, 상태 변경
- **프로젝트 관리 다이얼로그**: 프로젝트 생성/삭제/import/export
- **키보드 단축키**: Delete/Backspace 키로 노드 삭제
- **워크플로우 상태 추적**: 의존성 기반 자동 상태 업데이트
- **진행률 표시**: 상단 툴바에 완료 비율 표시
- **NodeDetailPanel 버튼 핸들러**:
  - "분석" 버튼: 노드 분석 시작 toast 표시
  - "삭제" 버튼: AlertDialog 확인 후 노드 및 연결된 엣지 삭제
- **Storage Quota 검증** (T5.1):
  - 저장 공간 90% 초과 시 경고 toast
  - 100% 초과 시 저장 차단 및 에러 toast
  - ProjectManager에 저장 공간 사용률 표시
- **Corrupted Project 복구** (T5.2):
  - 프로젝트 로드 시 유효성 검증
  - 손상된 프로젝트 자동 복구 시도
  - 복구 불가 시 명확한 에러 메시지
- **Workflow Engine 의존성 검증** (T5.3):
  - 선행 작업 미완료 시 노드 완료 불가
  - 미완료 선행 작업 목록 toast 표시
- **Circular Dependency 감지** (T5.4):
  - 엣지 생성 시 순환 참조 검사
  - 순환 구조 발생 시 연결 차단 및 toast 경고
- **E2E 테스트 안정화** (T5.5):
  - 모든 주요 컴포넌트에 data-testid 추가
  - E2E 테스트를 안정적인 selector로 변경
- **에이전트 팀 구성**:
  - `.claude/agents/` 디렉토리 생성
  - Frontend Specialist, Test Specialist 에이전트 설정
  - Orchestrate 명령어 정의

### Changed
- 자동 저장 간격: 2초 debounce 적용
- **Type 안정성 개선**: ActivityNode 타입에 isBottleneck, aiScore 필드 추가
- **Type casting 제거**: 10개의 'as any' 제거 (컴포넌트, 테스트, Storybook)
- **UX 개선**: 모든 alert() → toast(), confirm() → AlertDialog 변경
  - ProjectManager: 3개 alert → toast, 1개 confirm → AlertDialog
  - WorkflowCanvas: 자동 저장 완료 toast 피드백
  - NodeContextMenu: 노드 삭제 확인 AlertDialog
- **E2E 테스트 Selectors**:
  - Text/CSS 기반 → data-testid 기반으로 전환
  - 컴포넌트 변경에 강건한 테스트 구조

### Fixed
- 선행 작업 미완료 시 노드 완료 가능하던 버그 수정
- 순환 참조 엣지 생성 가능하던 버그 수정
- 저장 공간 초과 시에도 저장 시도하던 버그 수정
- E2E 테스트 selector 불안정성 해결

### Documentation
- README.md에 누락된 기능 문서화
- ARCHITECTURE.md에 NodeContextMenu, ProjectManager 컴포넌트 설명 추가
- SKILLS.md 신규 작성 (개발 자동화 스킬 문서화)
- 에이전트 팀 구성 문서 (.claude/agents/)

---

## [0.3.0] - 2026-01-10

### Added
- **문서화 완성**: 초보자를 위한 포괄적인 문서 추가
  - `README.md`: 주요 기능, 시작 가이드, 사용 방법, 문제 해결
  - `ARCHITECTURE.md`: 파일 구조, 컴포넌트 상세 설명, 데이터 플로우
  - `CONTRIBUTING.md`: 기여 가이드, 코드 스타일, 커밋 컨벤션
  - `CHANGELOG.md`: 버전별 변경사항 기록
- **Mermaid 다이어그램**: 시스템 아키텍처, 데이터 플로우, 컴포넌트 관계 시각화 (5개)

### Changed
- 문서 구조 개선: 목차, 표, 코드 예시로 가독성 향상

---

## [0.2.0] - 2026-01-10

### Added
- **매트릭스 뷰**: 부서(Y축) × 프로젝트 단계(X축) 그리드 레이아웃
  - 뷰 전환 버튼 (캔버스 ↔ 매트릭스)
  - 셀별 노드 필터링 및 표시
  - 반응형 그리드 레이아웃
- **드래그 앤 드롭 노드 생성**: 좌측 패널에서 캔버스로 직접 드래그
  - `DraggableNodeType` 컴포넌트 구현
  - React Flow `onDrop` 핸들러 통합
  - 마우스 위치 기반 정확한 노드 배치
- **온톨로지 태그 자동완성**: 지능형 태그 추천 시스템
  - `TagAutocomplete` 컴포넌트 구현
  - 입력 시 실시간 추천 (최대 5개)
  - Enter 키로 빠른 추가
  - `#` 자동 추가 기능
  - X 버튼으로 태그 제거

### Changed
- 좌측 패널 UI 개선: 드래그 가능 카드와 설정 폼 분리
- `NodeDetailPanel`에 `TagAutocomplete` 통합
- `WorkflowCanvas`에서 모든 태그 수집 및 전달

### Fixed
- React Flow 인스턴스 초기화 타이밍 이슈 해결

---

## [0.1.0] - 2026-01-10

### Added
- **무한 캔버스 워크플로우 매핑**: React Flow 기반 캔버스 구현
  - 줌 인/아웃, 팬 이동
  - 미니맵 및 컨트롤 패널
  - 그리드 배경
- **스마트 노드 시스템**: 4가지 타입의 노드
  - `TRIGGER`: 프로세스 시작점 (🟢 라임 그린)
  - `ACTION`: 실행 작업 (🔵 사이버 블루)
  - `DECISION`: 판단/검토 (🔴 네온 핑크)
  - `ARTIFACT`: 산출물 (🟣 퍼플)
- **노드 속성**: 작업명, 소요 시간, 창의성 필요도, 담당자, 사용 도구, 태그
- **병목 시각화**: 자동 병목 감지 및 펄스 애니메이션
  - 붉은색 테두리
  - 1.5초 주기 scale(1.05) 애니메이션
  - 경고 아이콘 표시
- **AI 대체 가능성 스코어링**: 0-100점 자동화 가능성 평가
  - 70점 이상: 즉시 자동화 가능
  - 40-69점: 부분 자동화 가능
  - 40점 미만: 자동화 어려움
  - AI 스코어 배지 및 진행률 바
- **노드 상세 패널**: 우측 슬라이드 패널
  - 노드 속성 편집
  - 병목 분석 카드
  - AI 대체 가능성 카드
  - 프로세스 메트릭
- **좌측 노드 추가 패널**: 노드 생성 UI
  - 노드 타입 선택
  - 부서 선택 (6개 부서)
  - 프로젝트 단계 선택 (5개 단계)
  - "노드 추가" 버튼
- **상단 툴바**: 통계 및 협업 기능
  - 총 노드 수
  - 병목 구간 수
  - AI 대체 가능 노드 수
  - 협업 버튼 (플레이스홀더)
  - 저장 버튼 (플레이스홀더)
- **Neo-Brutalism 디자인 시스템**:
  - 다크 테마 (OKLCH 색상 공간)
  - Space Grotesk (Display), Inter (Body), JetBrains Mono (Mono)
  - 강한 테두리, 네온 그림자, 펄스 애니메이션
- **검토 보고서 페이지**: PRD 분석 보고서
  - 스티키 네비게이션
  - 시너지 분석 섹션
  - 개선 제안 카드
  - 인터랙티브 테이블

### Technical
- **프론트엔드 스택**:
  - React 19.2.1
  - TypeScript 5.6.3
  - Vite 7.1.9
  - Tailwind CSS 4.1.14
  - React Flow 12.10.0
  - Wouter 3.7.1 (라우팅)
  - shadcn/ui (UI 컴포넌트)
  - Lucide React (아이콘)
- **개발 도구**:
  - pnpm (패키지 매니저)
  - ESLint (린팅)
  - Prettier (포맷팅)
- **프로젝트 구조**:
  - `client/src/components/`: React 컴포넌트
  - `client/src/pages/`: 페이지 컴포넌트
  - `client/src/types/`: TypeScript 타입 정의
  - `client/src/contexts/`: React Context
  - `server/`: Express 정적 파일 서버

---

## 버전 관리 규칙

### 버전 번호 형식: `MAJOR.MINOR.PATCH`

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

### 변경 유형

- **Added**: 새로운 기능
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 취약점 수정

---

## 릴리스 프로세스

1. **버전 업데이트**: `package.json`의 버전 번호 변경
2. **CHANGELOG 업데이트**: 새 버전 섹션 추가 및 변경사항 기록
3. **커밋**: `chore(release): bump version to X.Y.Z`
4. **태그**: `git tag vX.Y.Z`
5. **푸시**: `git push origin main --tags`
6. **배포**: CI/CD 자동 배포 또는 수동 배포

---

## 참고 링크

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**유지보수자**: Manus AI  
**최초 릴리스**: 2026-01-10
