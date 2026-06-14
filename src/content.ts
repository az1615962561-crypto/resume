export const profile = {
  name: '张子健',
  phone: '13853512111',
  email: '1615962561@qq.com',
}

export const education = {
  time: '2021-09 ~ 2025-06',
  school: '杭州师范大学',
  major: '软件工程（本科）',
}

export const advantages = [
  {
    title: '产品经验',
    text: '具备 AI Agent 中台、AI 网关系统、大模型训练平台等产品 0-1 落地经验，熟悉企业 AI 中台类产品全生命周期，擅长跨职能协同与上下游推进。',
  },
  {
    title: 'AI能力',
    text: '掌握 AI Agent 中台规划与 Agent 编排方法论，熟悉 LLM 技术体系，对机器学习与深度学习底层原理具备系统认知，持续跟踪 Agent 行业前沿。',
  },
  {
    title: '工具能力',
    text: '熟练 Axure、Figma、墨刀等原型工具；熟悉 CC、Codex 等 coder 工具，能以 Vibe Coding 方式独立搭建 MVP 原型并跑通上线；熟悉 SQL、Tableau 搭建数据看板；掌握 VUE、微信小程序、MySQL 等开发技术，与技术沟通理解成本低。',
  },
  {
    title: 'Owner 意识 & 抗压能力',
    text: '具备创业合伙人经历，曾合伙操盘运动科技产品从 0 到 1（选品、获客、运营、分润全链路），对业务目标与结果直接负责；习惯在资源有限、节奏高压的环境下快速决策、扛住不确定性并持续交付，敢于提出并坚持自身判断，可控推进细节落地与跨方沟通。',
  },
]

export type ResumeBullet = {
  title?: string
  text: string
  subItems?: string[]
  media?: Array<{
    file: string
    sourceName: string
    alt: string
  }>
}

export type ResumeMedia = {
  file: string
  sourceName: string
  alt: string
}

export type ResumeExperience = {
  section: string
  time: string
  company: string
  role: string
  bullets: ResumeBullet[]
  /** 段落级证据图（如创业经历的门店实拍） */
  media?: ResumeMedia[]
  /** 自有产品图（白底产品拆解图，单独成组展示） */
  productMedia?: ResumeMedia[]
  missingMedia?: string[]
}

