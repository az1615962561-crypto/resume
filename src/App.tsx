import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projectAsset, publicAsset } from './assets'
import { advantages, education, experiences, profile, type ResumeBullet } from './content'
import { createResumeSearch, type AnswerSource } from './search'
import './App.css'

const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

const DirectoryScene = lazy(() =>
  import('./DirectoryScene').then((module) => ({ default: module.DirectoryScene })),
)

gsap.registerPlugin(useGSAP, ScrollTrigger)

const directory = [
  { label: '个人优势', anchor: '#advantages', count: advantages.length },
  { label: '工作经历 · 尤里卡中台', anchor: '#experience', count: experiences[0].bullets.length },
  { label: '创业经历 · 苏州轻练', anchor: '#ventures', count: experiences[1].bullets.length },
  { label: '实习经历 · 杭州谐云', anchor: '#internship', count: experiences[2].bullets.length },
  { label: '基本信息 · 联系方式', anchor: '#contact', count: null },
]

const questions = [
  {
    question: '尤里卡 AI Agent 中台是做什么的？',
    answer:
      '我从 0 到 1 主导建立了企业级 AI Agent 中台「尤里卡」，覆盖 AI 能力接入、构建、调试、发布、运维全链路，并定义了应用层 / 模型层 / 编排层 / 资源层 / 网关层 5 层架构。目前已赋能 10+ AI 产线、沉淀 100+ Agent 应用库，平台日调用量 10w+。',
  },
  {
    question: 'AI 网关系统解决了什么问题？',
    answer:
      '我主导了「子网关 / 出口网关 / 观测网关 / 入口网关」四层 AI 网关架构，统一管控公司全部 AI 流量的出入、调度与观测，日均处理 Token 10 亿+。它解决了各业务线分散接入、API Key 管理分散、算力调度难、Token 成本失控与数据泄露等治理痛点。',
  },
  {
    question: 'AI Studio 给业务带来了什么？',
    answer:
      '作为 AI Studio 主导者，我用 Vibe Coding 叠加尤里卡原子能力，快速搭建开箱即用的业务 AI 工具，落地了短视频脚本检测、投流素材分析、脚本复刻等多套工具，平均为业务人员提效约 20%，并推动 3 条业务产品向「业务 + AI」转型。',
  },
  {
    question: '创业经历里你负责什么？',
    answer:
      '在苏州轻练担任合伙人，主导运动科技产品本土化，全链路负责选品、获客、运营、分润：月流水 10w、利润率 32%、首月转化率 80%；通过标准化门店 SOE 把单店日均获客提升 200%，MAU 环比 +45%，整体运营成本降低 30%。',
  },
  {
    question: '实习期间参与了哪些 AI 平台？',
    answer:
      '在杭州谐云任 AI 产品经理，参与了模型训练的数据采集与标注（逐帧策略缩短标注时间 30%）、算力平台的集群 / 节点 / 资源池三层架构设计，以及模型评估模块；并推动重庆数智平台按时上线，使算法工程师操作效率提升 30%。',
  },
  {
    question: '怎么联系你？',
    answer: `电话 ${profile.phone}，邮箱 ${profile.email}。也可以在页面底部找到完整联系方式。`,
  },
]

const fallbackAnswer =
  '简历里没有直接对应的内容——可以换个说法，或从下面的常见问题里挑一个，也可以直接发邮件问我：' +
  profile.email

type ChatMessage = {
  role: 'user' | 'ai'
  text: string
  source?: AnswerSource
}

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#0123456789ABCDEF'

function ScrambleText({
  phrases,
  period = 4200,
  className = '',
}: {
  phrases: string[]
  period?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.textContent = phrases[0]
      return
    }

    let frame = 0
    let raf = 0
    let phraseIndex = 0
    let queue: Array<{
      from: string
      to: string
      start: number
      end: number
      char?: string
    }> = []

    const update = () => {
      let output = ''
      let settled = 0

      for (const item of queue) {
        if (frame >= item.end) {
          settled += 1
          output += item.to
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          }
          output += item.char
        } else {
          output += item.from
        }
      }

      element.textContent = output

      if (settled < queue.length) {
        frame += 1
        raf = window.requestAnimationFrame(update)
      }
    }

    const setText = (next: string) => {
      const current = element.textContent ?? ''
      const length = Math.max(current.length, next.length)
      queue = Array.from({ length }, (_, index) => {
        const start = Math.floor(Math.random() * 26)
        return {
          from: current[index] ?? '',
          to: next[index] ?? '',
          start,
          end: start + 8 + Math.floor(Math.random() * 22),
        }
      })
      window.cancelAnimationFrame(raf)
      frame = 0
      update()
    }

    setText(phrases[0])
    let timer: number | undefined
    if (phrases.length > 1) {
      timer = window.setInterval(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length
        setText(phrases[phraseIndex])
      }, period)
    }

    return () => {
      window.cancelAnimationFrame(raf)
      if (timer) window.clearInterval(timer)
    }
  }, [period, phrases])

  return <span aria-hidden="true" className={className} ref={ref} />
}

