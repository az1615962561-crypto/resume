import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectAsset as asset, publicAsset } from './assets'
import { capabilities, experiences, metrics, projects } from './content'
import './App.css'

const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

gsap.registerPlugin(useGSAP, ScrollTrigger)

const questions = [
  {
    question: '你做过最复杂的 AI 产品是什么？',
    answer:
      '尤里卡 AI Agent 中台。它覆盖模型接入、应用编排、知识库、资源治理、调试发布与企业级网关，并在 10+ 业务产线中持续复用。',
  },
  {
    question: '你为什么强调 Vibe Coding？',
    answer:
      '因为产品判断需要尽快进入真实反馈。Vibe Coding 让我能把流程、Prompt 和交互直接做成可操作版本，而不是停留在 PRD。',
  },
  {
    question: '你如何在自研和开源之间取舍？',
    answer:
      '先明确真正形成差异化的部分。编排能力选择融合成熟开源方案，把研发资源留给企业治理、资产沉淀和业务适配。',
  },
]

const principles = [
  {
    index: '01 / 03',
    title: '能复用，就不重复建设。',
    text: '平台价值不来自功能数量，而来自公共能力能否被不同团队反复调用，并持续降低下一次交付成本。',
    label: 'PLATFORM THINKING',
  },
  {
    index: '02 / 03',
    title: '先做最短反馈链。',
    text: '在复杂系统真正投入建设前，先用原型和代码验证用户动作、输入质量与结果是否值得继续放大。',
    label: 'VIBE CODING',
  },
  {
    index: '03 / 03',
    title: '规模化之前先可观测。',
    text: '当 AI 流量变大，容量、成本、安全和质量必须分别看见，否则所谓增长只是更大的黑盒。',
    label: 'AI GOVERNANCE',
  },
]

const experienceImages = [
  'eureka-orchestration.png',
  'gateway-observability.png',
  'ai-studio-home.png',
]

function DotLink({ children }: { children: React.ReactNode }) {
  return (
    <>
      <i className="dot" />
      <span>{children}</span>
      <b aria-hidden="true">↗</b>
    </>
  )
}

