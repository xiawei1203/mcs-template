<template>
  <div class="kpi" :class="`kpi--${tone}`">
    <div v-if="icon || $slots.icon" class="kpi__icon">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <div class="kpi__body">
      <div class="kpi__label">{{ label }}</div>
      <div class="kpi__val" :class="valClass">
        <slot>{{ value }}</slot>
      </div>
      <div v-if="sub || $slots.sub" class="kpi__sub" :class="subClass">
        <slot name="sub">{{ sub }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: ''
  },
  sub: {
    type: String,
    default: ''
  },
  // 图标位文字或单字，复杂图标用 #icon 插槽
  icon: {
    type: String,
    default: ''
  },
  // 卡片色调：blue / green / orange / purple / teal
  tone: {
    type: String,
    default: 'blue'
  },
  // 数值色调：primary / success / warning / teal，留空用默认深色
  valTone: {
    type: String,
    default: ''
  },
  // 副标题趋势：up 绿 / down 红
  trend: {
    type: String,
    default: ''
  }
})

const valClass = computed(() => (props.valTone ? `kpi__val--${props.valTone}` : ''))
const subClass = computed(() => (props.trend ? `is-${props.trend}` : ''))
</script>
