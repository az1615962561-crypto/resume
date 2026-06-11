import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  capabilities,
  experiences,
  impactSlides,
  metrics,
  projects,
  type ProjectCategory,
} from './content'
import { HeroScene } from './HeroScene'
import './App.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const filters: Array<'ALL' | ProjectCategory> = ['ALL', 'PLATFORM', 'GOVERNANCE', 'BUSINESS AI']
const asset = (name: string) => `${import.meta.env.BASE_URL}projects/${name}`

function App() {
  const root = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]>('ALL')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: '(min-width: 900px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean
            reduceMotion: boolean
          }

          if (reduceMotion) {
            gsap.set('[data-animate], .impact-slide', { clearProps: 'all' })
            return
          }

          gsap
            .timeline({ defaults: { ease: 'power3.out' } })
            .from('.hero-kicker', { autoAlpha: 0, y: 18, duration: 0.6 })
            .from('.hero-title-line', { yPercent: 115, duration: 1.05, stagger: 0.08 }, '-=.25')
            .from('.hero-deck, .hero-actions', { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.1 }, '-=.55')
            .from('.visual-window', { autoAlpha: 0, scale: 0.86, duration: 1, stagger: 0.12 }, '-=.9')

          if (desktop) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: '.hero',
                  start: 'top top',
                  end: '+=150%',
                  pin: '.hero-inner',
                  scrub: 0.8,
                },
              })
              .to('.hero-copy', { yPercent: -18, autoAlpha: 0.08, ease: 'none' }, 0)
              .to('.signal-orb', { scale: 1.35, rotation: 36, ease: 'none' }, 0)
              .to('.visual-window-a', { xPercent: -32, yPercent: -18, rotation: -10, ease: 'none' }, 0)
              .to('.visual-window-b', { xPercent: 26, yPercent: -24, rotation: 8, ease: 'none' }, 0)
              .to('.visual-window-c', { xPercent: 18, yPercent: 28, rotation: 5, ease: 'none' }, 0)
              .to('.hero-visual', { scale: 1.08, ease: 'none' }, 0)
          }

          ScrollTrigger.batch('[data-reveal]', {
            start: 'top 88%',
            once: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { autoAlpha: 0, y: 42 },
                { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out' },
              ),
          })

          gsap.fromTo(
            '.manifesto-line',
            { yPercent: 105 },
            {
              yPercent: 0,
              stagger: 0.08,
              ease: 'none',
              scrollTrigger: {
                trigger: '.manifesto',
                start: 'top 78%',
                end: 'bottom 48%',
                scrub: 0.7,
              },
            },
          )

          if (desktop) {
            const impactTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: '.impact',
                start: 'top top',
                end: `+=${impactSlides.length * 100}%`,
                pin: '.impact-stage',
                scrub: 0.8,
              },
            })

            gsap.set('.impact-slide', { autoAlpha: 0 })
            gsap.set('.impact-slide:first-child', { autoAlpha: 1 })

            impactSlides.forEach((_, index) => {
              if (index === 0) return
              impactTimeline
                .to(`.impact-slide:nth-child(${index})`, { autoAlpha: 0, yPercent: -8, duration: 0.35 })
                .fromTo(
                  `.impact-slide:nth-child(${index + 1})`,
                  { autoAlpha: 0, yPercent: 12 },
                  { autoAlpha: 1, yPercent: 0, duration: 0.35 },
                  '<',
                )
                .to(
                  '.impact-image-track',
                  { yPercent: -index * (100 / impactSlides.length), duration: 0.7, ease: 'power2.inOut' },
                  '<',
                )
            })
          }

          gsap.fromTo(
            '.showcase-frame',
            { width: desktop ? '74%' : '100%', borderRadius: desktop ? 28 : 0 },
            {
              width: '100%',
              borderRadius: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: '.showcase',
                start: 'top 72%',
                end: 'center 48%',
                scrub: 0.7,
              },
            },
          )
        },
      )

      const refresh = () => {
        ScrollTrigger.refresh()
        const target = document.getElementById(window.location.hash.slice(1))
        target?.scrollIntoView()
      }
      let refreshFrame = 0

      if (document.readyState === 'complete') {
        refreshFrame = window.requestAnimationFrame(refresh)
      } else {
        window.addEventListener('load', refresh)
      }

      return () => {
        window.removeEventListener('load', refresh)
        window.cancelAnimationFrame(refreshFrame)
        mm.revert()
      }
    },
    { scope: root },
  )

  useEffect(() => {
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => window.cancelAnimationFrame(refreshFrame)
  }, [filter])

  const handlePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--mouse-x', `${x * 28}px`)
    event.currentTarget.style.setProperty('--mouse-y', `${y * 28}px`)
    event.currentTarget.style.setProperty('--mouse-x-reverse', `${x * -18}px`)
    event.currentTarget.style.setProperty('--mouse-y-reverse', `${y * -18}px`)
  }

  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--mouse-x', '0px')
    event.currentTarget.style.setProperty('--mouse-y', '0px')
    event.currentTarget.style.setProperty('--mouse-x-reverse', '0px')
    event.currentTarget.style.setProperty('--mouse-y-reverse', '0px')
  }

  const visibleProjects = filter === 'ALL' ? projects : projects.filter((project) => project.category === filter)

  return (
    <div className="site-shell" ref={root}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="返回首页">
          ZZ<span>®</span>
        </a>
        <nav aria-label="主导航">
          <a href="#work">Works</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#about">About</a>
        </nav>
        <a className="header-cta" href="#contact">
          <span className="header-cta-long">Start a conversation</span>
          <span className="header-cta-short">Contact</span>
          <i>↗</i>
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-kicker">AI PRODUCT MANAGER / VIBE CODER / HANGZHOU</p>
              <h1>
                <span className="line-mask">
                  <span className="hero-title-line">把复杂 AI，</span>
                </span>
                <span className="line-mask">
                  <span className="hero-title-line">做成<span className="accent-word">可用产品</span>。</span>
                </span>
              </h1>
              <p className="hero-deck">
                我是张子健。我在产品、AI 系统与代码之间工作，把不清晰的业务问题推进到可运行、可衡量、可复用。
              </p>
              <div className="hero-actions">
                <a href="#work">Selected work <span>↓</span></a>
                <a href="mailto:1615962561@qq.com">Email me <span>↗</span></a>
              </div>
            </div>

            <div
              className="hero-visual"
              onPointerMove={handlePointer}
              onPointerLeave={resetPointer}
              aria-label="由真实项目界面组成的交互式 AI 产品系统视觉"
            >
              <HeroScene />
              <div className="hero-grid" />
              <figure className="visual-window visual-window-a">
                <img src={asset('eureka-orchestration.png')} alt="" decoding="async" fetchPriority="high" />
                <figcaption>AGENT ORCHESTRATION</figcaption>
              </figure>
              <figure className="visual-window visual-window-b">
                <img src={asset('gateway-observability.png')} alt="" decoding="async" fetchPriority="high" />
                <figcaption>AI GATEWAY</figcaption>
              </figure>
              <figure className="visual-window visual-window-c">
                <img src={asset('ai-studio-script.png')} alt="" decoding="async" fetchPriority="high" />
                <figcaption>BUSINESS AI</figcaption>
              </figure>
              <div className="signal-orb">
                <span>PRODUCT</span>
                <strong>× AI</strong>
                <small>BUILD / TEST / LEARN</small>
              </div>
              <div className="hero-visual-label">
                <span>LIVE SYSTEM / 001</span>
                <span>MOVE POINTER</span>
              </div>
            </div>

            <div className="hero-foot">
              <span>AVAILABLE FOR AI PRODUCT OPPORTUNITIES</span>
              <span>SCROLL TO EXPLORE</span>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="关键项目成果">
          <p>REAL SYSTEMS.<br />MEASURABLE OUTCOMES.</p>
          <div>
            {metrics.map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.note}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="manifesto">
          <p className="section-code">01 / POINT OF VIEW</p>
          <div className="manifesto-copy">
            <div className="line-mask"><span className="manifesto-line">简历说明我做过什么。</span></div>
            <div className="line-mask"><span className="manifesto-line">作品说明我如何判断。</span></div>
            <div className="line-mask"><span className="manifesto-line accent-line">代码证明我能把它做出来。</span></div>
          </div>
        </section>

        <section className="works" id="work">
          <div className="section-intro" data-reveal>
            <p className="section-code">02 / SELECTED WORKS / 2023—2026</p>
            <h2>真实项目，而不是概念包装。</h2>
            <p>从 AI 基础设施到业务工具，每个案例都用界面、决策和结果共同说明。</p>
          </div>

          <div className="project-filters" data-reveal aria-label="筛选项目">
            {filters.map((item) => (
              <button
                className={filter === item ? 'is-active' : ''}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
                aria-pressed={filter === item}
              >
                {item}
                <span>{item === 'ALL' ? projects.length : projects.filter((project) => project.category === item).length}</span>
              </button>
            ))}
          </div>

          <div className="project-grid">
            {visibleProjects.map((project) => (
              <article
                className={`project-card ${project.featured ? 'is-featured' : ''}`}
                key={project.id}
                data-reveal
              >
                <div className="project-image">
                  <img
                    src={asset(project.image)}
                    alt={`${project.title}产品界面`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="project-image-meta">
                    <span>{project.index}</span>
                    <span>{project.category}</span>
                  </div>
                </div>
                <div className="project-copy">
                  <div>
                    <p>{project.subtitle}</p>
                    <h3>{project.title}</h3>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-result">
                    <strong>{project.result}</strong>
                    <span>PROJECT EVIDENCE</span>
                  </div>
                  <ul>
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities" id="capabilities">
          <div className="section-intro" data-reveal>
            <p className="section-code">03 / HOW I WORK</p>
            <h2>Product. Systems. Build.</h2>
            <p>不是三个分开的技能，而是一条从问题到验证的完整链路。</p>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article key={capability.number} data-reveal>
                <span>{capability.number}</span>
                <div>
                  <p>{capability.cn}</p>
                  <h3>{capability.title}</h3>
                </div>
                <p>{capability.description}</p>
                <ul>
                  {capability.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="impact">
          <div className="impact-stage">
            <div className="impact-copy">
              <p className="section-code">04 / IMPACT, NOT OUTPUT</p>
              <div className="impact-slides">
                {impactSlides.map((slide) => (
                  <article className="impact-slide" key={slide.value}>
                    <div className="impact-value">
                      <strong>{slide.value}</strong>
                      <span>{slide.label}</span>
                    </div>
                    <h2>{slide.title}</h2>
                    <p>{slide.description}</p>
                  </article>
                ))}
              </div>
              <div className="impact-progress">
                <span>01</span><i /><span>04</span>
              </div>
            </div>
            <div className="impact-media">
              <div className="impact-image-track">
                {impactSlides.map((slide) => (
                  <figure key={slide.image}>
                    <img src={asset(slide.image)} alt="" loading="lazy" decoding="async" />
                  </figure>
                ))}
              </div>
              <span className="media-code">SYSTEM EVIDENCE / LIVE PRODUCT UI</span>
            </div>
          </div>
        </section>

        <section className="showcase">
          <div className="showcase-heading" data-reveal>
            <p className="section-code">05 / VIBE CODING IN PRACTICE</p>
            <h2>把 AI 能力从 PPT 推进到可操作界面。</h2>
          </div>
          <div className="showcase-frame">
            <img
              src={asset('ai-studio-script.png')}
              alt="AI Studio 短视频脚本分析产品界面"
              loading="lazy"
              decoding="async"
            />
            <div className="showcase-caption">
              <span>AI STUDIO / SCRIPT REPLICATION</span>
              <p>业务问题 → 流程拆解 → Prompt → 原型 → Working MVP</p>
            </div>
          </div>
          <div className="showcase-notes">
            <p>Vibe Coding 对我不是“让 AI 替我写代码”，而是用更低成本把判断变成真实反馈。</p>
            <div>
              <span>01 / DEFINE THE JOB</span>
              <span>02 / BUILD THE SHORTEST LOOP</span>
              <span>03 / TEST WITH REAL USERS</span>
            </div>
          </div>
        </section>

        <section className="experience" id="about">
          <div className="section-intro" data-reveal>
            <p className="section-code">06 / EXPERIENCE</p>
            <h2>从写代码，到对业务结果负责。</h2>
          </div>
          <div className="experience-list">
            {experiences.map((item, index) => (
              <article key={`${item.company}-${item.time}`} data-reveal>
                <span className="experience-index">0{index + 1}</span>
                <time>{item.time}</time>
                <div className="experience-role">
                  <h3>{item.role}</h3>
                  <p>{item.company}</p>
                </div>
                <p className="experience-summary">{item.summary}</p>
                <span className="experience-code">{item.code}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-portrait" data-reveal>
            <img
              src={`${import.meta.env.BASE_URL}portrait.png`}
              alt="张子健个人肖像"
              loading="lazy"
              decoding="async"
            />
            <span>ZHANG ZIJIAN / 2026</span>
          </div>
          <div className="contact-copy" data-reveal>
            <p className="section-code">07 / LET’S START SOMETHING</p>
            <h2>有复杂的 AI 问题？<br />我们聊聊。</h2>
            <a href="mailto:1615962561@qq.com">1615962561@qq.com <span>↗</span></a>
            <div className="contact-meta">
              <span>HANGZHOU, CHINA</span>
              <a href="https://github.com/az1615962561-crypto" rel="noreferrer" target="_blank">
                GITHUB / az1615962561-crypto ↗
              </a>
              <span>OPEN TO AI PRODUCT ROLES</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>ZHANG ZIJIAN © 2026</span>
        <span>PRODUCT THINKING / AI SYSTEMS / VIBE CODING</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </div>
  )
}

export default App