function Curtains({ className = '' }: { className?: string }) {
  return (
    <div className={`curtains ${className}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  )
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)

  useEffect(() => {
    if (!menuOpen && !askOpen) return

    const previousOverflow = document.body.style.overflow
    const closePanels = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setAskOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closePanels)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closePanels)
    }
  }, [askOpen, menuOpen])

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add(
        {
          desktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean
            reduceMotion: boolean
          }

          if (reduceMotion) {
            gsap.set('[data-reveal], .hero-copy, .scene-loading', { clearProps: 'all' })
            return
          }

          gsap
            .timeline({ defaults: { duration: 0.65, ease: 'power2.out' } })
            .from('.site-header', { autoAlpha: 0, y: -18 })
            .from('.hero-copy > *', { autoAlpha: 0, yPercent: 70, stagger: 0.09 }, '-=.2')
            .from('.scene-loading', { autoAlpha: 0 }, '<')

          gsap
            .timeline({
              scrollTrigger: {
                trigger: '#hero-trigger',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            })
            .to('.hero-copy', { autoAlpha: 0, yPercent: -35, duration: 0.32 }, 0.34)
            .to(
              '.hero-curtains i',
              {
                scaleY: 1,
                duration: 0.3,
                stagger: { each: 0.035, from: 'start' },
                ease: 'power2.inOut',
              },
              0.68,
            )

          ScrollTrigger.batch('[data-reveal]', {
            start: 'top 88%',
            once: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { autoAlpha: 0, y: 44 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.72,
                  stagger: 0.07,
                  ease: 'power2.out',
                },
              ),
          })

          if (desktop) {
            gsap.from('.portfolio-item', {
              autoAlpha: 0,
              yPercent: 18,
              stagger: 0.06,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.portfolio-grid',
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            })

            gsap.from('.capability-card > *', {
              autoAlpha: 0,
              x: 90,
              stagger: 0.035,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.capability-grid',
                start: 'top 78%',
                toggleActions: 'play none none reverse',
              },
            })
          }

          const impactTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: '#impact-track',
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          })

          impactTimeline
            .to(
              '.impact-start-curtains i',
              {
                scaleY: 0,
                duration: 0.13,
                stagger: { each: 0.012, from: 'end' },
                ease: 'none',
              },
              0,
            )
            .fromTo(
              '.impact-copy > *',
              { autoAlpha: 0, yPercent: 90 },
              { autoAlpha: 1, yPercent: 0, duration: 0.13, stagger: 0.02 },
              0.1,
            )
            .fromTo(
              '.impact-metrics > *',
              { autoAlpha: 0, yPercent: 70 },
              { autoAlpha: 1, yPercent: 0, duration: 0.13, stagger: 0.018 },
              0.16,
            )
            .to('.impact-copy, .impact-metrics', { autoAlpha: 0, duration: 0.08 }, 0.78)
            .to(
              '.impact-end-curtains i',
              {
                scaleY: 1,
                duration: 0.13,
                stagger: { each: 0.012, from: 'start' },
                ease: 'none',
              },
              0.86,
            )

          if (desktop) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: '.showreel-track',
                  start: 'top top',
                  end: 'bottom bottom',
                  scrub: true,
                },
              })
              .to('.showreel-wrap', { width: '100%', borderWidth: 0, duration: 1 }, 0)
              .to('.showreel-padding', { padding: 0, borderWidth: 0, duration: 1 }, 0)
          }
        },
      )

      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      return () => {
        window.removeEventListener('load', refresh)
        media.revert()
      }
    },
    { scope: root },
  )

  return (
    <div className="site-shell" ref={root}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="返回首页">
          ZHANG
          <span>• ZIJIAN</span>
        </a>
        <button
          aria-controls="ask-panel"
          aria-expanded={askOpen}
          className="ask-trigger"
          type="button"
          onClick={() => setAskOpen(true)}
        >
          <span>Ask about my work</span>
          <i>⌁</i>
        </button>
        <button
          aria-controls="menu-panel"
          aria-expanded={menuOpen}
          className="menu-trigger"
          type="button"
          onClick={() => setMenuOpen(true)}
        >
          <span>＋</span> MENU
        </button>
      </header>

      <div
        aria-hidden={!menuOpen}
        aria-label="网站导航"
        aria-modal="true"
        className={`menu-panel ${menuOpen ? 'is-open' : ''}`}
        id="menu-panel"
        role="dialog"
      >
        <button type="button" onClick={() => setMenuOpen(false)}>CLOSE ×</button>
        <nav>
          <a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a>
          <a href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div>
          <span>AI PRODUCT / HANGZHOU</span>
          <span>NEVER STOP BUILDING™</span>
        </div>
      </div>

      <div
        aria-hidden={!askOpen}
        aria-label="关于张子健的工作问答"
        aria-modal="true"
        className={`ask-panel ${askOpen ? 'is-open' : ''}`}
        id="ask-panel"
        role="dialog"
      >
        <div className="ask-panel-bar">
          <span>ASK_ZIJIAN.AI / LOCAL PROFILE</span>
          <button type="button" onClick={() => setAskOpen(false)}>CLOSE ×</button>
        </div>
        <div className="ask-answer">
          <span>ANSWER / 0{questionIndex + 1}</span>
          <p>{questions[questionIndex].answer}</p>
        </div>
        <div className="ask-questions">
          {questions.map((item, index) => (
            <button
              className={questionIndex === index ? 'is-active' : ''}
              key={item.question}
              onClick={() => setQuestionIndex(index)}
              type="button"
            >
              <span>{item.question}</span><i>↗</i>
            </button>
          ))}
        </div>
      </div>

      <main>
        <section className="hero-trigger" id="hero-trigger">
          <div className="hero-stage" id="top">
            <Suspense fallback={<div className="scene-loading">LOADING SCENE</div>}>
              <HeroScene />
            </Suspense>
            <div className="hero-copy">
              <h1>AI 产品经理，专注把复杂模型能力变成可用、可治理、可增长的产品。</h1>
              <p>NEVER STOP BUILDING™</p>
            </div>
            <span className="hero-coordinate">30.2741° N / 120.1551° E</span>
            <Curtains className="hero-curtains" />
          </div>
        </section>

        <div className="light-page">
          <section className="selected-works" id="work">
            <div className="grid-container">
              <div className="section-spacer"><i /></div>
              <div className="section-header" data-reveal>
                <i className="dot" />
                <h2>Selected works</h2>
                <span>{projects.length}</span>
              </div>
              <div className="portfolio-grid">
                {projects.map((project) => (
                  <a
                    className={`portfolio-item ${project.featured ? 'is-wide' : ''}`}
                    href="#impact-track"
                    key={project.id}
                    aria-label={`查看 ${project.title} 项目成果`}
                  >
                    <div>
                      <img
                        src={asset(project.image)}
                        alt={`${project.title}产品界面`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span>{project.title}</span>
                    <small>{project.result}</small>
                  </a>
                ))}
              </div>
              <div className="section-tail">
                <a href="#impact-track"><DotLink>View project outcomes</DotLink></a>
              </div>
            </div>
          </section>

          <section className="intro-section">
            <div className="grid-container">
              <div className="intro-grid">
                <div data-reveal>
                  <h2>
                    我把产品判断、系统设计和快速构建，放在同一条链路里。
                  </h2>
                </div>
                <div data-reveal>
                  <p>
                    我的工作横跨 Agent 平台、AI 网关、模型训练工具和业务 AI 产品。先找到值得解决的问题，再决定应该自研、复用还是用代码快速验证。
                  </p>
                  <a href="#about"><DotLink>About my experience</DotLink></a>
                </div>
              </div>

              <div className="capability-grid" id="capabilities">
                {capabilities.map((capability) => (
                  <article className="capability-card" key={capability.number}>
                    <span>{capability.number}</span>
                    <div>
                      <h3>{capability.title}</h3>
                      <p>{capability.description}</p>
                    </div>
                    <ul>
                      {capability.items.map((item) => (
                        <li key={item}>
                          <span>{item}</span>
                          <i aria-hidden="true" />
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="section-spacer bottom"><i /></div>
            </div>
          </section>
        </div>

        <section className="impact-track" id="impact-track">
          <div className="impact-stage">
            <Suspense fallback={null}>
              <HeroScene mode="impact" triggerId="impact-track" />
            </Suspense>
            <Curtains className="impact-start-curtains" />
            <div className="impact-copy">
              <span>AI PRODUCT SYSTEMS</span>
              <h2>结果不是功能清单。<br />结果是系统真的进入业务。</h2>
              <p>从中台复用、流量治理到具体工作流，我用可量化结果判断产品是否成立。</p>
            </div>
            <div className="impact-metrics">
              <h3>Selected outcomes</h3>
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
              <a href="#showreel"><DotLink>See product evidence</DotLink></a>
            </div>
            <Curtains className="impact-end-curtains" />
          </div>
        </section>

        <div className="light-page evidence-page">
          <section className="principles-section">
            <div className="grid-container">
              <div className="section-spacer"><i /></div>
              <div className="section-header" data-reveal>
                <i className="dot" />
                <h2>The decisions behind the results</h2>
              </div>
              <div className="principles-grid">
                {principles.map((principle) => (
                  <article key={principle.index} data-reveal>
                    <div>
                      <span>{principle.index}</span>
                      <span>● ● ● ● ●</span>
                    </div>
                    <blockquote>
                      <b>“</b>
                      <h3>{principle.title}</h3>
                      <p>{principle.text}<i /></p>
                    </blockquote>
                    <footer>
                      <span>ZHANG ZIJIAN</span>
                      <small>{principle.label}</small>
                    </footer>
                  </article>
                ))}
              </div>
              <div className="section-spacer bottom"><i /></div>
            </div>
          </section>

          <section className="showreel-track" id="showreel">
            <div className="showreel-stage grid-container">
              <div className="showreel-wrap">
                <div className="showreel-padding">
                  <div className="showreel-media">
                    {projects.slice(0, 4).map((project, index) => (
                      <img
                        style={{ '--delay': `${index * 3.2}s` } as React.CSSProperties}
                        src={asset(project.image)}
                        alt=""
                        key={project.id}
                        loading="lazy"
                      />
                    ))}
                    <span>PRODUCT SYSTEMS / 2023—2026</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="experience-section" id="about">
            <div className="grid-container">
              <div className="section-header" data-reveal>
                <i className="dot" />
                <h2>Experience</h2>
              </div>
              <div className="experience-cards">
                {experiences.map((experience, index) => (
                  <article key={experience.time} data-reveal>
                    <div className="experience-image">
                      <img
                        src={asset(experienceImages[index])}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                    <div className="experience-body">
                      <time>{experience.time}</time>
                      <div><span>{experience.code}</span></div>
                      <h3>{experience.role}</h3>
                      <h4>{experience.company}</h4>
                      <p>{experience.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="contact-section" id="contact">
          <div className="contact-grid">
            <div className="contact-image">
              <img src={publicAsset('portrait.png')} alt="张子健个人肖像" />
            </div>
            <div className="contact-copy">
              <span>READY TO START SOMETHING?</span>
              <h2>有复杂的 AI 产品问题？<br />我们聊聊。</h2>
              <a href="mailto:1615962561@qq.com">1615962561@qq.com ↗</a>
              <div>
                <span>HANGZHOU, CHINA</span>
                <a href="https://github.com/az1615962561-crypto" target="_blank" rel="noreferrer">
                  GITHUB ↗
                </a>
                <a href="#top">BACK TO TOP ↑</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
