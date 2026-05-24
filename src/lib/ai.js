// DeepSeek API 配置
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 通用 AI 调用函数
async function callDeepSeek(messages, temperature = 0.8) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: temperature,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 梦境补全
export async function completeDream(dreamContent) {
  const messages = [
    {
      role: 'system',
      content: '你是一个梦境分析师和创意作家。用户会给你一个梦境的碎片描述，请你用温暖、诗意的语言帮他们补全和丰富这个梦境，让它变得更完整、更有画面感。保持梦幻和超现实的风格，不要过于理性。'
    },
    {
      role: 'user',
      content: `请帮我补全这个梦境：${dreamContent}`
    }
  ]
  return await callDeepSeek(messages)
}

// 小说生成（基于笔记和梦境）
export async function generateNovel(notes, dreams, additionalPrompt = '') {
  const notesText = notes.slice(0, 5).map(n => `【笔记】${n.title}: ${n.content.substring(0, 300)}`).join('\n')
  const dreamsText = dreams.slice(0, 5).map(d => `【梦境】${d.title}: ${d.content.substring(0, 300)}`).join('\n')
  
  const messages = [
    {
      role: 'system',
      content: '你是一个创意小说家。用户会给你一些个人笔记和梦境记录，请你基于这些素材创作一篇短篇小说。保持原创性，融合素材中的元素，写出有情感的短篇故事。'
    },
    {
      role: 'user',
      content: `请基于以下素材创作一篇短篇小说：\n\n${notesText}\n\n${dreamsText}\n\n额外要求：${additionalPrompt || '无'}`
    }
  ]
  return await callDeepSeek(messages, 0.9)
}

// 知识问答助手
export async function askAssistant(context, question) {
  const messages = [
    {
      role: 'system',
      content: '你是一个温柔的知识助手，帮助用户理解和关联他们的笔记内容。回答要简洁、有帮助，如果不知道就说不知道。'
    },
    {
      role: 'user',
      content: `基于以下内容回答问题：\n\n${context}\n\n问题：${question}`
    }
  ]
  return await callDeepSeek(messages, 0.7)
}

// 笔记自动生成导图结构
export async function generateMindMap(content) {
  const messages = [
    {
      role: 'system',
      content: '你是一个思维导图生成器。请分析用户输入的内容，提取出核心主题和子主题，返回 JSON 格式的导图数据。格式如：{"name": "主题", "children": [{"name": "子主题1", "children": []}, {"name": "子主题2", "children": []}]}'
    },
    {
      role: 'user',
      content: `请为以下内容生成思维导图：${content}`
    }
  ]
  const result = await callDeepSeek(messages, 0.5)
  try {
    return JSON.parse(result)
  } catch {
    return { name: '笔记导图', children: [] }
  }
}

// 关联知识点推荐
export async function findRelatedKnowledge(content, userEntries) {
  const entriesText = userEntries.slice(0, 10).map(e => `【${e.type}】${e.title}: ${e.content.substring(0, 200)}`).join('\n')
  
  const messages = [
    {
      role: 'system',
      content: '你是一个知识关联引擎。用户会给你一篇新内容，以及他之前写过的笔记和梦境列表。请找出最相关的 3-5 条之前的内容，并解释为什么相关。返回格式：每条以 "- " 开头。'
    },
    {
      role: 'user',
      content: `新内容：${content}\n\n已有内容列表：\n${entriesText}\n\n请找出最相关的已有内容并说明理由。`
    }
  ]
  return await callDeepSeek(messages, 0.6)
}