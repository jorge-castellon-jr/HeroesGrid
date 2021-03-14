<template>
  <v-app>
    <!-- Main Content -->
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-bottom-navigation
      app
      :v-model="value"
      color="teal"
      grow
      absolute
      shift
      hide-on-scroll
    >
      <v-btn v-for="(page, i) in pages" :key="i" nuxt-link :to="page.link">
        <span>{{ page.title }}</span>

        <v-icon>{{ page.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      value: '',
      pages: [
        {
          title: 'Home',
          icon: 'mdi-home',
          link: '/',
        },
        {
          title: 'Rangers',
          icon: 'mdi-heart',
          link: '/rangers',
        },
        {
          title: 'Viilans',
          icon: 'mdi-map-marker',
          link: '/test',
        },
      ],
    }
  },
}
</script>
