# FlowMatrix 기여 가이드

FlowMatrix 프로젝트에 기여해주셔서 감사합니다! 이 문서는 코드 기여, 이슈 제출, 풀 리퀘스트 작성 방법을 안내합니다.

## 📋 목차

1. [행동 강령](#행동-강령)
2. [시작하기](#시작하기)
3. [개발 워크플로우](#개발-워크플로우)
4. [코드 스타일 가이드](#코드-스타일-가이드)
5. [커밋 컨벤션](#커밋-컨벤션)
6. [풀 리퀘스트 가이드](#풀-리퀘스트-가이드)
7. [이슈 제출](#이슈-제출)
8. [테스트 작성](#테스트-작성)

---

## 🤝 행동 강령

FlowMatrix는 모든 기여자에게 열려있고 환영하는 커뮤니티를 지향합니다. 다음 원칙을 준수해주세요:

- **존중**: 모든 의견과 관점을 존중합니다
- **포용**: 다양한 배경과 경험을 가진 기여자를 환영합니다
- **건설적 피드백**: 비판은 건설적이고 구체적으로 제공합니다
- **협력**: 함께 더 나은 제품을 만들기 위해 협력합니다

---

## 🚀 시작하기

### 1. 저장소 포크 및 클론

```bash
# 1. GitHub에서 저장소 포크
# 2. 로컬에 클론
git clone https://github.com/YOUR_USERNAME/flowmatrix-review.git
cd flowmatrix-review

# 3. 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/ORIGINAL_OWNER/flowmatrix-review.git
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.

---

## 🔄 개발 워크플로우

### 브랜치 전략

FlowMatrix는 **Git Flow** 기반의 브랜치 전략을 사용합니다:

| 브랜치 | 용도 | 예시 |
|-------|------|------|
| `main` | 프로덕션 배포 브랜치 | - |
| `develop` | 개발 통합 브랜치 | - |
| `feature/*` | 새 기능 개발 | `feature/matrix-export` |
| `bugfix/*` | 버그 수정 | `bugfix/node-drag-issue` |
| `hotfix/*` | 긴급 수정 | `hotfix/security-patch` |
| `docs/*` | 문서 작업 | `docs/update-readme` |

### 새 기능 개발 플로우

```bash
# 1. develop 브랜치에서 최신 코드 가져오기
git checkout develop
git pull upstream develop

# 2. 새 feature 브랜치 생성
git checkout -b feature/your-feature-name

# 3. 코드 작성 및 커밋
git add .
git commit -m "feat: add your feature"

# 4. 원격 저장소에 푸시
git push origin feature/your-feature-name

# 5. GitHub에서 Pull Request 생성
```

### 버그 수정 플로우

```bash
# 1. develop 브랜치에서 bugfix 브랜치 생성
git checkout develop
git checkout -b bugfix/issue-description

# 2. 버그 수정 및 커밋
git commit -m "fix: resolve issue with node dragging"

# 3. 푸시 및 PR 생성
git push origin bugfix/issue-description
```

---

## 🎨 코드 스타일 가이드

### TypeScript 스타일

#### 네이밍 컨벤션

```typescript
// ✅ Good: PascalCase for types and interfaces
interface ActivityNode { ... }
type NodeType = "TRIGGER" | "ACTION";

// ✅ Good: camelCase for variables and functions
const selectedNode = null;
function handleNodeClick() { ... }

// ✅ Good: UPPER_SNAKE_CASE for constants
const MAX_NODE_COUNT = 100;
const API_BASE_URL = "https://api.example.com";

// ❌ Bad: Inconsistent naming
interface activityNode { ... }  // Should be PascalCase
const SelectedNode = null;      // Should be camelCase
```

#### 타입 정의

```typescript
// ✅ Good: Explicit types
const nodes: Node<ActivityNode>[] = [];
function updateNode(node: ActivityNode): void { ... }

// ✅ Good: Type inference when obvious
const count = nodes.length;  // number inferred

// ❌ Bad: Using 'any'
const data: any = fetchData();  // Avoid 'any'

// ✅ Good: Use specific types or 'unknown'
const data: ActivityNode[] = fetchData();
```

#### 함수 작성

```typescript
// ✅ Good: Arrow functions for callbacks
const handleClick = useCallback((node: ActivityNode) => {
  setSelectedNode(node);
}, []);

// ✅ Good: Named functions for complex logic
function calculateBottleneckScore(node: ActivityNode): number {
  // Complex calculation logic
  return score;
}

// ✅ Good: Early returns
function validateNode(node: ActivityNode): boolean {
  if (!node.label) return false;
  if (!node.department) return false;
  return true;
}
```

### React 스타일

#### 컴포넌트 구조

```typescript
// ✅ Good: Consistent component structure
export default function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  // 1. Hooks
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // 2. Derived state
  const isBottleneck = data.isBottleneck || false;
  const aiScore = data.aiScore || 0;
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, []);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Render
  return (
    <div ref={nodeRef}>
      {/* JSX */}
    </div>
  );
}
```

#### Props 정의

```typescript
// ✅ Good: Explicit interface
interface NodeDetailPanelProps {
  node: ActivityNode | null;
  onClose: () => void;
  onUpdate: (node: ActivityNode) => void;
  allTags: string[];
}

export default function NodeDetailPanel({ 
  node, 
  onClose, 
  onUpdate, 
  allTags 
}: NodeDetailPanelProps) {
  // Component logic
}
```

#### 조건부 렌더링

```typescript
// ✅ Good: Early return for null checks
if (!node) return null;

// ✅ Good: Ternary for simple conditions
{isBottleneck ? <AlertIcon /> : <CheckIcon />}

// ✅ Good: && for conditional rendering
{aiScore > 70 && <Badge>AI 대체 가능</Badge>}

// ❌ Bad: Nested ternaries
{isBottleneck ? (
  aiScore > 70 ? <A /> : <B />
) : (
  aiScore > 70 ? <C /> : <D />
)}
```

### CSS/Tailwind 스타일

#### 클래스 순서

```tsx
// ✅ Good: Logical grouping
<div className="
  flex items-center gap-2          // Layout
  px-4 py-2                        // Spacing
  bg-card border-2 border-primary  // Appearance
  rounded-sm shadow-lg             // Effects
  hover:scale-105 transition-all   // Interactions
">
```

#### 커스텀 클래스 사용

```tsx
// ✅ Good: Use custom classes for repeated patterns
<Card className="brutal-card">

// ❌ Bad: Repeating long class strings
<Card className="border-2 border-primary bg-card rounded-sm shadow-[4px_4px_0px_0px_rgba(0,212,255,0.3)]">
```

---

## 📝 커밋 컨벤션

FlowMatrix는 **Conventional Commits** 스펙을 따릅니다.

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 (Type)

| 타입 | 설명 | 예시 |
|-----|------|------|
| `feat` | 새로운 기능 추가 | `feat(canvas): add matrix view layout` |
| `fix` | 버그 수정 | `fix(node): resolve drag and drop issue` |
| `docs` | 문서 수정 | `docs(readme): update installation guide` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style(button): fix indentation` |
| `refactor` | 코드 리팩토링 | `refactor(workflow): simplify state management` |
| `perf` | 성능 개선 | `perf(canvas): optimize node rendering` |
| `test` | 테스트 추가/수정 | `test(node): add unit tests for WorkflowNode` |
| `chore` | 빌드/설정 변경 | `chore(deps): update dependencies` |

### 스코프 (Scope)

스코프는 변경 사항이 영향을 미치는 영역을 나타냅니다:

- `canvas`: 캔버스 관련
- `node`: 노드 컴포넌트
- `matrix`: 매트릭스 뷰
- `panel`: 상세 패널
- `tag`: 태그 자동완성
- `ui`: UI 컴포넌트
- `types`: 타입 정의
- `deps`: 의존성

### 예시

#### 좋은 커밋 메시지

```
feat(canvas): add drag and drop node creation

- Implement DraggableNodeType component
- Add onDrop handler to WorkflowCanvas
- Update left sidebar with draggable node cards

Closes #42
```

```
fix(node): resolve bottleneck animation flickering

The pulse animation was causing performance issues
when multiple bottleneck nodes were present.
Optimized by using CSS animation instead of JS.

Fixes #58
```

```
docs(contributing): add code style guide

- Add TypeScript naming conventions
- Add React component structure guidelines
- Add Tailwind CSS best practices
```

#### 나쁜 커밋 메시지

```
❌ update code
❌ fix bug
❌ WIP
❌ asdfasdf
```

---

## 🔀 풀 리퀘스트 가이드

### PR 제목

PR 제목은 커밋 메시지와 동일한 형식을 따릅니다:

```
feat(canvas): add matrix view layout
fix(node): resolve drag and drop issue
docs(readme): update installation guide
```

### PR 설명 템플릿

```markdown
## 변경 사항 요약
<!-- 이 PR에서 무엇을 변경했는지 간단히 설명 -->

## 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->

## 변경 내용
<!-- 구체적인 변경 사항을 나열 -->
- [ ] 기능 A 추가
- [ ] 버그 B 수정
- [ ] 문서 C 업데이트

## 스크린샷 (해당되는 경우)
<!-- UI 변경이 있다면 스크린샷 첨부 -->

## 테스트 방법
<!-- 이 변경사항을 어떻게 테스트할 수 있는지 설명 -->
1. 개발 서버 실행
2. X 페이지로 이동
3. Y 버튼 클릭
4. Z 결과 확인

## 체크리스트
- [ ] 코드 스타일 가이드를 준수했습니다
- [ ] 타입 검사를 통과했습니다 (`pnpm check`)
- [ ] 테스트를 작성했습니다
- [ ] 문서를 업데이트했습니다
- [ ] 커밋 메시지가 컨벤션을 따릅니다

## 관련 이슈
Closes #이슈번호
```

### PR 리뷰 프로세스

1. **자동 검사**: CI/CD가 자동으로 빌드 및 테스트 실행
2. **코드 리뷰**: 최소 1명의 리뷰어 승인 필요
3. **변경 요청**: 리뷰어가 변경을 요청하면 수정 후 재요청
4. **머지**: 모든 검사 통과 및 승인 후 머지

---

## 🐛 이슈 제출

### 버그 리포트

```markdown
## 버그 설명
<!-- 버그가 무엇인지 명확하고 간결하게 설명 -->

## 재현 방법
1. '...'로 이동
2. '...'를 클릭
3. '...'까지 스크롤
4. 에러 발생

## 예상 동작
<!-- 어떻게 동작해야 하는지 설명 -->

## 실제 동작
<!-- 실제로 어떻게 동작하는지 설명 -->

## 스크린샷
<!-- 가능하다면 스크린샷 첨부 -->

## 환경
- OS: [예: macOS 13.0]
- 브라우저: [예: Chrome 120]
- Node.js 버전: [예: 18.17.0]
- pnpm 버전: [예: 8.10.0]

## 추가 정보
<!-- 기타 관련 정보 -->
```

### 기능 요청

```markdown
## 기능 설명
<!-- 원하는 기능을 명확하게 설명 -->

## 문제점
<!-- 현재 어떤 문제가 있는지 설명 -->

## 제안하는 해결책
<!-- 이 기능이 어떻게 문제를 해결하는지 설명 -->

## 대안
<!-- 고려한 다른 대안이 있다면 설명 -->

## 추가 정보
<!-- 기타 관련 정보 -->
```

---

## 🧪 테스트 작성

### 단위 테스트

```typescript
// client/src/components/__tests__/WorkflowNode.test.tsx
import { render, screen } from "@testing-library/react";
import WorkflowNode from "../WorkflowNode";

describe("WorkflowNode", () => {
  const mockData: ActivityNode = {
    id: "test-1",
    type: "ACTION",
    label: "Test Node",
    stage: "DEVELOPMENT",
    department: "SW_TEAM",
    attributes: {
      tool: ["Figma"],
      avg_time: "2h",
      is_repetitive: false,
      brain_usage: "MEDIUM",
    },
    ontology_tags: ["#테스트"],
    position: { x: 0, y: 0 },
  };

  it("should render node with correct label", () => {
    render(<WorkflowNode data={mockData} />);
    expect(screen.getByText("Test Node")).toBeInTheDocument();
  });

  it("should display AI score badge when score > 70", () => {
    const dataWithAI = { ...mockData, aiScore: 85 };
    render(<WorkflowNode data={dataWithAI} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });
});
```

### 통합 테스트

```typescript
// client/src/pages/__tests__/WorkflowCanvas.test.tsx
import { render, fireEvent, screen } from "@testing-library/react";
import WorkflowCanvas from "../WorkflowCanvas";

describe("WorkflowCanvas", () => {
  it("should create node when add button clicked", () => {
    render(<WorkflowCanvas />);
    
    const addButton = screen.getByText("노드 추가");
    fireEvent.click(addButton);
    
    expect(screen.getByText("새 작업")).toBeInTheDocument();
  });
});
```

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 특정 파일 테스트
pnpm test WorkflowNode

# 커버리지 확인
pnpm test:coverage
```

---

## 📚 추가 리소스

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React Flow 문서](https://reactflow.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 💬 질문이 있으신가요?

- **이슈**: [GitHub Issues](https://github.com/OWNER/flowmatrix-review/issues)
- **토론**: [GitHub Discussions](https://github.com/OWNER/flowmatrix-review/discussions)

---

**감사합니다!** 🎉

여러분의 기여가 FlowMatrix를 더 나은 제품으로 만듭니다.
