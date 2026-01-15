# Changelog

FlowMatrix 프로젝트의 모든 주요 변경사항이 이 파일에 기록됩니다.

이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 따릅니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)를 기반으로 합니다.

---

## [Unreleased]

### Phase 8 - AI + Ontology Backend (계획 수립 완료, 2026-01-15)

#### 🤖 AI + Ontology Knowledge Graph Platform

**새로운 아키텍처로 재설계됨 (PostgreSQL → MariaDB + MongoDB)**

**목표**: FlowMatrix를 단순 워크플로우 툴에서 **AI 기반 Ontology Knowledge Graph 플랫폼**으로 진화

#### 🏗️ Three-Layer Architecture

1. **Semantic Layer**: Ontology 정의, Type System, Semantic Search
   - ObjectType (동적 생성, 상속 지원)
   - PropertyType, LinkType, ActionType, InterfaceType
   - OpenAI Embedding (768-dim vector, cosine similarity search)
   - MongoDB Vector Search (의미론적 검색)

2. **Kinetic Layer**: Pipeline 실행 및 Action 오케스트레이션
   - Visual Pipeline Builder (DAG 생성)
   - Action Executor (JavaScript/Python/HTTP)
   - Bull Queue + Redis (작업 큐)
   - Event Bus (실시간 상태 전파)

3. **Dynamic Layer**: Runtime Object 관리 및 실시간 동기화
   - Object Instance Management (동적 스키마)
   - Complete Change History Tracking (Temporal Query 지원)
   - Object Explorer (Graph Traversal)
   - Real-time WebSocket Sync

#### 💾 Database Design

**MariaDB 10.11+** (구조화된 데이터):
- users, organizations, projects (메타데이터)
- project_members (RBAC: OWNER, EDITOR, VIEWER)
- activity_logs (Audit Trail, 감사 로그)
- sessions (JWT 토큰 추적)

**MongoDB 7.0+** (유연한 스키마):
- `ontology.objectTypes` - ObjectType 정의 (확장 가능)
- `ontology.propertyTypes, linkTypes, actionTypes` - 타입 정의
- `ontology.functions` - 실행 가능한 함수
- `objects.instances` - 동적 객체 (Polymorphic)
- `objects.changeHistory` - 완전한 변경 이력 추적
- `pipelines.definitions` - 파이프라인 정의 (DAG)
- `pipelines.executions` - 파이프라인 실행 기록

#### 🤖 AI Integration

- **OpenAI text-embedding-3-small**: 768-dim vector 생성 ($0.02/1M tokens)
- **Semantic Search**: "마케팅과 비슷한 작업 찾기" (MongoDB Vector Search)
- **Workflow Analysis**: GPT-4o-mini로 병목 감지 및 최적화 제안
- **Auto-tagging**: 설명 → 자동 ontology_tags 생성

#### 📡 API Architecture

- **GraphQL** (Ontology 쿼리, Real-time Subscriptions)
  - Query: objectTypes, findSimilarObjectTypes, objects, exploreGraph
  - Mutation: createObjectType, createObject, createLink, executePipeline
  - Subscription: objectUpdated, pipelineExecutionUpdate

- **REST** (파일 작업, Batch 처리)
  - POST /api/ai/generate-embedding
  - POST /api/ai/semantic-search
  - POST /api/ai/analyze-workflow
  - POST /api/projects/:id/import/excel
  - GET /api/projects/:id/export/excel

#### 📋 Task Breakdown (10주, 240-320시간)

**Week 1-2 (T8.1-T8.3): Infrastructure Setup**
- T8.1: MariaDB + MongoDB + Redis Docker Compose (12h)
- T8.2: Express.js + GraphQL/Apollo Server (16h)
- T8.3: JWT Authentication System (16h)

**Week 3-4 (T8.4-T8.6): Semantic Layer**
- T8.4: Ontology Manager (ObjectType CRUD, Type Inheritance) (20h)
- T8.5: OpenAI Integration (Embedding, Batch Generation) (12h)
- T8.6: Semantic Search Engine (Vector Search, Caching) (16h)

**Week 5-6 (T8.7-T8.9): Kinetic Layer**
- T8.7: Pipeline Builder API (DAG Validation) (18h)
- T8.8: Action Executor (Bull Queue, Sandbox Runtime) (20h)
- T8.9: Event Bus & WebSocket (Socket.io, Real-time Broadcast) (14h)