export const experiences: ResumeExperience[] = [
  {
    section: '工作经历',
    time: '2025-06 ~ 至今',
    company: '乐其集团',
    role: 'AI产品经理',
    bullets: [
      {
        text: '从0到1 主导建立企业级 AI Agent 中台「尤里卡」，并主导其两次关键演进——业务转型与架构转型，推动尤里卡从单点能力平台升级为公司级 AI 中台底座。',
      },
      {
        title: '背景',
        text: '随着企业AI业务需求的爆发，传统大模型开发面临流程碎片化、资产难沉淀及业务落地门槛高等痛点。尤里卡旨在打造一个一站式全链路AI能力管理中台与低代码应用构建平台',
      },
      {
        title: '全链路能力模块规划',
        text: '覆盖 AI 能力接入、构建、调试、发布、运维全链路产品方案，规划 Agent 编排、Workflow 编排、RAG、MCP、Skill 技能、上下文与记忆管理等核心能力模块，系统性降低业务方 Agent 搭建与各产线 AI 接入门槛',
        media: [
          {
            file: 'eureka-orchestration.png',
            sourceName: '尤里卡应用编排.png',
            alt: '尤里卡应用编排产品界面',
          },
        ],
      },
      {
        title: 'AI × 业务融合',
        text: '作为「AI Studio」主导者，以 Vibe Coding 叠加尤里卡原子能力快速搭建业务开箱即用AI工具，落地短视频脚本检测、投流素材分析、脚本复刻等多套业务工具，平均为业务人员提高20%效率；并推动成熟Studio落到业务型产品，推动3条业务性产品向「业务 + AI」转型，显著提高业务需求响应速度。',
        media: [
          {
            file: 'ai-studio-home.png',
            sourceName: 'AIstudio页面.png',
            alt: 'AI Studio 产品首页',
          },
          {
            file: 'ai-studio-media.png',
            sourceName: 'AIstudio-投流素材分析.png',
            alt: '投流素材分析产品界面',
          },
          {
            file: 'ai-studio-script.png',
            sourceName: 'AIstuido-短视频脚本分析.png',
            alt: '短视频脚本分析产品界面',
          },
        ],
      },
      {
        title: '5 层架构方法论沉淀',
        text: '定义尤里卡「应用层 / 模型层 / 编排层 / 资源层 / 网关层」5 层产品架构，推动各层产品分阶段落地，构建公司 AI 中台资源底座，使公司级 AI 架构可沉淀、可管理、可观测并分发 AI 资源。',
      },
      {
        title: '引入Dify融合编排层',
        text: '调研开源 Agent 编排框架后，主导引入Dify 与尤里卡编排层融合，复用其编排能力体系，加速编排层标准化能力迭代、沉淀可视化编排能力；直接节省约3个季度开发人力，并释放后续相关功能开发资源。',
      },
      {
        title: '网关层 • AI 网关系统',
        text: '主导网关层「子网关、出口网关、观测网关、入口网关」四层 AI 网关架构划分，统一管控公司全部 AI 流量的出入、调度与观测，日均处理Token 10亿+。解决各业务线分散接入、API Key 管理分散、算力调度难、Token 成本失控与数据泄露等治理痛点。',
        media: [
          {
            file: 'gateway-observability.png',
            sourceName: '入口网关.png',
            alt: 'AI 入口网关产品界面',
          },
          {
            file: 'gateway-models.png',
            sourceName: '出口网关.png',
            alt: 'AI 出口网关产品界面',
          },
        ],
      },
      {
        title: '业务赋能验证',
        text: '已赋能阿宝坐席客服、Ucoach 等 10+AI 产线，并沉淀100+Agent应用库；平台日调用量10w+。',
      },
    ],
  },
  {
    section: '创业经历',
    time: '2023-10 ~ 2024-05',
    company: '苏州轻练健康科技有限公司',
    role: '合伙人',
    bullets: [
      {
        title: '0-1产品规划与市场匹配',
        text: '通过海外众筹平台及竞品分析，主导运动科技产品本土化改造，精准匹配国内用户对高性价比、沉浸式体验的需求，月流水达10w，利润率达32%，首月转化率达80%。',
      },
      {
        title: '用户增长与运营优化',
        text: '',
        subItems: [
          '1.搭建标准化门店SOE，基于25-35岁女性用户画像设计获客方案，单店日均获客量提升200%。',
          '2.打造沉浸用户体验场景，优化用户留存策略，推动月活跃用户（MAU）环比增长45%。',
        ],
      },
      {
        title: '行业痛点解决',
        text: '针对运动时间碎片化、教练管理低效等问题，降低运营成本30%',
      },
    ],
    media: [
      {
        file: 'qinglian-store-01.jpg',
        sourceName: '轻练门店',
        alt: '苏州轻练线下门店训练区',
      },
      {
        file: 'qinglian-store-02.jpg',
        sourceName: '轻练课程',
        alt: '沉浸式课程体验场景',
      },
      {
        file: 'qinglian-store-03.jpg',
        sourceName: '轻练品牌',
        alt: '门店前台与品牌墙',
      },
    ],
    productMedia: [
      {
        file: 'qinglian-product-01.png',
        sourceName: '超模训练机',
        alt: 'Gogo Tremble 超模训练机 · 自有工厂生产',
      },
      {
        file: 'qinglian-product-02.png',
        sourceName: '超模训练衣',
        alt: 'Gogo Pro 超模训练衣 · EMS 电脉冲技术',
      },
    ],
  },
  {
    section: '实习经历',
    time: '2024-10 ~ 2025-03',
    company: '杭州谐云科技有限公司',
    role: 'AI产品经理',
    bullets: [
      {
        title: '数据采集与标注',
        text: '参与模型训练数据集设计，选取文本标注分割策略；支持文本、图片、视频分类标签化标注，采取逐帧策略简化视频标注，缩短标注时间30%。',
      },
      {
        title: '算力平台设计',
        text: '参与完成算力平台设计，实现集群、节点、资源池三层算力架构划分，同时设立角色、租户分级管理；并基于MIG虚拟化方案优化算力架构功能点。使得算力调度可观测程度大大提高，充分利用分配算力资源。',
      },
      {
        title: '模型评估',
        text: '参与模型评估模块的设计，支持自定义上传模型库模型、测试数据集、测试镜像进行评测打分。',
      },
      {
        title: '跨团队写作与产品优化',
        text: '协调重庆数智与总部技术团队，推动重庆数智平台的按时上线。通过Scrum敏捷方法管理项目进度，基于用户反馈进行功能迭代优化，重点改善了模型在线测试，最终使算法工程师操作效率提高30%，客户满意度提升。',
      },
    ],
  },
]
