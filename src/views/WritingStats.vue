<template>
  <div>
    <h1 class="page-title">📊 写作统计</h1>
    <p class="page-subtitle">记录你的每一次创作</p>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-value">{{ totalWords }}</div>
        <div class="stat-label">总字数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-value">{{ todayWords }}</div>
        <div class="stat-label">今日字数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-value">{{ totalEntries }}</div>
        <div class="stat-label">总篇数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"></div>
        <div class="stat-value">{{ streakDays }}</div>
        <div class="stat-label">连续写作天数</div>
      </div>
    </div>

    <!-- 各类型统计 -->
    <div class="section">
      <h2 class="section-title">按类型统计</h2>
      <div class="type-stats">
        <div v-for="type in typeStats" :key="type.name" class="type-item">
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-name">{{ type.name }}</span>
          <div class="type-bar">
            <div class="type-bar-fill" :style="{ width: type.percentage + '%' }"></div>
          </div>
          <span class="type-count">{{ type.count }} 篇</span>
          <span class="type-words">{{ type.words }} 字</span>
        </div>
      </div>
    </div>

    <!-- 本周趋势图 -->
    <div class="section">
      <h2 class="section-title">本周趋势</h2>
      <div class="chart-container">
        <div v-for="day in weekData" :key="day.date" class="chart-bar">
          <div class="bar" :style="{ height: day.height + 'px' }"></div>
          <span class="bar-label">{{ day.label }}</span>
          <span class="bar-value">{{ day.words }}</span>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="section">
      <h2 class="section-title">最近活动</h2>
      <div class="recent-list">
        <div v-for="entry in recentEntries" :key="entry.id" class="recent-item">
          <span class="recent-type">{{ getTypeIcon(entry.type) }}</span>
          <span class="recent-title">{{ entry.title }}</span>
          <span class="recent-words">{{ entry.word_count }} 字</span>
          <span class="recent-time">{{ formatDate(entry.created_at) }}</span>
        </div>
        <div v-if="recentEntries.length === 0" class="empty-tip">
          还没有任何写作记录，快去写点什么吧～
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #A9C9C4, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 32px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #807572;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.type-icon {
  font-size: 20px;
  width: 32px;
  background: linear-gradient(135deg, #F9EDD7, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.type-name {
  width: 70px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.type-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.type-bar-fill {
  height: 100%;
  background: #a49b98;
  border-radius: 4px;
  transition: width 0.3s;
}

.type-count, .type-words {
  font-size: 12px;
  color: #6b7280;
  min-width: 60px;
}

.chart-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  gap: 12px;
  padding: 20px 0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.bar {
  width: 100%;
  max-width: 50px;
  background: #A9C9C4;
  border-radius: 6px 6px 0 0;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-label {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}

.bar-value {
  font-size: 10px;
  color: #9ca3af;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 12px;
  flex-wrap: wrap;
}

.recent-type {
  font-size: 18px;
  background: linear-gradient(135deg, #F9EDD7, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.recent-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-words {
  font-size: 12px;
  color: #A9C9C4;
}

.recent-time {
  font-size: 11px;
  color: #9ca3af;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .type-item {
    flex-wrap: wrap;
  }
  
  .type-bar {
    width: 100%;
    order: 1;
  }
  
  .type-count, .type-words {
    order: 2;
  }
  
  .chart-container {
    gap: 8px;
  }
  
  .bar-label, .bar-value {
    font-size: 9px;
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

const user = ref(null)
const entries = ref([])
const recentEntries = ref([])

// 类型配置
const types = [
  { value: 'diary', name: '日记', icon: '📝' },
  { value: 'academic', name: '学术笔记', icon: '📚' },
  { value: 'dream', name: '梦记', icon: '🌙' },
  { value: 'creation', name: '创作', icon: '✍️' },
  { value: 'reading', name: '读书笔记', icon: '📖' },
  { value: 'quote', name: '摘抄', icon: '✂️' }
]

const getTypeIcon = (type) => {
  const t = types.find(t => t.value === type)
  return t?.icon || '📄'
}

const getTypeName = (type) => {
  const t = types.find(t => t.value === type)
  return t?.name || type
}

// 总字数
const totalWords = computed(() => {
  return entries.value.reduce((sum, e) => sum + (e.word_count || 0), 0)
})

// 今日字数
const todayWords = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.value.filter(e => e.created_at?.startsWith(today))
  return todayEntries.reduce((sum, e) => sum + (e.word_count || 0), 0)
})

// 总篇数
const totalEntries = computed(() => entries.value.length)

// 连续写作天数
const streakDays = computed(() => {
  const dates = [...new Set(entries.value.map(e => e.created_at?.split('T')[0]))].sort()
  if (dates.length === 0) return 0
  
  let streak = 1
  let current = new Date(dates[dates.length - 1])
  
  for (let i = dates.length - 2; i >= 0; i--) {
    const prev = new Date(dates[i])
    const diff = (current - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
      current = prev
    } else {
      break
    }
  }
  return streak
})

// 各类型统计
const typeStats = computed(() => {
  return types.map(type => {
    const typeEntries = entries.value.filter(e => e.type === type.value)
    const count = typeEntries.length
    const words = typeEntries.reduce((sum, e) => sum + (e.word_count || 0), 0)
    return {
      ...type,
      count,
      words,
      percentage: totalWords.value ? (words / totalWords.value) * 100 : 0
    }
  })
})

// 本周数据
const weekData = computed(() => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const result = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayEntries = entries.value.filter(e => e.created_at?.startsWith(dateStr))
    const words = dayEntries.reduce((sum, e) => sum + (e.word_count || 0), 0)
    result.push({
      date: dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      day: days[date.getDay()],
      words,
      height: Math.min(120, Math.max(20, words / 50))
    })
  }
  return result
})

// 加载数据
const loadEntries = async () => {
  const { data } = await supabase
    .from('user_entries')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
  
  if (data) {
    // 计算字数
    entries.value = data.map(e => ({
      ...e,
      word_count: e.content?.length || 0
    }))
    recentEntries.value = entries.value.slice(0, 10)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  if (user.value) {
    await loadEntries()
  }
})
</script>