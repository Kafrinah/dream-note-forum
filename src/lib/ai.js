// DeepSeek API 配置
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// 通用 AI 调用函数
export async function callDeepSeek(messages, temperature = 0.8) {
  console.log('API Key 前10位:', DEEPSEEK_API_KEY?.substring(0, 10))
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
      content: '你是一个梦境分析师。用温暖、诗意的语言帮用户补全和丰富梦境。'
    },
    {
      role: 'user',
      content: `请帮我补全这个梦境：${dreamContent}`
    }
  ]
  return await callDeepSeek(messages)
}

// 小说生成
export async function generateNovel(notes, dreams, additionalPrompt = '') {
  const notesText = notes.slice(0, 5).map(n => `【笔记】${n.title}: ${n.content.substring(0, 300)}`).join('\n')
  const dreamsText = dreams.slice(0, 5).map(d => `【梦境】${d.title}: ${d.content.substring(0, 300)}`).join('\n')
  
  const messages = [
    {
      role: 'system',
      content: '你是一个创意小说家。请基于用户提供的素材创作一篇短篇小说，如果没有足够素材，可以适当发挥想象。'
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
      content: '你是一个温柔的知识助手，帮助用户理解和关联他们的笔记内容。如果没有足够信息，可以提供一般性的建议和指导。'
    },
    {
      role: 'user',
      content: `基于以下内容回答问题：\n\n${context}\n\n问题：${question}`
    }
  ]
  return await callDeepSeek(messages, 0.7)
}

// 思维导图生成
export async function generateMindMap(content) {
  const messages = [
    {
      role: 'system',
      content: '你是一个思维导图生成器。请分析内容，返回 JSON 格式的导图数据。'
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
      content: '你是一个知识关联引擎。请找出最相关的已有内容并说明理由。'
    },
    {
      role: 'user',
      content: `新内容：${content}\n\n已有内容：\n${entriesText}\n\n请找出最相关的 3-5 条并说明理由。`
    }
  ]
  return await callDeepSeek(messages, 0.6)
}