**Week 7-8 (T8.10-T8.12): Dynamic Layer**
- T8.10: Object Instance Manager (CRUD, Polymorphic Query) (16h)
- T8.11: Change History Tracker (Temporal Query, Rollback) (12h)
- T8.12: Object Explorer (Graph Traversal, BFS/DFS) (14h)

**Week 9 (T8.13-T8.14): Frontend Integration**
- T8.13: Apollo Client + Axios Setup (16h)
- T8.14: Canvas → Ontology Migration UI (18h)

**Week 10 (T8.15-T8.17): Testing & Documentation**
- T8.15: Backend Unit Tests (Jest, 90%+ coverage) (20h)
- T8.16: E2E Tests (Playwright, 15+ scenarios) (16h)
- T8.17: Documentation (API.md, ONTOLOGY_GUIDE.md, DEPLOYMENT.md) (12h)

#### 📊 Key Features Comparison

| Feature | Phase 7 | Phase 8 |
|---------|---------|---------|
| Node Types | 고정 4개 (TRIGGER, ACTION, DECISION, ARTIFACT) | 동적 무제한 (UI에서 생성) |
| Properties | 고정된 attributes 구조 | ObjectType별 맞춤 속성 |
| Tags | 단순 문자열 배열 | Semantic Vector + Ontology 태그 |
| Search | 이름/설명 텍스트 검색 | AI Semantic Search (유사도 검색) |
| Relationships | 4가지 고정 타입 | 동적 LinkType (무제한) |
| Execution | 상태 추적만 | 완전한 Pipeline 실행 엔진 |
| Change Tracking | 없음 | 완전한 Temporal Audit Log |
| Type Inheritance | 없음 | ObjectType extends 지원 |
| Actions | 정의 불가 | ActionType + Function으로 실행 가능 |

#### 📚 Documentation

- **Plan Document**: `.claude/plans/phase8-ontology-backend.md` (완전한 구현 설계)
- **MariaDB Schema**: 테이블 정의, RBAC, Audit Trail
- **MongoDB Schema**: 모든 Collection 정의, Index 전략
- **API Reference**: GraphQL Schema, REST Endpoints
- **Migration Tool**: LocalStorage → MongoDB 자동 이관

#### 🎯 Success Criteria

✅ 기존 Phase 7 기능 100% 호환
✅ ObjectType 동적 생성 가능 (코드 변경 없음)
✅ Semantic Search 정확도 > 80% (embedding 기반)
✅ Pipeline 실행 성공률 > 99%
✅ Real-time Sync latency < 100ms
✅ API Response Time < 300ms (p95)
✅ 90%+ 백엔드 테스트 커버리지

#### 🚀 Next Phase Preview (Phase 9)

- **AI Agent**: GPT-4 기반 워크플로우 자동 생성
- **Advanced Reasoning**: Ontology Inference Engine
- **Data Connection**: 외부 API/DB 통합 (Zapier-like)
- **Mobile App**: React Native + GraphQL
- **Advanced Analytics**: Workflow Pattern Mining

---

## [0.7.0] - 2026-01-15

### Added

#### 🕐 Lead Time Auto-Calculator (T7.1-T7.2)
- **Automatic lead time calculation** based on node `avg_time` attributes
  - Supports time formats: hours (2h), minutes (45m), days (3d)
  - Memoized DFS algorithm for efficient critical path detection
  - Exports lead time analysis to CSV
- **LeadTimePanel component** with interactive metrics
  - Total workflow lead time display (formatted)
  - Critical path visualization with gold highlight on canvas
  - Stage-by-stage and department-by-department breakdowns
  - Progress bars showing relative time contributions
- **Lead Time Engine Integration**
  - `calculateWorkflowLeadTime()` - Comprehensive workflow metrics
  - `calculateCriticalPath()` - Longest path algorithm
  - `detectBottlenecksByLeadTime()` - Auto-identify nodes >30% of critical path
  - `calculateStageLeadTime()` & `calculateDepartmentLeadTime()` - Aggregations
- **Test Coverage**: 75 unit tests (~95% code coverage)

