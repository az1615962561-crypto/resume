import { advantages, education, experiences, profile } from './content'

/**
 * 纯前端的简历检索问答引擎。
 *
 * 不依赖任何外部模型 / 接口：把简历里的每一段内容建成一个小语料库，
 * 用户提问时对中文做「二元分词（bigram）+ IDF 加权」打分，返回最相关的一段作为答案。
 * 完全离线、零成本，回答内容始终来自简历原文。
 */

export type AnswerSource = {
  label: string
  anchor: string
}

export type SearchHit = {
  answer: string
  source?: AnswerSource
}

export type Faq = {
  question: string
  answer: string
}

type Entry = SearchHit & {
  /** 用于匹配的可搜索文本 */
  keywords: string
  /** 预计算的词频表（词 → 出现次数） */
  termFreq: Map<string, number>
}

/**
 * 停用词：常见的疑问词 / 问句骨架。
 * 这些词信息量低，却可能只出现在某一条里导致 IDF 偏高、引发误匹配，
 * 所以在「查询」阶段把它们剔除，只用真正的内容词去打分。
 */
const STOP_WORDS = new Set([
  '怎么', '什么', '怎样', '多少', '为什', '是什', '是不', '有没', '哪些', '哪个',
  '哪里', '是否', '可以', '能不', '你的', '你们', '我们', '介绍', '告诉', '一下',
  '今天', '现在', '一些', '这个', '那个', '关于', '有关', '做过', '请问', '想问',
  '一个', '一样', '么样', '气怎', '系你', '于你', '下你',
  '的', '了', '吗', '呢', '啊', '吧', '嘛', '呀', '什', '么', '怎', '样', '多', '少',
])

/** 把一段文本切成检索用的词：中文取二元组，英文/数字取整词。 */
function tokenize(input: string): string[] {
  const tokens: string[] = []
  const matches = input.toLowerCase().match(/[一-鿿]+|[a-z0-9]+/g)
  if (!matches) return tokens

  for (const segment of matches) {
    if (/^[a-z0-9]/.test(segment)) {
      tokens.push(segment)
      continue
    }
    if (segment.length === 1) {
      tokens.push(segment)
      continue
    }
    for (let i = 0; i < segment.length - 1; i += 1) {
      tokens.push(segment.slice(i, i + 2))
    }
  }
  return tokens
}

const anchorForSection = (section: string): AnswerSource => {
  if (section === '工作经历') return { label: section, anchor: '#experience' }
  if (section === '创业经历') return { label: section, anchor: '#ventures' }
  if (section === '实习经历') return { label: section, anchor: '#internship' }
  return { label: section, anchor: '#experience' }
}

function buildEntries(faqs: Faq[]): Omit<Entry, 'termFreq'>[] {
  const entries: Omit<Entry, 'termFreq'>[] = []

  // 1. 预设问答（命中后给手写答案，质量最高）
  for (const faq of faqs) {
    entries.push({ answer: faq.answer, keywords: faq.question })
  }

  // 2. 个人优势
  for (const advantage of advantages) {
    entries.push({
      answer: `【${advantage.title}】${advantage.text}`,
      keywords: `${advantage.title} ${advantage.text} 个人优势 能力 擅长`,
      source: { label: '个人优势', anchor: '#advantages' },
    })
  }

  // 3. 各段经历：概览 + 每条亮点
  for (const experience of experiences) {
    const source = anchorForSection(experience.section)
    entries.push({
      answer: `${experience.section}：${experience.time} 在${experience.company}，担任${experience.role}。`,
      keywords: `${experience.section} ${experience.company} ${experience.role} ${experience.time} 经历 工作 职位`,
      source,
    })

    for (const bullet of experience.bullets) {
      const sub = bullet.subItems?.join(' ') ?? ''
      const text = bullet.text || sub
      if (!text) continue
      entries.push({
        answer: bullet.title ? `【${bullet.title}】${text}` : text,
        keywords: `${bullet.title ?? ''} ${bullet.text ?? ''} ${sub} ${experience.company} ${experience.section}`,
        source: {
          label: `${experience.section} · ${experience.company}`,
          anchor: source.anchor,
        },
      })
    }
  }

  // 4. 基本信息 + 教育背景
  const contact: AnswerSource = { label: '基本信息', anchor: '#contact' }
  entries.push({
    answer: `我叫${profile.name}。`,
    keywords: `姓名 名字 叫什么 怎么称呼 ${profile.name}`,
    source: contact,
  })
  entries.push({
    answer: `电话：${profile.phone}`,
    keywords: `电话 手机 手机号 号码 联系方式 联系 ${profile.phone}`,
    source: contact,
  })
  entries.push({
    answer: `邮箱：${profile.email}`,
    keywords: `邮箱 邮件 email mail 联系方式 联系 ${profile.email}`,
    source: contact,
  })
  entries.push({
    answer: `教育背景：${education.time}，${education.school}，${education.major}。`,
    keywords: `教育 教育背景 学历 学校 大学 专业 本科 毕业 ${education.school} ${education.major}`,
    source: { label: '教育背景', anchor: '#contact' },
  })

  return entries
}

export function createResumeSearch(faqs: Faq[]) {
  const raw = buildEntries(faqs)

  // 预计算每个条目的词频表，以及全语料的文档频率（用于 IDF）
  const docFreq = new Map<string, number>()
  const entries: Entry[] = raw.map((entry) => {
    const termFreq = new Map<string, number>()
    for (const term of tokenize(`${entry.keywords} ${entry.answer}`)) {
      termFreq.set(term, (termFreq.get(term) ?? 0) + 1)
    }
    for (const term of termFreq.keys()) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
    }
    return { ...entry, termFreq }
  })

  const total = entries.length
  const idf = (term: string) => Math.log(1 + total / ((docFreq.get(term) ?? 0) + 1))

  const MIN_SCORE = 1.2

  return function search(query: string): SearchHit | null {
    const trimmed = query.trim()
    if (!trimmed) return null

    // 与某条预设问题完全一致时，直接给手写答案
    const exactFaq = faqs.find((faq) => faq.question === trimmed)
    if (exactFaq) return { answer: exactFaq.answer }

    const queryTerms = [...new Set(tokenize(trimmed))].filter(
      (term) => !STOP_WORDS.has(term),
    )
    if (queryTerms.length === 0) return null

    let best: Entry | null = null
    let bestScore = 0

    for (const entry of entries) {
      let score = 0
      for (const term of queryTerms) {
        const tf = entry.termFreq.get(term)
        // 出现越多次、且该词越稀有，得分越高（出现次数做对数衰减，避免长文本霸榜）
        if (tf) score += idf(term) * (1 + Math.log(tf))
      }
      // 整句作为子串出现时给一点额外加权
      if (entry.keywords.includes(trimmed) || entry.answer.includes(trimmed)) {
        score += 1.5
      }
      if (score > bestScore) {
        bestScore = score
        best = entry
      }
    }

    if (!best || bestScore < MIN_SCORE) return null
    return { answer: best.answer, source: best.source }
  }
}
