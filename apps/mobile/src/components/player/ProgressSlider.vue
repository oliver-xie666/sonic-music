<template>
  <slider
    class="progress-slider"
    :value="current"
    :max="total || 100"
    :min="0"
    :step="1"
    block-size="24"
    :activeColor="activeColor"
    backgroundColor="rgba(255,255,255,0.3)"
    @change="onChange"
    @changing="onChanging"
  />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  activeColor: { type: String, default: 'var(--primary-color)' },
})

const emit = defineEmits(['seek'])
const dragging = ref(false)

function onChange(e) {
  dragging.value = false
  emit('seek', e.detail.value)
}

function onChanging() {
  dragging.value = true
}
</script>

<style scoped>
.progress-slider {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
