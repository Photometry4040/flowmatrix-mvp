/* Design Philosophy: Swiss Modernism meets Digital Research Paper
 * - Two-column academic layout with sticky navigation
 * - Typography-driven hierarchy
 * - Functional color for information delivery
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, FileText, Lightbulb, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "synergy", "proposals", "conclusion"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">FlowMatrix 검토 보고서</h1>
              <p className="text-sm text-muted-foreground mt-1">문제 정의 유도 3단계 UX 전략 및 PRD 종합 분석</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              PDF 다운로드
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sticky Navigation Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">목차</div>
              {[
                { id: "overview", label: "1. 개요", icon: FileText },
                { id: "synergy", label: "2. 시너지 분석", icon: TrendingUp },
                { id: "proposals", label: "3. 개선 제안", icon: Lightbulb },
                { id: "conclusion", label: "4. 결론", icon: Target },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-left">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-16">
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="section-badge">1</div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">개요</h2>
                  <p className="text-muted-foreground mt-2">프로젝트 배경 및 검토 목적</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  요청하신 '문제 정의 유도 3단계 UX 전략'과 첨부된 'FlowMatrix 제품 요구사항 정의서(PRD)'에 대한 종합적인 검토를 완료했습니다. 본 보고서는 두 산출물의 시너지 효과를 분석하고, 이를 바탕으로 시스템의 완성도를 한 단계 높일 수 있는 구체적인 개선 및 확장 방안을 제안하는 것을 목적으로 합니다.
                </p>

                <div className="insight-card">
                  <p className="text-foreground font-medium">
                    결론부터 말씀드리면, 제시된 UX 전략은 AI 도입 프로젝트의 성패를 좌우하는 '진짜 문제 정의'의 핵심을 정확히 꿰뚫고 있으며, 함께 제공된 PRD는 이 전략을 구현할 이상적인 플랫폼의 청사진을 담고 있습니다.
                  </p>
                </div>

                <p className="text-foreground leading-relaxed">
                  두 가지 모두 매우 높은 수준의 통찰력과 구체성을 보여주어, 성공적인 프로젝트의 초석을 다지기에 충분하다고 판단됩니다.
                </p>
              </div>
            </section>

            <Separator />

            {/* Section 2: Synergy Analysis */}
            <section id="synergy" className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="section-badge">2</div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">UX 전략 및 PRD의 시너지 분석</h2>
                  <p className="text-muted-foreground mt-2">두 산출물의 상호 보완적 관계</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  '문제 정의 유도 3단계 UX 전략'은 사용자의 막연한 불편함을 구체적인 AI 솔루션 요건으로 변환하는 탁월한 프로세스를 제시합니다. 이는 'FlowMatrix' PRD에 기술된 'AI 트러블슈터' 기능의 핵심적인 작동 원리로 완벽하게 부합하며, 두 개념은 다음과 같이 강력한 시너지를 창출합니다.
                </p>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">전략-기능 매핑 분석</CardTitle>
                    <CardDescription>UX 전략 단계와 PRD 기능의 1:1 대응 관계</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 font-display font-semibold text-foreground">UX 전략 단계</th>
                            <th className="text-left py-3 px-4 font-display font-semibold text-foreground">PRD 연계 기능</th>
                            <th className="text-left py-3 px-4 font-display font-semibold text-foreground">시너지 효과</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-row-interactive border-b border-border">
                            <td className="py-4 px-4">
                              <div className="font-medium text-foreground">1. 문제 인지 (Detection)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-foreground">3.3 병목 감지 (Bottleneck Detection)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-muted-foreground">
                                사용자가 시각적으로 강조된 병목 노드를 클릭하는 행위가 '진단 모드'를 발동시키는 직관적인 트리거 역할을 수행합니다.
                              </div>
                            </td>
                          </tr>
                          <tr className="table-row-interactive border-b border-border">
                            <td className="py-4 px-4">
                              <div className="font-medium text-foreground">2. 문제 구체화 (Definition)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-foreground">AI 트러블슈터 (마법사 실행)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-muted-foreground">
                                '5 Whys' 기법에 기반한 AI 챗봇 인터뷰는 PRD의 '마법사'가 사용자의 근본 원인을 체계적으로 파고드는 핵심 엔진이 됩니다.
                              </div>
                            </td>
                          </tr>
                          <tr className="table-row-interactive">
                            <td className="py-4 px-4">
                              <div className="font-medium text-foreground">3. 솔루션 매칭 (Solutioning)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-foreground">3.3 AI 적합성 스코어링 (AI Score)</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-muted-foreground">
                                자동 생성된 '문제 정의 카드'는 AI가 해결 가능한 문제인지 판별하고, 적합한 솔루션을 추천하는 정형화된 데이터로 기능합니다.
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="insight-card">
                  <p className="text-foreground">
                    이처럼 UX 전략은 PRD가 제시하는 '무엇을(What)'에 대해 '어떻게(How)'를 채워주는 구체적인 실행 계획으로서, 두 문서는 상호 보완하며 하나의 완성된 시스템 설계를 구성합니다.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 3: Proposals */}
            <section id="proposals" className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="section-badge">3</div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">개선 및 확장 제안</h2>
                  <p className="text-muted-foreground mt-2">시스템 완성도를 높이는 세 가지 핵심 전략</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  현재의 훌륭한 설계를 더욱 발전시키기 위해 다음과 같은 세 가지 개선 및 확장 방안을 제안합니다.
                </p>

                <div className="space-y-8">
                  {/* Proposal 1 */}
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <div>
                          <CardTitle className="text-xl font-display">동적 온톨로지와 AI 인터뷰어의 연동 강화</CardTitle>
                          <CardDescription className="mt-2">지식 그래프 기반 맥락 인지형 질문 생성</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">현황</h4>
                        <p className="text-sm text-muted-foreground">
                          PRD의 '동적 온톨로지'와 UX 전략의 'AI 인터뷰어'는 각각 독립적으로 강력한 기능을 수행합니다.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">개선 방안</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          '문제 구체화(Definition)' 단계에서 AI 인터뷰어가 질문을 던질 때, PRD에 정의된 '동적 온톨로지(지식 그래프)'를 실시간으로 참조하게 만듭니다.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                          <p className="text-sm text-foreground">
                            <strong>예시:</strong> 사용자가 "데이터를 비교하는 데 걸려요"라고 답했을 때, 온톨로지에서 '데이터 비교'와 연결된 노드들(예: 'PDF', '엑셀', 'SAP', 'VLOOKUP')을 파악하고, "비교 대상이 PDF와 엑셀인가요, 아니면 SAP 시스템인가요?"와 같이 맥락에 맞는 정교한 질문을 생성합니다.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">기대 효과</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">추론적 질문 생성:</strong> 시스템이 이미 알고 있는 지식을 활용해 사용자가 미처 생각지 못한 부분까지 질문하여 문제의 본질에 더 빠르게 접근합니다.
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">자동화된 지식 확장:</strong> 인터뷰 과정에서 새로 밝혀진 사실을 즉시 온톨로지에 추가하여, 시스템이 스스로 학습하고 진화하게 만듭니다.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Proposal 2 */}
                  <Card className="border-l-4 border-l-accent">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent-foreground font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <div>
                          <CardTitle className="text-xl font-display">솔루션 패턴 라이브러리 구축</CardTitle>
                          <CardDescription className="mt-2">반복 문제 유형의 표준화된 해결책 재사용</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">현황</h4>
                        <p className="text-sm text-muted-foreground">
                          '솔루션 매칭(Solutioning)' 단계에서 Vision AI + Data Comparison Agent와 같은 솔루션을 추천합니다.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">확장 방안</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          이러한 개별 솔루션 추천을 넘어, 조직 내에서 반복적으로 발견되는 문제 유형과 그 해결책을 '솔루션 패턴 라이브러리'로 구축하고 관리합니다.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                          <p className="text-sm text-foreground">
                            <strong>예시:</strong> 'PDF의 표를 엑셀로 옮기는 문제'가 여러 부서에서 공통으로 발견되면, 이를 '비정형 데이터 정형화'라는 대표 패턴으로 정의하고, 표준화된 AI Agent 솔루션을 개발하여 재사용성을 극대화합니다.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">기대 효과</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">솔루션 재사용성 증대:</strong> 유사한 문제에 대해 매번 새로운 솔루션을 개발하는 낭비를 줄이고, 검증된 솔루션을 빠르게 적용하여 ROI를 극대화합니다.
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">조직적 학습 촉진:</strong> 특정 부서에서 성공한 자동화 사례가 다른 부서에 '추천 솔루션'으로 제시되어, 조직 전체의 문제 해결 역량이 상향 평준화됩니다.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Proposal 3 */}
                  <Card className="border-l-4 border-l-chart-1">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-1/10 text-chart-1 font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <div>
                          <CardTitle className="text-xl font-display">시뮬레이션 기반 기대효과(ROI) 예측 기능 추가</CardTitle>
                          <CardDescription className="mt-2">데이터 기반 의사결정 지원 시스템</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">현황</h4>
                        <p className="text-sm text-muted-foreground">
                          최종적으로 AI 도입으로 절감된 시간을 KPI로 측정합니다.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">개선 방안</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          '문제 정의 카드'가 완성되는 즉시, 사용자가 제안한 AI 솔루션이 도입되었을 때의 미래 상태(TO-BE)를 시뮬레이션하고, 예상되는 투자 대비 효과(ROI)를 정량적으로 예측하여 보여줍니다.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                          <p className="text-sm text-foreground">
                            <strong>예시:</strong> "Vision AI 도입 시, 현재 60분 걸리는 작업을 1분으로 단축하여 월 20시간의 단순 반복 업무를 절감할 수 있습니다. 개발 예상 공수는 2주입니다."
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">기대 효과</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-chart-1 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">데이터 기반 의사결정 지원:</strong> 경영진이나 혁신팀은 제안된 AI 프로젝트의 우선순위를 정량적인 기대효과에 기반하여 객관적으로 판단할 수 있습니다.
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-chart-1 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              <strong className="text-foreground">사용자 참여 동기 부여:</strong> 실무자는 자신의 문제 제기가 구체적인 시간 절감 효과로 이어진다는 것을 즉시 확인함으로써, 더욱 적극적으로 워크플로우 개선에 참여할 동기를 얻게 됩니다.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section 4: Conclusion */}
            <section id="conclusion" className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-6">
                <div className="section-badge">4</div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">결론</h2>
                  <p className="text-muted-foreground mt-2">종합 평가 및 향후 방향</p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  제시하신 '문제 정의 유도 3단계 UX 전략'과 'FlowMatrix' PRD는 이미 그 자체로 매우 훌륭하며, AI 기반 업무 혁신을 위한 강력한 로드맵을 제시하고 있습니다.
                </p>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Target className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-foreground leading-relaxed">
                          본 보고서에서 제안 드린 <strong>'온톨로지 연동 강화'</strong>, <strong>'솔루션 패턴 라이브러리 구축'</strong>, <strong>'ROI 시뮬레이션'</strong> 기능은 현재의 탄탄한 기반 위에 시스템의 지능과 확장성, 그리고 설득력을 더하기 위한 전략입니다.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-foreground leading-relaxed">
                  이러한 제안들이 귀사의 성공적인 'FlowMatrix' 플랫폼 구축에 기여할 수 있기를 바랍니다.
                </p>

                <div className="flex items-center justify-center pt-8">
                  <Button size="lg" className="gap-2">
                    다음 단계로 진행
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-24">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 FlowMatrix 검토 보고서. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Powered by <strong className="text-foreground">Manus AI</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