#### 📚 Workflow Template Library (T7.3-T7.4)
- **Template CRUD Operations**
  - Save current workflow as custom template
  - Load templates to create new projects
  - Delete custom templates with confirmation
  - Search templates by name, description, tags
  - Filter templates by category (5 categories)
- **Built-in Templates** (3 pre-configured templates)
  - "애자일 스프린트 워크플로우" - Software development (7 nodes)
  - "하드웨어 제품 개발" - Hardware development (8 nodes)
  - "캠페인 실행 프로세스" - Marketing campaigns (6 nodes)
- **TemplateLibrary Dialog Component**
  - Grid-based template card layout
  - Category tabs for easy filtering
  - Real-time search with multi-criteria filtering
  - Import/export templates as JSON
  - Usage statistics and metadata display
- **LocalStorage Integration**
  - Templates stored with automatic initialization
  - Usage count tracking (incremented on load)
  - Efficient querying with caching
- **Test Coverage**: 123 unit tests (85%+ code coverage)

#### 📊 Excel Export (T7.5-T7.6)
- **Multi-sheet Excel Export** (4 customizable sheets)
  - **Node List Sheet** - 12 columns: ID, Name, Type, Department, Stage, Duration, Assignee, Status, Tools, Tags, AI Score, Bottleneck
  - **Adjacency Matrix Sheet** - N×N binary connectivity matrix with frozen headers
  - **Lead Time Report Sheet** - Detailed analysis by stage, department, and critical path
  - **Statistics Sheet** - Workflow metrics dashboard: node count, completion %, bottlenecks, AI-replaceable nodes
- **ExcelExportDialog Component**
  - Customizable export options with 4 checkboxes (select which sheets to include)
  - Filename customization with auto-suggestion
  - File size estimation and >10MB warning
  - Preview selected sheets before exporting
  - Progress indicator during export
  - Toast notifications for success/error/warnings
- **Professional Styling**
  - Bold headers with light gray background
  - Borders on all cells
  - Alternating row colors for readability
  - Frozen header rows and columns
  - Auto-fitted column widths
- **Performance**
  - Handles 100+ node workflows in <2 seconds
  - Special character support in labels
  - Large file handling with progressive generation
- **Test Coverage**: 133 unit tests (85%+ code coverage)

#### 🗄️ Database Design Documentation
- **DATABASE_DESIGN.md** - Comprehensive Phase 8 backend preparation
  - PostgreSQL schema with 13 tables covering all features
  - Entity Relationship Diagram (ERD) with Mermaid visualization
  - Multi-tenant architecture design
  - Migration strategy from LocalStorage to PostgreSQL
  - Index strategy with 15+ recommended indexes
  - Query optimization examples
  - Backup and disaster recovery procedures
  - Scalability and security considerations
  - Ready for Phase 8 implementation with no ambiguity

### Documentation

- **Updated `orchestrate.md`** - Added Phase 7 task definitions with examples
- **Created `.claude/commands/` documentation** - Clear instructions for orchestrating Phase 7 tasks
- **Test Coverage Documentation** - 331 E2E and unit tests across 3 major features
- **Architecture Updates** - Database design prepared for Phase 8 backend

### Testing

- **Unit Tests**: 331 tests across feature implementations
  - T7.1: 75 tests (~95% coverage)
  - T7.3: 123 tests (85%+ coverage)
  - T7.5: 133 tests (85%+ coverage)
- **E2E Tests**: 12 integration test scenarios covering all Phase 7 features
- **Test Pass Rate**: 100% across all tests
- **Zero Flaky Tests**: All tests deterministic and independent

### Performance

- **Lead Time Calculation**: <100ms for 100+ node workflows
- **Template Operations**: <200ms for loading/saving
- **Excel Export**: <2 seconds for 100+ node workflows
- **UI Responsiveness**: Maintained with optimized memoization and lazy loading

### Breaking Changes

None. Phase 7 features are purely additive to the existing MVP.

### Migration Guide

**For Users:**
1. Lead time calculations are automatic - no configuration needed
2. Built-in templates available immediately in Template Library
3. Excel export accessible via toolbar button

**For Developers:**
1. See `DATABASE_DESIGN.md` for Phase 8 backend setup
2. See `orchestrate.md` for T7.1-T7.10 task execution patterns
3. See unit test files for usage examples of new APIs

