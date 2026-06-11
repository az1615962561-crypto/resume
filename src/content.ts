export type ProjectCategory = 'PLATFORM' | 'GOVERNANCE' | 'BUSINESS AI'

export type Project = {
  id: string
  index: string
  category: ProjectCategory
  title: string
  subtitle: string
  image: string
  result: string
  description: string
  tags: string[]
  featured?: boolean
}

export const metrics = [
  { value: '10亿+', label: '日均 Token 处理量', note: '企业级 AI 网关' },
  { value: '100+', label: 'Agent 应用沉淀', note: '跨 10+ 业务产线' },
  { value: '20%', label: '业务平均提效', note: 'AI Studio 工具集' },
  { value: '3季度', label: '研发投入节省', note: '开源能力融合决策' },
]

export const projects: Project[] = [
  {
    id: 'eureka-orchestration',
    index: '01',
    category: 'PLATFORM',
    title: '尤里卡 AI Agent 中台',
    subtitle: '把零散 AI 能力变成公司级生产系统',
    image: 'eureka-orchestration.png',
    result: '100+ AGENTS / 10万+ 日调用',
    description:
      '从 0 到 1 规划五层产品架构，覆盖模型接入、应用编排、知识库、资源管理、调试发布与企业治理。',
    tags: ['AGENT', 'WORKFLOW', 'RAG', 'MCP'],
    featured: true,
  },
  {
    id: 'gateway-observability',
    index: '02',
    category: 'GOVERNANCE',
    title: 'AI 网关观测中心',
    subtitle: '让稳定性、容量、安全与成本可被管理',
    image: 'gateway-observability.png',
    result: '10亿+ TOKEN / DAY',
    description:
      '用统一观测视角承接多模型、多团队和多业务流量，让异常、容量和成本从黑盒变成决策依据。',
    tags: ['OBSERVABILITY', 'CAPACITY', 'COST'],
  },
  {
    id: 'gateway-models',
    index: '03',
    category: 'GOVERNANCE',
    title: '模型出口网关',
    subtitle: '统一模型、凭证、授权与调用策略',
    image: 'gateway-models.png',
    result: '4-LAYER GATEWAY',
    description:
      '围绕子网关、出口、观测与入口四层治理模型，解决 Key 管理、路由、数据安全和用量核算。',
    tags: ['MODEL ROUTING', 'KEY', 'SECURITY'],
  },
  {
    id: 'ai-studio',
    index: '04',
    category: 'BUSINESS AI',
    title: 'Eureka AI Studio',
    subtitle: '从中台原子能力到业务可用工具',
    image: 'ai-studio-home.png',
    result: '3 条产品线完成 AI 化',
    description:
      '将 Agent、模型与知识能力包装成业务人员可直接使用的工作台，用更短反馈链验证业务价值。',
    tags: ['VIBE CODING', 'MVP', 'AI TOOL'],
    featured: true,
  },
  {
    id: 'media-analysis',
    index: '05',
    category: 'BUSINESS AI',
    title: '投流素材效果分析',
    subtitle: '把视频素材判断拆成可执行工作流',
    image: 'ai-studio-media.png',
    result: '平均效率提升 20%',
    description:
      '支持素材导入、规则配置和结构化分析，减少运营人员在重复观看、摘录与横向比较上的时间。',
    tags: ['MULTIMODAL', 'ANALYSIS', 'OPS'],
  },
  {
    id: 'script-analysis',
    index: '06',
    category: 'BUSINESS AI',
    title: '短视频脚本复刻',
    subtitle: '把爆款拆解能力产品化',
    image: 'ai-studio-script.png',
    result: 'IDEA → WORKING MVP',
    description:
      '从业务问题、提示词结构到可编辑结果页，以 Vibe Coding 快速完成原型和可用版本的闭环。',
    tags: ['PROMPT', 'CONTENT', 'PROTOTYPE'],
  },
]

export const capabilities = [
  {
    number: '01',
    title: 'Product',
    cn: '产品判断',
    description: '把模糊的业务诉求拆成用户、场景、约束与可验证指标。',
    items: ['0—1 产品规划', '业务流程重构', '需求优先级与取舍', '增长与商业化'],
  },
  {
    number: '02',
    title: 'Systems',
    cn: '系统设计',
    description: '在模型能力、工程成本和企业治理之间建立可演进的产品结构。',
    items: ['Agent / Workflow', 'AI Gateway', 'RAG / MCP / Memory', '模型训练与评估平台'],
  },
  {
    number: '03',
    title: 'Build',
    cn: '快速构建',
    description: '用原型与代码缩短讨论周期，让关键假设尽早进入真实反馈。',
    items: ['Vibe Coding', 'React / Vue', 'Figma / Axure', 'SQL / 数据分析'],
  },
]

export const experiences = [
  {
    time: '2025.06 — NOW',
    role: 'AI 产品经理',
    company: '乐其集团',
    summary: '负责企业级 AI Agent 中台、四层 AI 网关与 AI Studio，推动 10+ 业务产线 AI 化。',
    code: 'AI INFRA / BUSINESS AI',
  },
  {
    time: '2024.10 — 2025.03',
    role: 'AI 产品经理',
    company: '杭州谐云科技有限公司',
    summary: '参与数据标注、算力调度、模型训练与评估平台，跨算法和工程团队推进交付。',
    code: 'MLOPS / PLATFORM',
  },
  {
    time: '2023.10 — 2024.05',
    role: '合伙人',
    company: '苏州轻练健康科技有限公司',
    summary: '从产品、获客到运营参与运动科技业务 0—1，月营收 10 万，毛利率 32%。',
    code: '0—1 / GROWTH',
  },
]
