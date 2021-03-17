<template>
  <v-app style="overflow: hidden">
    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
    <BottomNav />
  </v-app>
</template>

<script lang="ts">
import BottomNav from '@/components/layout/BottomNav.vue'
export default {
  components: {
    BottomNav,
  },
  data() {
    return {
      value: '',
    }
  },
}
</script>
