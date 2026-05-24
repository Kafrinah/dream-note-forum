import { supabase } from './supabase.js'

// 本地敏感词库（中文 + 英文基础版）
const localBadWords = [
  // 中文敏感词
  '操', '妈逼', '傻逼', '混蛋', '垃圾', '尼玛', '他妈', '我操', '日你', '贱人',
  '废物', '蠢货', '白痴', '脑残', '去死', '自杀', '强奸', '强奸犯', '杀人',
  '毒品', '吸毒', '贩毒', '色情', '黄片', 'AV', '性交', '操你', '操你妈',
  '他妈的', '特么的', '妈的', '卧槽', '草泥马', '婊子', '妓女', '嫖娼',
  
  // 英文敏感词（大小写不敏感）
  'fuck', 'shit', 'damn', 'asshole', 'bitch', 'bastard', 'whore',
  'cunt', 'dick', 'pussy', 'nigger', 'chink', 'gook',
  'idiot', 'stupid', 'moron', 'retard', 'loser'
]

// 加载数据库中的敏感词（可选扩展）
export async function loadBadWordsFromDB() {
  const { data } = await supabase
    .from('bad_words')
    .select('word')
  if (data) {
    return data.map(w => w.word.toLowerCase())
  }
  return []
}

// 检测文本是否包含敏感词
export async function containsBadWords(text) {
  if (!text) return false
  
  const lowerText = text.toLowerCase()
  const allWords = [...localBadWords]
  
  // 尝试从数据库加载额外敏感词（可选）
  try {
    const dbWords = await loadBadWordsFromDB()
    allWords.push(...dbWords)
  } catch(e) {}
  
  for (const word of allWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return true
    }
  }
  return false
}

// 过滤敏感词（替换为 ***）
export async function filterBadWords(text) {
  if (!text) return text
  
  let result = text
  const allWords = [...localBadWords]
  
  try {
    const dbWords = await loadBadWordsFromDB()
    allWords.push(...dbWords)
  } catch(e) {}
  
  for (const word of allWords) {
    const regex = new RegExp(word, 'gi')
    result = result.replace(regex, '***')
  }
  return result
}

// 检测并返回第一个发现的敏感词
export async function findFirstBadWord(text) {
  if (!text) return null
  
  const lowerText = text.toLowerCase()
  const allWords = [...localBadWords]
  
  try {
    const dbWords = await loadBadWordsFromDB()
    allWords.push(...dbWords)
  } catch(e) {}
  
  for (const word of allWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return word
    }
  }
  return null
}