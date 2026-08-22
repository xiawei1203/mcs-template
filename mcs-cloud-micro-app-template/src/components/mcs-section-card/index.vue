<template>
  <section class="section-card">
    <div v-if="showTitle" class="section-card__title">
      <span class="section-dot"></span>
      <slot name="title">{{ title }}</slot>
      <div v-if="$slots.extra" class="section-card__extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <slot></slot>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
const slots = useSlots()

const showTitle = computed(() => !!props.title || !!slots.title || !!slots.extra)
</script>
