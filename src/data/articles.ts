export interface Article {
  id: number
  title: string
  createTime: string
  views: number
  cover: string
  content: string
  description?: string
  tags?: string[]
  category?: string
}

export interface TimelineYear {
  year: string
  articles: Article[]
}

export const timelineData: TimelineYear[] = [
  {
    year: '2025',
    articles: [
      {
        id: 1,
        title: 'Cloudflare/Vercel项目推荐(3)',
        createTime: '2025-01-14',
        views: 558,
        cover: '/articles/cover/3.jpg',
        content: `# Cloudflare/Vercel项目推荐

## 前言
这是一篇关于云服务的详细文章。

## 主要内容
1. Cloudflare Workers
2. Vercel Serverless Functions
3. Edge Computing

## 技术细节
\`\`\`javascript
const worker = new Worker();
console.log("Hello from Worker!");
\`\`\`

> 这是一个重要的引用

更多内容请继续阅读...`,
        description: '推荐一些基于 Cloudflare/Vercel 的优质开源项目',
        tags: ['Cloudflare', 'Vercel', '项目推荐', '开源'],
        category: '技术分享'
      },
      {
        id: 2,
        title: 'CSS属性计算过程详解',
        createTime: '2025-05-14',
        views: 558,
        cover: '/articles/cover/3.jpg',
        content: `# CSS 属性计算过程

## 你是否了解 CSS 的属性计算过程呢？

有的同学可能会讲，CSS属性我倒是知道，例如：

\`\`\`css
p {
  color: red;
}
\`\`\`

上面的 CSS 代码中，p 是元素选择器，color 就是其中的一个 CSS 属性。

但是要说 CSS 属性的计算过程，还真的不是很清楚。

### 没关系，通过此篇文章，能够让你彻底明白什么是 CSS 属性的计算流程。

![CSS属性计算流程](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2022-08-13-060434.png)

#### 首先，不知道你有没有考虑过这样的一个问题，假设在 HTML 中有这么一段代码：

\`\`\`html
<body>
  <h1>这是一个h1标题</h1>
</body>
\`\`\`

### 比较优先级

那么接下来，如果是在在同一个源中有样式声明冲突怎么办呢？此时就会进行样式声明的优先级比较。

例如：

\`\`\`html
<div class="test">
  <h1>test</h1>
</div>
\`\`\`

\`\`\`css
.test h1 {
  font-size: 50px;
}

h1 {
  font-size: 20px;
}
\`\`\`

在上面的代码中，同属于**页面作者样式**，源的重要性是相同的，此时会以选择器的权重来比较重要性。

很明显，上面的选择器的权重要大于下面的选择器，因此最终标题呈现为 *50px*。

对应的结果如下：

| 元素    | 包含块                      |
| ------- | --------------------------- |
| html    | initial C.B. (UA-dependent) |
| body    | html                        |
| div1    | body                        |
| p1      | div1                        |
| p2      | div1                        |
| em1     | p2                          |
| strong1 | p2                          |

首先 HTML 作为根元素，对应的包含块就是前面我们所说的初始包含块，而对于 body 而言，这是一个 static 定位的元素，因此该元素的包含块参照第一条为 html，以此类推 div1、p1、p2 以及 em1 的包含块也都是它们的父元素。

不过 strong1 比较例外，它的包含块确实 p2，而非 em1。为什么会这样？建议你再把非根元素的第一条规则读一下：

- 如果元素的 positiion 是 relative 或 static ，那么包含块由离它最近的**块容器（block container）**的内容区域（content area）的边缘建立。

![选择器权重比较](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-16-071546.png)

更多内容请参考：[MDN Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)`,
        description: 'CSS属性计算过程的详细解析',
        tags: ['CSS', '前端', '技术文章'],
        category: '技术分享'
      }
    ]
  },
  {
    year: '2024',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2024-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '2024年终总结',
        tags: ['年终总结', '生活感悟', '2024'],
        category: '日常分享'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享',
        tags: ['面试', '华为', '经验分享', '求职'],
        category: '学习资料'
      }
    ]
  },
  {
    year: '2023',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2024-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '2024年终总结',
        category: '年度总结'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  },
  {
    year: '2022',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2022-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...1223132',
        description: '2024年终总结'
      },
      {
        id: 3,
        title: 'test',
        createTime: '2022-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Modi, hic.
        Placeat ut commodi id dolores iure ipsa fugiat esse. Autem?
        Minima nihil ex voluptatum officia architecto fuga vitae sit earum?
        Cum harum animi dolorum molestias adipisci iure praesentium doloribus tempore?
        Officia neque porro fugit velit ex similique? Delectus, tempora dolorem.
        Alias deleniti nesciunt similique consequatur porro odio tempora quod. Repudiandae.
        Soluta hic omnis quos debitis a iure obcaecati molestias cupiditate.
        Deserunt voluptatibus voluptatem velit officia nam? Omnis aliquam culpa provident!
        Pariatur aperiam aliquid fugit recusandae odit officia quidem culpa velit.
        Adipisci ad amet nisi consequatur excepturi nostrum sed voluptatibus quas!
        Cum, quia. Eveniet nisi in fuga expedita eius iure tempore?
        Nobis odit error numquam consectetur voluptate amet repudiandae. Expedita, alias!
        Voluptatum numquam, cum tempore ullam minus quidem error natus aliquam.
        Et consequuntur maiores eaque optio, officia quam dolor molestiae suscipit!
        Nam ut maiores officiis laborum sunt recusandae exercitationem repellat! Delectus.
        Possimus neque asperiores ut eveniet quaerat nam veniam error quas.
        Illo, deserunt rerum ipsam temporibus blanditiis facilis fugiat repudiandae nam!
        Ad nemo dolore magnam necessitatibus odio perspiciatis earum eum a.
        Doloremque aut tenetur minima dolor exercitationem? Qui doloremque aperiam quos!
        Esse expedita id nam veritatis fuga voluptatem sit, numquam inventore.
        Quo obcaecati omnis tenetur eveniet excepturi mollitia, laudantium voluptates blanditiis.
        Excepturi autem quas similique tempore vitae quidem cum quod libero.
        Aperiam molestiae quod, ducimus aspernatur saepe nulla porro? Nobis, dolorum.
        Assumenda totam quasi illum. Voluptatibus recusandae non accusamus maxime quaerat.
        Doloremque quasi distinctio deleniti ipsa nesciunt quo beatae voluptas quis.`,
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2022-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  },
  {
    year: '2021',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2021-07-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '2024年终总结'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2021-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2021-05-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        content: '# Cloudflare/Vercel项目推荐\n\n这是一篇关于云服务的文章...',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  }
]

export const getArticleById = (id: number): Article | undefined => {
  for (const year of timelineData) {
    const article = year.articles.find(article => article.id === id)
    if (article) return article
  }
  return undefined
} 