### Known Limitations

- **Lead Time**: Currently based on `avg_time` attribute; lag times between nodes not yet factored
- **Templates**: Stored in LocalStorage (5MB limit); Phase 8 will move to PostgreSQL
- **Excel**: SheetJS Community Edition has limited styling; consider Pro for advanced formatting

### Future Enhancements

- **Phase 8 (4-6 weeks)**: Backend with PostgreSQL, REST API, JWT auth, real-time collaboration
- **Real-time Sync**: WebSocket/Socket.io for live team collaboration
- **Advanced Analytics**: Historical lead time trends, resource utilization, bottleneck patterns
- **AI Improvements**: ML-based lead time estimation, bottleneck prediction
- **Mobile Support**: Responsive design for tablets/mobile

### Contributors

🤖 **Claude AI (Haiku 4.5)** - Phase 7 implementation specialist
- T7.1-T7.6: Core feature & test implementation
- T7.7-T7.10: Testing & documentation

---

**Summary**

Phase 7 completes the FlowMatrix MVP frontend with three major features:

1. **🕐 Lead Time Calculator** - Automatic workflow lead time analysis with critical path visualization
2. **📚 Template Library** - Pre-built and custom workflow templates for faster project creation
3. **📊 Excel Export** - Professional Excel reports with multiple analysis views

All features are production-ready with 331 unit tests, comprehensive documentation, and performance optimizations. The included `DATABASE_DESIGN.md` prepares the team for Phase 8 backend implementation.

**Estimated Phase 8 Timeline**: 4-6 weeks (PostgreSQL, REST API, authentication, real-time collaboration)

---

## [0.6.0] - 2026-01-14

### Added
- **Edge Deletion UI Improvements** (Phase 3 - Connection Management)
  - 세 가지 엣지 삭제 방법:
    * Delete 키: 선택된 엣지 + Delete 키
    * 우클릭: 엣지 우클릭 → 즉시 삭제
    * X 버튼: 호버 시 나타나는 X 버튼 클릭
  - CustomEdge 컴포넌트: @xyflow/react BaseEdge 확장
    * EdgeLabelRenderer로 X 버튼 렌더링
    * useReactFlow() 훅으로 자체 삭제 처리
    * 선택/호버 시 버튼 가시성 토글
  - onEdgeContextMenu 핸들러: 우클릭 즉시 삭제
  - handleEdgesDelete 개선: 실제 엣지 삭제 + Toast 피드백

### Changed
- **WorkflowCanvas.tsx**:
  - CustomEdge import 추가
  - edgeTypes 설정 (custom: CustomEdge)
  - ReactFlow defaultEdgeOptions에 type: "custom" 추가
  - onEdgeContextMenu 핸들러 통합
  - handleEdgesDelete 구현 완료 (console.log만 하던 것 → 실제 삭제)

### Features
✓ 삭제 키로 엣지 제거
✓ 우클릭으로 엣지 즉시 삭제
✓ 호버 X 버튼으로 직관적인 삭제 UI
✓ 모든 삭제 방법에 Toast 알림
✓ 선택된 엣지는 시각적으로 강조 (strokeWidth 3, 색상 변경)

---

## [0.5.1] - 2026-01-14

### Fixed
- **MatrixView 드래그앤드롭 버그 수정**:
  - CSS Grid 문법 오류 (언더스코어 → 쉼표) 수정
  - @dnd-kit 센서 명시적 설정 추가 (PointerSensor, distance: 8px)
  - 드래그 핸들 구조 개선 (root div에 listeners 적용)
  - 데이터 직렬화 문제 해결 (nodeData 제거, 필수 필드만 유지)
  - @dnd-kit 중첩 데이터 구조 처리 (data.current 언래핑)

### Changes
- **DraggableMatrixNode.tsx**:
  - Card 컴포넌트 → 순수 div로 변경 (이벤트 전파 안정성)
  - 드래그 핸들 영역 최적화
  - 시각적 피드백 개선

### Result
✅ MatrixView 드래그앤드롭 완전히 작동
✅ 노드를 셀 간 이동하면 부서/단계 자동 변경
✅ Canvas ↔ Matrix 뷰 전환 시 속성 유지

---

## [0.5.0] - 2026-01-13

