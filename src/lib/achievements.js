import { supabase } from './supabase.js'

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
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .order('id')
  return data || []
}

// 获取用户已解锁的成就ID
export async function getUserUnlockedAchievements(userId) {
  const { data } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)
  return data?.map(a => a.achievement_id) || []
}

// 检查并解锁成就
export async function checkAndUnlockAchievements(userId) {
  const stats = await getUserStats(userId)
  const allAchievements = await getAllAchievements()
  const unlockedIds = await getUserUnlockedAchievements(userId)
  
  const newlyUnlocked = []
  
  for (const ach of allAchievements) {
    if (unlockedIds.includes(ach.id)) continue
    
    let achieved = false
    switch (ach.condition_type) {
      case 'diary_count':
        achieved = stats.diaryCount >= ach.condition_value
        break
      case 'dream_count':
        achieved = stats.dreamCount >= ach.condition_value
        break
      case 'post_count':
        achieved = stats.postCount >= ach.condition_value
        break
      case 'like_received':
        achieved = stats.likesReceived >= ach.condition_value
        break
    }
    
    if (achieved) {
      // 插入用户成就记录
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: ach.id
        })
      newlyUnlocked.push(ach)
    }
  }
  
  return newlyUnlocked
}

// 获取带解锁状态的成就列表
export async function getAchievementsWithStatus(userId) {
  const [allAchievements, unlockedIds] = await Promise.all([
    getAllAchievements(),
    getUserUnlockedAchievements(userId)
  ])
  
  const stats = await getUserStats(userId)
  
  return allAchievements.map(ach => {
    let current = 0
    let target = ach.condition_value
    
    switch (ach.condition_type) {
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