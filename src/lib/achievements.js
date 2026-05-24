import { supabase } from './supabase.js'

// 成就定义
export const ACHIEVEMENTS = [
  { id: 1, name: '初次执笔', desc: '写下第一篇日记', type: 'diary_count', value: 1, stickerSlots: 1 },
  { id: 2, name: '日记爱好者', desc: '写下10篇日记', type: 'diary_count', value: 10, stickerSlots: 1 },
  { id: 3, name: '日记大师', desc: '写下30篇日记', type: 'diary_count', value: 30, stickerSlots: 1 },
  { id: 4, name: '捕梦者', desc: '记录5个梦境', type: 'dream_count', value: 5, stickerSlots: 1 },
  { id: 5, name: '梦之精灵', desc: '记录30个梦境', type: 'dream_count', value: 30, stickerSlots: 1 },
  { id: 6, name: '初现锋芒', desc: '发布1个帖子', type: 'post_count', value: 1, stickerSlots: 1 },
  { id: 7, name: '创作新星', desc: '发布5个帖子', type: 'post_count', value: 5, stickerSlots: 1 },
  { id: 8, name: '创作大师', desc: '发布20个帖子', type: 'post_count', value: 20, stickerSlots: 1 },
  { id: 9, name: '小有名气', desc: '收到10个点赞', type: 'like_received', value: 10, stickerSlots: 1 },
  { id: 10, name: '万人迷', desc: '收到100个点赞', type: 'like_received', value: 100, stickerSlots: 1 }
]

// 获取用户统计数据
export async function getUserStats(userId) {
  // 日记数量
  const { count: diaryCount } = await supabase
    .from('user_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'diary')
  
  // 梦境数量
  const { count: dreamCount } = await supabase
    .from('user_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'dream')
  
  // 帖子数量
  const { count: postCount } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  // 收到的点赞总数
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('likes')
    .eq('user_id', userId)
  
  const likesReceived = posts?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0
  
  return { diaryCount, dreamCount, postCount, likesReceived }
}

// 获取所有成就定义
export async function getAllAchievements() {
  return ACHIEVEMENTS
}

// 获取用户已解锁的成就ID
export async function getUserUnlockedAchievements(userId) {
  const { data } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)
  return data?.map(a => a.achievement_id) || []
}

// 创建贴纸位
async function createStickerSlot(userId, slotIndex) {
  // 检查是否已存在该索引的贴纸位
  const { data: existing } = await supabase
    .from('sticker_slots')
    .select('id')
    .eq('user_id', userId)
    .eq('slot_index', slotIndex)
    .maybeSingle()
  
  if (existing) return
  
  await supabase
    .from('sticker_slots')
    .insert({
      user_id: userId,
      slot_index: slotIndex,
      name: `贴纸位 ${slotIndex}`
    })
}

// 检查并解锁成就
export async function checkAndUnlockAchievements(userId) {
  const stats = await getUserStats(userId)
  const allAchievements = await getAllAchievements()
  const unlockedIds = await getUserUnlockedAchievements(userId)
  
  const newlyUnlocked = []
  
  // 获取当前已有的贴纸位数量
  const { count: currentSlotCount } = await supabase
    .from('sticker_slots')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  let nextSlotIndex = (currentSlotCount || 0) + 1
  
  for (const ach of allAchievements) {
    if (unlockedIds.includes(ach.id)) continue
    
    let achieved = false
    switch (ach.type) {
      case 'diary_count':
        achieved = stats.diaryCount >= ach.value
        break
      case 'dream_count':
        achieved = stats.dreamCount >= ach.value
        break
      case 'post_count':
        achieved = stats.postCount >= ach.value
        break
      case 'like_received':
        achieved = stats.likesReceived >= ach.value
        break
    }
    
    if (achieved) {
      // 插入用户成就记录
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: ach.id
        })
      
      if (!error) {
        newlyUnlocked.push(ach)
        
        // 解锁贴纸位
        const slotCount = ach.stickerSlots || 1
        for (let i = 0; i < slotCount; i++) {
          await createStickerSlot(userId, nextSlotIndex)
          nextSlotIndex++
        }
      }
    }
  }
  
  return newlyUnlocked
}

// 获取带解锁状态的成就列表
export async function getAchievementsWithStatus(userId) {
  const allAchievements = await getAllAchievements()
  const unlockedIds = await getUserUnlockedAchievements(userId)
  const stats = await getUserStats(userId)
  
  return allAchievements.map(ach => {
    let current = 0
    let target = ach.value
    
    switch (ach.type) {
      case 'diary_count':
        current = stats.diaryCount
        break
      case 'dream_count':
        current = stats.dreamCount
        break
      case 'post_count':
        current = stats.postCount
        break
      case 'like_received':
        current = stats.likesReceived
        break
    }
    
    return {
      ...ach,
      unlocked: unlockedIds.includes(ach.id),
      current,
      target,
      progress: Math.min(100, Math.floor((current / target) * 100))
    }
  })
}