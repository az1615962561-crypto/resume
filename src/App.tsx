import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cases, contentRequests, experiences, metrics } from './content'
import './App.css'

const demoAnswers: Record<string, string> = {
  '你做过最复杂的 AI 产品是什么？':
    '尤里卡 AI Agent 中台。它不是单一工具，而是一套覆盖模型、编排、资源与网关的企业级 AI 基础设施。',
  '你如何理解 Vibe Coding？':
    '不是用 AI 快速堆页面，而是把产品判断、上下文组织和工程验证压缩进同一个快速反馈循环。',
  '为什么引入 Dify？':
    '自研全部编排能力成本过高。复用成熟开源能力，把资源集中在企业治理、资产沉淀和业务适配上。',
}

function App() {
  const [question, setQuestion] = useState(Object.keys(demoAnswers)[0])

  const handleVisualPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--pointer-x', `${x * 22}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${y * 22}px`)
    event.currentTarget.style.setProperty('--pointer-x-soft', `${x * 9}px`)
    event.currentTarget.style.setProperty('--pointer-y-soft', `${y * 9}px`)
    event.currentTarget.style.setProperty('--pointer-x-soft-neg', `${x * -9}px`)
    event.currentTarget.style.setProperty('--pointer-y-soft-neg', `${y * -9}px`)
  }

  const resetVisualPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--pointer-x', '0px')
    event.currentTarget.style.setProperty('--pointer-y', '0px')
    event.currentTarget.style.setProperty('--pointer-x-soft', '0px')
    event.currentTarget.style.setProperty('--pointer-y-soft', '0px')
    event.currentTarget.style.setProperty('--pointer-x-soft-neg', '0px')
    event.currentTarget.style.setProperty('--pointer-y-soft-neg', '0px')
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.15 },
    )

    document.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="返回首页">
          ZJ<span>/26</span>
        </a>
        <nav aria-label="主导航">
          <a href="#work">项目</a>
          <a href="#lab">实验室</a>
          <a href="#about">关于</a>
        </nav>
        <a className="header-cta" href="#contact">
          联系我 <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero section-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AI PRODUCT MANAGER / VIBE CODER</p>
            <h1>
              把复杂 AI，
              <br />
              做成<span>可用产品</span>。
            </h1>
            <p className="hero-intro">
              我是张子健，专注 Agent 平台、AI 基础设施与业务 AI 化，也用代码把判断快速变成可验证的产品。
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#work">
                查看代表项目
              </a>
              <a className="text-action" href="#lab">
                体验 Vibe Lab <span>↓</span>
              </a>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="交互式 AI 系统视觉占位"
            onPointerMove={handleVisualPointer}
            onPointerLeave={resetVisualPointer}
          >
            <div className="visual-grid" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="core">
              <span>AGENT</span>
              <strong>CORE</strong>
              <small>ONLINE</small>
            </div>
            <div className="node node-a">MODEL</div>
            <div className="node node-b">MEMORY</div>
            <div className="node node-c">RAG</div>
            <div className="node node-d">TOOLS</div>
            <div className="system-caption">
              <span>SYS.01</span>
              <span>POINTER REACTIVE</span>
            </div>
          </div>

          <div className="scroll-cue">
            <span>SCROLL TO EXPLORE</span>
            <i />
          </div>
        </section>

        <section className="proof section-grid" aria-label="关键成果">
          <p className="proof-intro">不是概念演示。是已经进入真实业务的 AI 产品。</p>
          <div className="metric-list">
            {metrics.map((metric) => (
              <div className="metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="work section-grid" id="work">
          <div className="section-heading" data-reveal>
            <p>SELECTED WORK / 2023—2026</p>
            <h2>
              不只展示做了什么，
              <br />
              更展示为什么这样做。
            </h2>
          </div>

          <div className="case-list">
            {cases.map((item) => (
              <article className={`case-card case-${item.index}`} key={item.index} data-reveal>
                <div className="case-meta">
                  <span>{item.index}</span>
                  <span>{item.type}</span>
                </div>
                <div className="case-copy">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <strong>{item.result}</strong>
                </div>
                <div className="case-visual" aria-hidden="true">
                  {item.index === '01' && <ArchitectureGraphic />}
                  {item.index === '02' && <GatewayGraphic />}
                  {item.index === '03' && <StudioGraphic />}
                </div>
                <footer>
                  <span>{item.detail}</span>
                  <span>{item.status}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="lab section-grid" id="lab">
          <div className="lab-copy" data-reveal>
            <p>BUILD, NOT JUST TALK.</p>
            <h2>Vibe Coding Lab</h2>
            <p>
              这里最终会放你亲手完成的 AI 小产品。当前 Demo 先用一个本地问答交互展示信息与动效结构。
            </p>
            <span className="demo-label">STATIC DEMO / 暂未连接大模型</span>
          </div>

          <div className="ask-panel" data-reveal>
            <div className="panel-bar">
              <span>ASK_ZIJIAN.AI</span>
              <span className="online-dot">LOCAL</span>
            </div>
            <div className="answer">
              <span>ANSWER / 001</span>
              <p>{demoAnswers[question]}</p>
            </div>
            <div className="question-list">
              {Object.keys(demoAnswers).map((item) => (
                <button
                  className={question === item ? 'is-active' : ''}
                  key={item}
                  onClick={() => setQuestion(item)}
                  type="button"
                >
                  <span>{item}</span>
                  <i>↗</i>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="experience section-grid" id="about">
          <div className="section-heading compact" data-reveal>
            <p>EXPERIENCE</p>
            <h2>从写代码，到对业务结果负责。</h2>
          </div>
          <div className="experience-list">
            {experiences.map((item) => (
              <article key={`${item.company}-${item.time}`} data-reveal>
                <time>{item.time}</time>
                <div>
                  <h3>{item.role}</h3>
                  <p>{item.company}</p>
                </div>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-needed section-grid">
          <div className="needed-title" data-reveal>
            <span>CONTENT MAP / 需要你补充</span>
            <h2>简历给出了结果，网站还需要过程、判断和证据。</h2>
            <p>下面的位置已经预留。后续你按项目逐步提供即可，不需要一次整理完。</p>
          </div>
          <div className="needed-grid">
            {contentRequests.map((group, index) => (
              <article key={group.title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="contact section-grid" id="contact">
          <div className="portrait-wrap" data-reveal>
            <img src="/portrait.png" alt="张子健个人肖像" />
            <span>PORTRAIT / CURRENT ASSET</span>
          </div>
          <div className="contact-copy" data-reveal>
            <p>LET’S BUILD SOMETHING USEFUL.</p>
            <h2>有复杂的 AI 问题？我们聊聊。</h2>
            <a href="mailto:1615962561@qq.com">1615962561@qq.com ↗</a>
            <small>更多公开渠道待补充：GitHub / 即刻 / LinkedIn</small>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>ZHANG ZIJIAN © 2026</span>
        <span>DESIGNED & VIBE CODED WITH INTENT</span>
      </footer>
    </div>
  )
}

function ArchitectureGraphic() {
  return (
    <div className="architecture-graphic">
      {['应用层', '模型层', '编排层', '资源层', '网关层'].map((layer, index) => (
        <div key={layer}>
          <span>0{index + 1}</span>
          <strong>{layer}</strong>
          <i />
        </div>
      ))}
    </div>
  )
}

function GatewayGraphic() {
  return (
    <div className="gateway-graphic">
      <div className="gateway-center">AI<br />GATEWAY</div>
      {['入口', '观测', '出口', '子网关'].map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
}

function StudioGraphic() {
  return (
    <div className="studio-graphic">
      <div><span>INPUT</span>分析一条投流素材</div>
      <div><span>AGENT</span>正在拆解脚本结构...</div>
      <div><span>OUTPUT</span><strong>可复用片段 08</strong></div>
      <i />
    </div>
  )
}

export default App
