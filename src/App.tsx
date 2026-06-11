import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectAsset, publicAsset } from './assets'
import { advantages, education, experiences, profile, type ResumeBullet } from './content'
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

function Curtains({ className = '' }: { className?: string }) {
  return (
    <div className={`curtains ${className}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  )
}

function SectionHeading({
  index,
  title,
  id,
}: {
  index: string
  title: string
  id?: string
}) {
  return (
    <div className="resume-heading" id={id} data-reveal>
      <span>{index}</span>
      <h2>{title}</h2>
      <i />
    </div>
  )
}

function ResumeBulletContent({ bullet }: { bullet: ResumeBullet }) {
  return (
    <>
      <div className="bullet-copy">
        <span className="bullet-mark">●</span>
        <div>
          <p>
            {bullet.title && <strong>【{bullet.title}】：</strong>}
            {bullet.text}
          </p>
          {bullet.subItems?.map((item) => <p className="sub-item" key={item}>{item}</p>)}
        </div>
      </div>
      {bullet.media && (
        <div className={`evidence-grid evidence-grid--${Math.min(bullet.media.length, 3)}`}>
          {bullet.media.map((media) => (
            <figure key={media.sourceName} data-media-reveal>
              <div>
                <img
                  src={projectAsset(media.file)}
                  alt={media.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <span>{media.sourceName}</span>
                <small>PROJECT EVIDENCE ↗</small>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
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
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            reduceMotion: boolean
          }

          if (reduceMotion) {
            gsap.set('[data-reveal], [data-media-reveal], .hero-copy', { clearProps: 'all' })
            return
          }

          gsap
            .timeline({ defaults: { duration: 0.7, ease: 'power2.out' } })
            .from('.site-header', { autoAlpha: 0, y: -18 })
            .from('.hero-copy > *', { autoAlpha: 0, yPercent: 70, stagger: 0.09 }, '-=.25')

          gsap
            .timeline({
              scrollTrigger: {
                trigger: '#hero-trigger',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            })
            .to('.hero-copy', { autoAlpha: 0, yPercent: -35, duration: 0.3 }, 0.38)
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
                { autoAlpha: 0, y: 38 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.72,
                  stagger: 0.06,
                  ease: 'power2.out',
                },
              ),
          })

          ScrollTrigger.batch('[data-media-reveal]', {
            start: 'top 86%',
            once: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { clipPath: 'inset(0 0 100% 0)', y: 30 },
                {
                  clipPath: 'inset(0 0 0% 0)',
                  y: 0,
                  duration: 0.9,
                  stagger: 0.08,
                  ease: 'power3.out',
                },
              ),
          })

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
          <a href="#profile" onClick={() => setMenuOpen(false)}>Profile</a>
          <a href="#advantages" onClick={() => setMenuOpen(false)}>Advantages</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div>
          <span>AI PRODUCT / HANGZHOU</span>
          <span>RESUME / 2026</span>
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
              <span>RESUME / AI PRODUCT MANAGER</span>
              <h1>张子健</h1>
              <p>AI 产品经理，专注企业级 Agent 中台、AI 网关与业务 AI 产品。</p>
            </div>
            <span className="hero-coordinate">30.2741° N / 120.1551° E</span>
            <Curtains className="hero-curtains" />
          </div>
        </section>

        <div className="resume-page">
          <section className="profile-section grid-container" id="profile">
            <SectionHeading index="01" title="基本信息" />
            <div className="profile-grid">
              <div data-reveal>
                <span>姓 名</span>
                <strong>{profile.name}</strong>
              </div>
              <div data-reveal>
                <span>电 话</span>
                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
              </div>
              <div data-reveal>
                <span>邮 箱</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </div>
            </div>

            <SectionHeading index="02" title="教育背景" />
            <div className="education-row" data-reveal>
              <time>{education.time}</time>
              <strong>{education.school}</strong>
              <span>{education.major}</span>
            </div>
          </section>

          <section className="advantages-section grid-container">
            <SectionHeading index="03" title="个人优势" id="advantages" />
            <div className="advantages-list">
              {advantages.map((advantage, index) => (
                <article key={advantage.title} data-reveal>
                  <span>0{index + 1}</span>
                  <h3>{advantage.title}</h3>
                  <p>{advantage.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="career-section" id="experience">
            {experiences.map((experience, experienceIndex) => (
              <article
                className={`experience-block ${experienceIndex === 0 ? 'is-primary' : ''}`}
                key={`${experience.section}-${experience.company}`}
              >
                <div className="grid-container">
                  <SectionHeading
                    index={`0${experienceIndex + 4}`}
                    title={experience.section}
                  />
                  <div className="experience-layout">
                    <aside className="experience-meta">
                      <time>{experience.time}</time>
                      <h3>{experience.company}</h3>
                      <strong>{experience.role}</strong>
                      <span>0{experienceIndex + 1} / 03</span>
                    </aside>
                    <div className="experience-detail">
                      {experience.bullets.map((bullet, index) => (
                        <section className="resume-bullet" key={`${bullet.title ?? 'intro'}-${index}`} data-reveal>
                          <span className="bullet-index">{String(index + 1).padStart(2, '0')}</span>
                          <ResumeBulletContent bullet={bullet} />
                        </section>
                      ))}

                      {experience.missingMedia && (
                        <section className="missing-media" data-reveal>
                          <div>
                            <span>MATERIALS NEEDED</span>
                            <h4>此段经历的图片待补充</h4>
                          </div>
                          <ul>
                            {experience.missingMedia.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>

        <section className="contact-section" id="contact">
          <div className="contact-grid">
            <div className="contact-image">
              <img src={publicAsset('portrait.png')} alt="张子健个人证件照" />
            </div>
            <div className="contact-copy">
              <span>AI PRODUCT MANAGER / HANGZHOU</span>
              <h2>张子健</h2>
              <div className="contact-lines">
                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                <a href={`mailto:${profile.email}`}>{profile.email} ↗</a>
              </div>
              <p>完整履历已按简历原始顺序呈现。</p>
              <div>
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