### Added
- **MatrixView Drag-and-Drop** (Phase 2 - Node Repositioning)
  - 노드를 셀 간 드래그하여 부서/단계 변경 기능
  - DraggableMatrixNode 컴포넌트: @dnd-kit/core 기반 드래그 가능 노드
  - MatrixCell 컴포넌트: @dnd-kit/core 기반 드롭 가능 셀
  - DndContext를 MatrixView에 통합하여 전체 그리드 드래그 가능
  - handleNodeMove 핸들러: 노드 위치 변경 시 상태 업데이트
  - 드래그 중 시각적 피드백:
    * 노드: opacity 50%, scale 95%
    * 셀: 보더 색상 변경, scale 102% 증가
  - Toast 알림: "노드명"을(를) 이동했습니다 (부서명 · 단계명)

### Changed
- **MatrixView 구조 개선**:
  - 기존 정적 렌더링 → DndContext 기반 동적 드래그앤드롭
  - 셀 렌더링: div → MatrixCell 컴포넌트
  - 노드 렌더링: Card → DraggableMatrixNode 컴포넌트
  - onNodeMove 콜백 props 추가
  - 같은 셀 드롭 감지 및 무시
  - 부서/단계 자동 정렬 (order field 기준)

### Features
✓ MatrixView에서 노드를 다른 셀로 드래그 가능
✓ 드롭 시 자동으로 department, stage 업데이트
✓ 선택된 노드 상태 동기화 (detail panel)
✓ 시각적 피드백: 드래그 중 노드 흐릿해짐, 셀 하이라이트
✓ Toast 알림으로 사용자 확인
✓ Canvas/Matrix 뷰 전환 시 속성 유지

---

## [0.4.0] - 2026-01-13

### Added
- **Dynamic Department/Stage Management** (Phase 1 - Workspace Configuration)
  - 부서와 단계를 동적으로 추가/삭제/수정할 수 있는 기능
  - DepartmentManager 컴포넌트: Dialog 기반 부서 관리 UI
  - StageManager 컴포넌트: Dialog 기반 단계 관리 UI
  - 새로운 라이브러리 workspaceConfig.ts:
    * loadWorkspaceConfig() / saveWorkspaceConfig() 함수
    * addDepartment() / deleteDepartment() / updateDepartment() / reorderDepartments()
    * addStage() / deleteStage() / updateStage() / reorderStages()
    * canDeleteDepartment() / canDeleteStage() 검증 함수
    * resetToDefaults() 초기화 함수
  - LocalStorage 자동 저장 (키: "flowmatrix_workspace_config")
  - 부서/단계 드래그로 순서 변경 기능
  - 노드가 사용 중인 부서/단계 삭제 시 경고 및 차단

### Changed
- **타입 시스템 개선**:
  - Department: Union type → string 타입 (동적 확장성 확보)
  - ProjectStage: Union type → string 타입
  - 새로운 타입 추가:
    * DepartmentConfig: { id, label, order }
    * StageConfig: { id, label, order }
    * WorkspaceConfig: { id, departments[], stages[] }
- **MatrixView 개선**:
  - 하드코딩된 부서/단계 제거
  - departments, stages를 props로 받음 (동적 그리드)
  - 동적 그리드 열 계산 (단계 수에 따라)
  - 최대 10개 부서 × 7개 단계 지원 (실용적 한계)
- **WorkflowCanvas 업데이트**:
  - workspaceConfig 상태 추가 (LocalStorage 기반 초기화)
  - MatrixView에 departments, stages props 전달
  - Matrix 뷰 상단에 "부서 관리", "단계 관리" 버튼 추가
  - selectedDepartment, selectedStage를 동적으로 로드

### Features
✓ 사용자가 무한정으로 부서/단계 추가 가능
✓ 부서/단계명 수정 가능
✓ 부서/단계 드래그로 순서 변경 가능
✓ 노드가 있는 부서/단계는 삭제 불가 (Toast 경고)
✓ 모든 변경사항 LocalStorage에 자동 저장
✓ 기본값: 6개 부서 (제품, 디자인, SW, HW, QA, 마케팅) + 5개 단계 (기획, 개발, 테스트, 배포, 유지보수)
✓ Dialog 기반 사용자 친화적 UI
✓ 모든 작업에 대한 Toast 피드백

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
