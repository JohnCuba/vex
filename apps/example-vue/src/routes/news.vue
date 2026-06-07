<template>
  <Frame>
    <h1 class="title">It's NEWS</h1>
    <RouterLink to="/users">Users</RouterLink>
  </Frame>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import Frame from '../components/frame.vue';

useHead({
  title: 'Vex',
})
</script>

<style lang="css" scoped>
.title {
  color: red;
}
</style>
