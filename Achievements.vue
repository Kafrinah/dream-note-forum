<template>
  <div class="achievements-page">
    <h1 class="page-title">🏆 成就系统</h1>
    <p class="page-subtitle">完成挑战，解锁成就。点击已完成的成就领取奖励！</p>

    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-icon">📝</span>
        <span class="stat-value">{{ stats.diaryCount }}</span>
        <span class="stat-label">日记</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🌙</span>
        <span class="stat-value">{{ stats.dreamCount }}</span>
        <span class="stat-label">梦境</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📋</span>
        <span class="stat-value">{{ stats.postCount }}</span>
        <span class="stat-label">帖子</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">❤️</span>
        <span class="stat-value">{{ stats.likesReceived }}</span>
        <span class="stat-label">获赞</span>
      </div>
    </div>

    <div class="achievements-grid">
      <div 
        v-for="ach in achievements" 
        :key="ach.id" 
        class="achievement-card"
        :class="{ unlocked: ach.unlocked, claimed: ach.claimed }"
      >
        <div class="achievement-icon">
          {{ getAchievementIcon(ach) }}
        </div>
        <div class="achievement-info">
          <h3>{{ ach.name }}</h3>
          <p>{{ ach.description }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: ach.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ ach.current }} / {{ ach.target }}</span>
        </div>
        <div class="achievement-action">
          <div v-if="ach.unlocked && !ach.claimed" class="reward-badge">
            奖励：{{ ach.reward_value }} 个贴纸位
          </div>
          <button 
            v-if="ach.unlocked && !ach.claimed" 
            @click="claimReward(ach)" 
            class="claim-btn"
          >
            领取奖励
          </button>
          <div v-else-if="ach.claimed" class="claimed-badge">
            已领取
          </div>
          <div v-else-if="!ach.unlocked" class="locked-badge">
            未完成
          </div>
        </div>
      </div>
    </div>

    <!-- 新成就通知 -->
    <div v-if="newAchievements.length > 0" class="notification">
      <div class="notification-content">
        <span class="notification-icon">🎉</span>
        <div>
          <strong>恭喜解锁新成就！</strong>
          <div v-for="ach in newAchievements" :key="ach.id">
            {{ ach.name }}
          </div>
        </div>
        <button @click="newAchievements = []" class="close-btn">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #A9C9C4, #614A44);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
}

.stats-card {
  display: flex;
  gap: 20px;
  background: #faf6ee;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  justify-content: space-around;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #A9C9C4, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #897d7a;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: #faf6ee;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 16px;
  position: relative;
  transition: all 0.2s;
  border: 1px solid #fef3f1;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

/* 手机端成就卡片适配 */
@media (max-width: 490px) {
  .achievement-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px;
    gap: 12px;
  }
  
  .achievement-icon {
    font-size: 36px;
  }
  
  .achievement-info {
    text-align: center;
  }
  
  .achievement-action {
    min-width: auto;
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
  
  .reward-badge {
    white-space: normal;
    text-align: center;
  }
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #fef3f1;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.achievement-card.claimed {
  background: linear-gradient(135deg, #F9EDD7, #A9C9C4);
  border-color: #fef3f1;
}

.achievement-icon {
  font-size: 48px;
  background: linear-gradient(135deg, #614A44, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.achievement-info p {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: #938682;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
}

.achievement-action {
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.reward-badge {
  font-size: 11px;
  color: #d97706;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.claim-btn {
  background: #A9C9C4;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-btn:hover {
  background: #A9C9C4;
  transform: scale(1.05);
}

.claimed-badge {
  font-size: 12px;
  color: #857d7b;
  font-weight: 600;
}

.locked-badge {
  font-size: 12px;
  color: #9ca3af;
}

.notification {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #A9C9C4;
  color: white;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 12px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'
import { getAchievementsWithStatus, getUserStats, checkAndUnlockAchievements } from '../lib/achievements.js'

const achievements = ref([])
const stats = ref({ diaryCount: 0, dreamCount: 0, postCount: 0, likesReceived: 0 })
const newAchievements = ref([])
const user = ref(null)
const claimedRewards = ref([])

const getAchievementIcon = (ach) => {
  if (ach.name.includes('日记')) return '📝'
  if (ach.name.includes('梦')) return '🌙'
  if (ach.name.includes('创作') || ach.name.includes('初现')) return '✍️'
  if (ach.name.includes('人气') || ach.name.includes('万人迷')) return '❤️'
  if (ach.name.includes('捕梦')) return '🪄'
  return '🏆'
}

// 加载已领取的奖励
const loadClaimedRewards = async () => {
  const { data } = await supabase
    .from('user_rewards')
    .select('achievement_id')
    .eq('user_id', user.value.id)
  claimedRewards.value = data?.map(r => r.achievement_id) || []
}

// 创建贴纸位
const createStickerSlot = async (slotIndex) => {
  const { data: existing } = await supabase
    .from('sticker_slots')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('slot_index', slotIndex)
    .maybeSingle()
  
  if (existing) return false
  
  const { error } = await supabase
    .from('sticker_slots')
    .insert({
      user_id: user.value.id,
      slot_index: slotIndex,
      name: `贴纸位 ${slotIndex}`
    })
  
  return !error
}

// 领取奖励
const claimReward = async (ach) => {
  // 检查是否已领取
  const { data: existing } = await supabase
    .from('user_rewards')
    .select('*')
    .eq('user_id', user.value.id)
    .eq('achievement_id', ach.id)
    .maybeSingle()
  
  if (existing) {
    alert('已经领取过了')
    return
  }
  
  // 获取当前最大的贴纸位索引
  const { data: slots } = await supabase
    .from('sticker_slots')
    .select('slot_index')
    .eq('user_id', user.value.id)
    .order('slot_index', { ascending: false })
    .limit(1)
  
  const nextIndex = (slots && slots[0] ? slots[0].slot_index : 0) + 1
  
  // 创建贴纸位
  const slotCount = ach.reward_value || 1
  let successCount = 0
  
  for (let i = 0; i < slotCount; i++) {
    const success = await createStickerSlot(nextIndex + i)
    if (success) successCount++
  }
  
  if (successCount > 0) {
    // 记录已领取
    await supabase
      .from('user_rewards')
      .insert({
        user_id: user.value.id,
        achievement_id: ach.id
      })
    
    // 更新本地状态
    claimedRewards.value.push(ach.id)
    achievements.value = achievements.value.map(a => {
      if (a.id === ach.id) {
        return { ...a, claimed: true }
      }
      return a
    })
    
    alert(`领取成功！获得 ${successCount} 个贴纸位`)
  } else {
    alert('领取失败')
  }
}

const loadData = async () => {
  if (!user.value) return
  
  // 检查新成就
  const newly = await checkAndUnlockAchievements(user.value.id)
  if (newly.length > 0) {
    newAchievements.value = newly
    setTimeout(() => {
      newAchievements.value = []
    }, 5000)
  }
  
  // 获取成就列表（带领取状态）
  const rawAchievements = await getAchievementsWithStatus(user.value.id)
  await loadClaimedRewards()
  
  achievements.value = rawAchievements.map(ach => ({
    ...ach,
    claimed: claimedRewards.value.includes(ach.id),
    reward_value: 1
  }))
  
  // 获取统计数据
  stats.value = await getUserStats(user.value.id)
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadData()
})
</script>