function CursorDot() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = ref.current
    if (!dot) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let x = targetX
    let y = targetY
    let raf = 0
    let visible = false

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!visible) {
        visible = true
        dot.classList.add('is-visible')
      }
      const interactive = (event.target as Element | null)?.closest('a, button, input')
      dot.classList.toggle('is-active', Boolean(interactive))
    }

    const loop = () => {
      x += (targetX - x) * 0.18
      y += (targetY - y) * 0.18
      dot.style.transform = `translate(${x}px, ${y}px)`
      raf = window.requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = window.requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return <div aria-hidden="true" className="cursor-dot" ref={ref} />
}

function MicIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
      <rect height="7.4" rx="2.1" stroke="currentColor" strokeWidth="1.2" width="4.2" x="5.9" y="1.4" />
      <path d="M3.4 7.6a4.6 4.6 0 0 0 9.2 0" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 12.2v2.4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/* 逐字填充文本：滚动时从浅灰变实色（参考站 statement 效果） */
function FillText({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  return (
    <span className={`fill-text ${className}`} data-fill>
      {Array.from(text).map((char, index) => (
        <span className="fill-char" key={`${char}-${index}`}>
          {char}
        </span>
      ))}
    </span>
  )
}

/* 白色滚动横幅带（参考站 NEVER STOP STARTING™ 环带） */
function MarqueeBand({
  text,
  reverse = false,
  className = '',
}: {
  text: string
  reverse?: boolean
  className?: string
}) {
  return (
    <div aria-hidden="true" className={`marquee ${reverse ? 'marquee--reverse' : ''} ${className}`}>
      <div className="marquee-track">
        {Array.from({ length: 2 }, (_, copy) => (
          <div className="marquee-copy" key={copy}>
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index}>
                <i>●</i>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeading({
  index,
  title,
  id,
  reveal = true,
}: {
  index: string
  title: string
  id?: string
  reveal?: boolean
}) {
  return (
    <div className="resume-heading" id={id} data-reveal={reveal ? '' : undefined}>
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
                <span className="evidence-pill">{media.sourceName.replace(/\.[^./\\]+$/, '')}</span>
                <img
                  src={projectAsset(media.file)}
                  alt={media.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <span>{media.alt}</span>
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
  const chatLogRef = useRef<HTMLDivElement>(null)
  const askInputRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [thinking, setThinking] = useState(false)
  const [draft, setDraft] = useState('')
  const [openHighlight, setOpenHighlight] = useState(0)

  const searchResume = useMemo(() => createResumeSearch(questions), [])

  const closePanels = () => {
    setMenuOpen(false)
    setAskOpen(false)
  }

  const jumpToSource = (anchor: string) => {
    closePanels()
    window.setTimeout(() => {
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  useEffect(() => {
    if (!menuOpen && !askOpen) return

    const previousOverflow = document.body.style.overflow
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      closePanels()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeydown)
    }
  }, [askOpen, menuOpen])

  useEffect(() => {
    if (!askOpen) return
    const id = window.setTimeout(() => askInputRef.current?.focus(), 360)
    return () => window.clearTimeout(id)
  }, [askOpen])

  useLayoutEffect(() => {
    const log = chatLogRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, thinking])

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || thinking) return

    const hit = searchResume(trimmed)
    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setThinking(true)
    setDraft('')

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: 'ai',
          text: hit ? hit.answer : fallbackAnswer,
          source: hit?.source,
        },
      ])
      setThinking(false)
    }, 700)
  }

  const onAskSubmit = (event: FormEvent) => {
    event.preventDefault()
    ask(draft)
  }

  useGSAP(
    () => {
      const media = gsap.matchMedia()

      media.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          isDesktop: '(min-width: 1024px)',
        },
        (context) => {
          const { reduceMotion, isDesktop } = context.conditions as {
            reduceMotion: boolean
            isDesktop: boolean
          }

          if (reduceMotion) {
            gsap.set('[data-reveal], [data-media-reveal], .hero-copy, .fill-char', {
              clearProps: 'all',
            })
            return
          }

          gsap
            .timeline({ defaults: { duration: 0.7, ease: 'power2.out' } })
            .from('.site-header', { autoAlpha: 0, y: -18 })
            .from('.hero-copy > *', { autoAlpha: 0, yPercent: 70, stagger: 0.09 }, '-=.25')

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

          if (isDesktop) {
            const pinArea = document.querySelector<HTMLElement>('.hscroll')
            const track = document.querySelector<HTMLElement>('.hscroll-track')
            if (pinArea && track) {
              const distance = () => track.scrollWidth - window.innerWidth
              const horizontalTween = gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: {
                  trigger: pinArea,
                  start: 'top top',
                  end: () => `+=${distance()}`,
                  scrub: 0.6,
                  pin: true,
                  invalidateOnRefresh: true,
                },
              })

              // 创业经历：卡片随横向滚动逐个入场（淡入 + 放大）
              gsap.utils.toArray<HTMLElement>('.hcard').forEach((card) => {
                gsap.from(card, {
                  autoAlpha: 0,
                  scale: 0.9,
                  yPercent: 6,
                  duration: 0.5,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: card,
                    containerAnimation: horizontalTween,
                    start: 'left 88%',
                    toggleActions: 'play none none reverse',
                  },
                })
              })
            }
          } else {
            // 移动端：创业卡片竖排，用普通滚动入场
            ScrollTrigger.batch('.hcard', {
              start: 'top 90%',
              once: true,
              onEnter: (elements) =>
                gsap.fromTo(
                  elements,
                  { autoAlpha: 0, y: 40 },
                  { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
                ),
            })
          }

          gsap.utils.toArray<HTMLElement>('[data-fill]').forEach((element) => {
            gsap.fromTo(
              element.querySelectorAll('.fill-char'),
              { opacity: 0.14 },
              {
                opacity: 1,
                ease: 'none',
                stagger: 0.4,
                scrollTrigger: {
                  trigger: element,
                  start: 'top 84%',
                  end: 'top 30%',
                  scrub: 0.4,
                },
              },
            )
          })

          // 个人优势：每张卡片的大标题竖向揭幕
          ScrollTrigger.batch('.advantages-list h3', {
            start: 'top 90%',
            once: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { clipPath: 'inset(0 0 100% 0)' },
                {
                  clipPath: 'inset(0 0 0% 0)',
                  duration: 0.8,
                  stagger: 0.1,
                  ease: 'power3.out',
                },
              ),
          })

          // 实习经历：手风琴标题逐行横向擦入
          ScrollTrigger.batch('.is-accordion .acc-title', {
            start: 'top 92%',
            once: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { clipPath: 'inset(0 100% 0 0)', x: 36 },
                {
                  clipPath: 'inset(0 0% 0 0)',
                  x: 0,
                  duration: 0.7,
                  stagger: 0.09,
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

  const overlayOpen = menuOpen || askOpen
  const workExperience = experiences[0]
  const venture = experiences[1]
  const internship = experiences[2]

  return (
    <div className="site-shell" ref={root}>
      <CursorDot />

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
          onClick={() => {
            setMenuOpen(false)
            setAskOpen(true)
          }}
        >
          <span>Ask about my work</span>
          <MicIcon />
        </button>
        <button
          aria-controls="menu-panel"
          aria-expanded={menuOpen}
          className={`menu-trigger ${menuOpen ? 'is-open' : ''}`}
          type="button"
          onClick={() => {
            setAskOpen(false)
            setMenuOpen((open) => !open)
          }}
        >
          <span aria-hidden="true">＋</span> MENU
        </button>
      </header>

      <div
        aria-hidden="true"
        className={`panel-backdrop ${overlayOpen ? 'is-open' : ''}`}
        onClick={closePanels}
      />

      <div
        aria-hidden={!menuOpen}
        aria-label="网站导航"
        aria-modal="true"
        className={`menu-panel ${menuOpen ? 'is-open' : ''}`}
        id="menu-panel"
        role="dialog"
      >
        <div className="menu-columns">
          <section>
            <h3>Resume</h3>
            <nav>
              <a href="#advantages" onClick={closePanels}>个人优势</a>
              <a href="#experience" onClick={closePanels}>工作经历</a>
              <a href="#ventures" onClick={closePanels}>创业经历</a>
              <a href="#internship" onClick={closePanels}>实习经历</a>
              <a href="#contact" onClick={closePanels}>基本信息 / 联系</a>
            </nav>
          </section>
          <section>
            <h3>Projects</h3>
            <nav>
              <a href="#experience" onClick={closePanels}>尤里卡 AGENT 中台</a>
              <a href="#experience" onClick={closePanels}>AI 网关系统</a>
              <a href="#experience" onClick={closePanels}>AI STUDIO</a>
              <a href="#internship" onClick={closePanels}>算力平台</a>
            </nav>
          </section>
          <section>
            <h3>Elsewhere</h3>
            <nav>
              <a href="https://github.com/az1615962561-crypto" rel="noreferrer" target="_blank">
                GITHUB ↗
              </a>
              <a href={`mailto:${profile.email}`}>EMAIL ↗</a>
              <a href={`tel:${profile.phone}`}>PHONE ↗</a>
            </nav>
          </section>
          <section className="menu-aside">
            <a className="menu-major" href="#advantages" onClick={closePanels}>About Me</a>
            <a className="menu-major" href="#experience" onClick={closePanels}>Experience</a>
            <a className="menu-major" href="#contact" onClick={closePanels}>Contact</a>
            <button
              className="menu-cta"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setAskOpen(true)
              }}
            >
              <i>●</i> Ask about my work
            </button>
          </section>
        </div>
        <div className="menu-footer">
          <div className="menu-socials">
            <a href="https://github.com/az1615962561-crypto" rel="noreferrer" target="_blank">
              GITHUB
            </a>
            <a href={`mailto:${profile.email}`}>EMAIL</a>
            <a href={`tel:${profile.phone}`}>PHONE</a>
          </div>
          <span>AI PRODUCT / HANGZHOU — RESUME 2026</span>
        </div>
      </div>

      <div
        aria-hidden={!askOpen}
        aria-label="关于张子健的工作问答"
        aria-modal="true"
        className={`ask-overlay ${askOpen ? 'is-open' : ''} ${messages.length ? 'is-chatting' : ''}`}
        id="ask-panel"
        role="dialog"
      >
        <button className="ask-close" type="button" onClick={closePanels}>
          ×
        </button>

        {messages.length > 0 && (
          <div className="chat-log" ref={chatLogRef}>
            {messages.map((message, index) => (
              <div className={`chat-bubble chat-bubble--${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
                {message.source && (
                  <button
                    className="chat-source"
                    type="button"
                    onClick={() => jumpToSource(message.source!.anchor)}
                  >
                    来源 · {message.source.label} ↘
                  </button>
                )}
              </div>
            ))}
            {thinking && (
              <div className="chat-bubble chat-bubble--ai chat-bubble--thinking">
                <i /><i /><i />
              </div>
            )}
          </div>
        )}

        <div className="ask-panel">
          <form className="ask-input-row" onSubmit={onAskSubmit}>
            <input
              maxLength={60}
              placeholder={messages.length ? '继续提问…' : 'Ask about my work'}
              ref={askInputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button aria-label="提交问题" type="submit">
              <MicIcon />
            </button>
          </form>
          <div className="ask-columns">
            <div className="ask-faqs">
              <span>FAQS</span>
              <ul>
                {questions.map((item) => (
                  <li key={item.question}>
                    <button type="button" onClick={() => ask(item.question)}>
                      <i>●</i>
                      {item.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ask-suggestions">
              <span>SUGGESTIONS</span>
              <a href={`mailto:${profile.email}`}>✉ 联系我</a>
              <a href="https://github.com/az1615962561-crypto" rel="noreferrer" target="_blank">
                ⌁ GitHub 项目
              </a>
            </div>
          </div>
          <p className="ask-disclaimer">本地检索问答 · 答案均来自本页简历内容</p>
        </div>
      </div>

      <main>
        <section className="hero-trigger" id="hero-trigger">
          <div className="hero-stage" id="top">
            <Suspense fallback={<div className="scene-loading">LOADING SCENE</div>}>
              <HeroScene />
            </Suspense>
            <div className="hero-copy">
              <ScrambleText
                className="hero-kicker"
                phrases={['RESUME / AI PRODUCT MANAGER', 'NEVER STOP SHIPPING™']}
              />
              <h1>张子健</h1>
              <p>AI 产品经理，让 AI 拥抱业务。</p>
            </div>
            <ScrambleText
              className="hero-coordinate"
              period={5200}
              phrases={['30.2741° N / 120.1551° E', 'HANGZHOU / CHINA', 'ZHANG ZIJIAN / 2026']}
            />
          </div>
        </section>

        <section className="directory-section" id="directory">
          <div className="grid-container directory-grid">
            <div className="directory-intro">
              <span className="dir-kicker">RESUME INDEX / 2026</span>
              <h2>履历目录。</h2>
              <a className="dir-readmore" href="#advantages">
                ● 从头开始 ↘
              </a>
            </div>

            <div className="directory-stage">
              <Suspense fallback={null}>
                <DirectoryScene />
              </Suspense>
            </div>

            <nav className="directory-list">
              <span className="dir-list-title">目录</span>
              {directory.map((item) => (
                <a href={item.anchor} key={item.anchor}>
                  <span>{item.label}</span>
                  <i>{item.count === null ? '↗' : `(${String(item.count).padStart(2, '0')})`}</i>
                </a>
              ))}
              <a className="dir-viewall" href="#contact">
                ● 联系我 ↘
              </a>
            </nav>
          </div>
        </section>

        <div className="resume-page">
          <section className="advantages-section grid-container">
            <SectionHeading index="01" title="个人优势" id="advantages" />
            <div className="advantages-intro">
              <h3>
                <FillText text="产品、AI、工具与 Owner 意识——四个维度构成的复合优势。" />
              </h3>
              <span data-reveal>● PERSONAL EDGE</span>
            </div>
            <div className="advantages-list">
              {advantages.map((advantage, index) => (
                <article key={advantage.title} data-reveal>
                  <span>0{index + 1}</span>
                  <h3>{advantage.title}</h3>
                  <p>
                    <FillText text={advantage.text} />
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="career-section" id="experience">
            <article className="experience-block is-primary">
              <div className="grid-container">
                <SectionHeading index="02" title={workExperience.section} />
                <div className="experience-layout">
                  <aside className="experience-meta">
                    <time>{workExperience.time}</time>
                    <h3>{workExperience.company}</h3>
                    <strong>{workExperience.role}</strong>
                    <span>01 / 03</span>
                  </aside>
                  <div className="experience-detail">
                    {workExperience.bullets.map((bullet, index) => (
                      <section className="resume-bullet" key={`${bullet.title ?? 'intro'}-${index}`} data-reveal>
                        <span className="bullet-index">{String(index + 1).padStart(2, '0')}</span>
                        <ResumeBulletContent bullet={bullet} />
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <div className="marquee-wrap">
              <MarqueeBand text="NEVER STOP SHIPPING™" />
              <MarqueeBand reverse className="marquee--cross" text="VIBE CODING / AI PRODUCT" />
            </div>

            {/* 创业经历：pin + 横向滚动卡片 */}
            <article className="experience-block is-horizontal" id="ventures">
              <div className="hscroll">
                <div className="grid-container">
                  <SectionHeading index="03" reveal={false} title={venture.section} />
                  <div className="exp-overview">
                    <time>{venture.time}</time>
                    <strong>{venture.company}</strong>
                    <span>{venture.role}</span>
                    <small>02 / 03 — SCROLL →</small>
                  </div>
                </div>
                <div className="hscroll-track">
                  {venture.bullets.map((bullet, index) => (
                    <article className="hcard" key={`${bullet.title ?? 'hcard'}-${index}`}>
                      <header>
                        <span>
                          0{index + 1} / 0{venture.bullets.length}
                        </span>
                        <i>●</i>
                      </header>
                      {bullet.title && <h4>{bullet.title}</h4>}
                      {bullet.text && <p>{bullet.text}</p>}
                      {bullet.subItems?.map((item) => (
                        <p className="hcard-sub" key={item}>
                          {item}
                        </p>
                      ))}
                      <footer>
                        <span>{venture.company}</span>
                        <small>{venture.role}</small>
                      </footer>
                    </article>
                  ))}
                  <article className="hcard hcard--end" aria-hidden="true">
                    <h4>
                      0 → 1<br />全链路操盘
                    </h4>
                    <p>选品 · 获客 · 运营 · 分润</p>
                  </article>
                </div>
              </div>

              {venture.media && (
                <div className="grid-container ventures-media">
                  <div className="ventures-media-head" data-reveal>
                    <span>● PROJECT EVIDENCE</span>
                    <h4>线下门店 · 沉浸式课程</h4>
                  </div>
                  <div className="evidence-grid evidence-grid--3 evidence-grid--standalone">
                    {venture.media.map((media) => (
                      <figure key={media.file} data-media-reveal>
                        <div>
                          <span className="evidence-pill">{media.sourceName}</span>
                          <img
                            src={projectAsset(media.file)}
                            alt={media.alt}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <figcaption>
                          <span>{media.alt}</span>
                          <small>PROJECT EVIDENCE ↗</small>
                        </figcaption>
                      </figure>
                    ))}
                  </div>

                  {venture.productMedia && (
                    <>
                      <div className="ventures-media-head ventures-media-head--product" data-reveal>
                        <span>● PRODUCT</span>
                        <h4>自有工厂 · 超模产品</h4>
                      </div>
                      <div className="evidence-grid evidence-grid--standalone evidence-grid--product">
                        {venture.productMedia.map((media) => (
                          <figure key={media.file} data-media-reveal>
                            <div>
                              <span className="evidence-pill">{media.sourceName}</span>
                              <img
                                src={projectAsset(media.file)}
                                alt={media.alt}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <figcaption>
                              <span>{media.alt}</span>
                              <small>OWN PRODUCT ↗</small>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </article>

            {/* 实习经历：手风琴展开行 */}
            <article className="experience-block is-accordion" id="internship">
              <div className="grid-container">
                <SectionHeading index="04" title={internship.section} />
                <div className="exp-overview" data-reveal>
                  <time>{internship.time}</time>
                  <strong>{internship.company}</strong>
                  <span>{internship.role}</span>
                  <small>03 / 03</small>
                </div>
                <div className="accordion">
                  {internship.bullets.map((bullet, index) => {
                    const isOpen = openHighlight === index
                    return (
                      <div className={`acc-item ${isOpen ? 'is-open' : ''}`} data-reveal key={bullet.title}>
                        <button
                          aria-expanded={isOpen}
                          type="button"
                          onClick={() => setOpenHighlight(isOpen ? -1 : index)}
                        >
                          <span className="acc-num">0{index + 1}</span>
                          <span className="acc-title">{bullet.title}</span>
                          <i className="acc-plus" aria-hidden="true">
                            ＋
                          </i>
                        </button>
                        <div className="acc-body">
                          <div>
                            <p>{bullet.text}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </article>
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
              <div>
                <a href="https://github.com/az1615962561-crypto" target="_blank" rel="noreferrer">
                  GITHUB ↗
                </a>
                <a href="#top">BACK TO TOP ↑</a>
              </div>
            </div>
          </div>

          <div className="footer-grid">
            <section>
              <h3>基本信息</h3>
              <ul>
                <li>
                  <span>姓 名</span>
                  <strong>{profile.name}</strong>
                </li>
                <li>
                  <span>电 话</span>
                  <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                </li>
                <li>
                  <span>邮 箱</span>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
              </ul>
            </section>
            <section>
              <h3>教育背景</h3>
              <ul>
                <li>
                  <span>时 间</span>
                  <strong>{education.time}</strong>
                </li>
                <li>
                  <span>学 校</span>
                  <strong>{education.school}</strong>
                </li>
                <li>
                  <span>专 业</span>
                  <strong>{education.major}</strong>
                </li>
              </ul>
            </section>
            <section>
              <h3>Links</h3>
              <div className="footer-pills">
                <a href="https://github.com/az1615962561-crypto" rel="noreferrer" target="_blank">
                  GITHUB
                </a>
                <a href={`mailto:${profile.email}`}>EMAIL</a>
                <a href={`tel:${profile.phone}`}>PHONE</a>
              </div>
            </section>
            <section>
              <h3>This Site</h3>
              <p className="footer-note">
                以 Vibe Coding 方式独立完成从设计稿到上线的全流程开发：还原获奖参考站的交互体验，用
                Three.js 实现 3D 粒子场景与旋转照片转鼓，用 GSAP ScrollTrigger
                实现滚动驱动的视差、钉滞横滑、逐字浮现等动效；并自研「Ask about my work」轻量问答功能，以
                TF-IDF + 中文二元分词 + 停用词做纯前端检索，零后端、零调用成本即可基于简历内容智能应答，体现对
                RAG / 检索问答原理的理解；全站采用统一深色设计系统，完成响应式适配与性能优化。
              </p>
            </section>
          </div>

          <div className="footer-bar">
            <span>© 2026 {profile.name} · AI PRODUCT MANAGER</span>
            <span>● NEVER STOP SHIPPING™</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
