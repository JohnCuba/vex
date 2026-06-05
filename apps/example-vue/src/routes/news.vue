<template>
  <h1>It's NEWS</h1>
   <RouterLink to="/users">Users</RouterLink>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router'

onMounted(() => {
  console.log('dsfsfsdf')
})
</script>
