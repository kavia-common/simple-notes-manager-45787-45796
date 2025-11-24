<template>
  <div style="display:flex; align-items:center; justify-content:center; min-height: 40vh; text-align:center;">
    <div class="card" style="padding: 28px; max-width: 520px;">
      <div style="font-size: 20px; font-weight:700; margin-bottom: 8px;">Create your first note</div>
      <div class="meta" style="margin-bottom: 16px;">
        Get started by creating a new note. Your notes are saved in your browser and will sync to a backend when configured.
      </div>
      <button class="btn primary" @click="$emit('create')">+ New Note</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'create'): void }>()
</script>
