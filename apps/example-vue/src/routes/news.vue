<template>
  <Frame>
    <h1 class="title">It's NEWS</h1>
    <RouterLink to="/users">Users</RouterLink>
    <div>{{query.data}}</div>
  </Frame>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { useHead } from '@unhead/vue'
import Frame from '../components/frame.vue';
import { useQuery } from '@pinia/colada';

useHead({
  title: 'Vex',
})

const query = useQuery({
  key: ['post'],
  query: () => fetch('http://localhost:3000/post').then((res) => res.json()),
})
</script>

<style lang="css" scoped>
.title {
  color: red;
}
</style>
