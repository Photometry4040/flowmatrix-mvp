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
