<template>
  <v-bottom-navigation
    class="nav__bottom-bar"
    app
    :v-model="value"
    color="purple darken-2"
    height="60px"
    grow
    absolute
    shift
    hide-on-scroll
  >
    <v-btn
      v-for="(page, i) in beforeLinks"
      :key="i"
      nuxt-link
      :to="page.link"
      class="nav__bottom-bar__btn"
    >
      <span>{{ page.title }}</span>

      <v-icon>{{ page.icon }}</v-icon>
    </v-btn>

    <v-btn nuxt-link to="/rangers" id="nav__action-btn">
      <CustomIcon class="custom-icon" />
    </v-btn>

    <v-btn
      v-for="(page, i) in afterLinks"
      :key="i"
      nuxt-link
      :to="page.link"
      class="nav__bottom-bar__btn"
    >
      <span>{{ page.title }}</span>

      <v-icon>{{ page.icon }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script lang="ts">
import CustomIcon from '@/components/layout/CustomIcons.vue'

export default {
  components: {
    CustomIcon,
  },
  data() {
    return {
      menu: [
        {
          title: 'Home',
          icon: 'mdi-home',
          link: '/',
          before: true,
        },
        {
          title: 'Viilans',
          icon: 'mdi-map-marker',
          link: '/test',
          before: false,
        },
      ],
    }
  },
  computed: {
    beforeLinks() {
      return this.menu.filter((item) => {
        return item.before
      })
    },
    afterLinks() {
      return this.menu.filter((item) => {
        return !item.before
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#nav__action-btn {
  position: absolute;
  border-radius: 100px;
  width: 80px;
  padding: 0;
  height: 80px;
  top: -40px;
  background: white;
  z-index: 99;
  border-top: 8px solid;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 10%), 0 1px 2px 0 rgb(0 0 0 / 6%);
  svg {
    position: relative;
    top: 0;
    opacity: 1;
  }
}
.nav {
  &__bottom-bar {
    border-top: 8px solid;
    &__btn {
      padding-bottom: 8px !important;
    }
  }
}
</style>