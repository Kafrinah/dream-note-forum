<template>
  <div class="achievements-page">
    <h1 class="page-title">🏆 成就系统</h1>
    <p class="page-subtitle">完成挑战，解锁成就</p>

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
        :class="{ unlocked: ach.unlocked }"
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
        <div v-if="ach.unlocked" class="unlocked-badge">✅</div>
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
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

.stats-card {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #6366f1;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 16px;
  position: relative;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.achievement-card.unlocked {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
}

.achievement-icon {
  font-size: 48px;
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
  background: #6366f1;
  border-radius: 3px;
  transition: width 0.3s;
}

.achievement-card.unlocked .progress-fill {
  background: #f59e0b;
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
}

.unlocked-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 20px;
}

.notification {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #10b981;
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

const getAchievementIcon = (ach) => {
  if (ach.name.includes('日记')) return '📝'
  if (ach.name.includes('梦')) return '🌙'
  if (ach.name.includes('创作') || ach.name.includes('初现')) return '✍️'
  if (ach.name.includes('人气') || ach.name.includes('万人迷')) return '❤️'
  if (ach.name.includes('捕梦')) return '🪄'
  return '🏆'
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
  
  // 获取成就列表
  achievements.value = await getAchievementsWithStatus(user.value.id)
  
  // 获取统计数据
  stats.value = await getUserStats(user.value.id)
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadData()
})
</script>