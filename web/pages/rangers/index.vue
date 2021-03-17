<template>
  <v-container :style="`max-width: ${$vuetify.breakpoint.thresholds.sm}px`">
    <v-row>
      <v-col cols="12" md="6" v-for="ranger in rangers" :key="ranger._id">
        <v-card hover class="overflow-hidden" nuxt :to="`/rangers/${ranger.slug}`">
          <v-row class="ma-0">
            <v-col cols="12" sm="5" class="pa-0">
              <v-img
                :src="ranger.imageUrl"
                lazy-src="/v.png"
                height="192"
                position="center bottom"
                :style="`background-color: ${ranger.color.value}`"
                contain
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
            <v-col>
              <v-card-title>{{ranger.name}}</v-card-title>
              <v-card-subtitle>{{ranger.team}} {{ranger.color.title}} Ranger</v-card-subtitle>
              <v-card-text class="text-h4 font-weight-black pb-0">{{ranger.abilityName}}</v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const query = `
  {
    "rangers": *[_type == 'ranger'] {
      _id,
      name,
      abilityName,
      abilityDesc,
      color,
      'imageUrl': image.asset->url,
      'team': team->season,
      'slug': slug.current
    }
  }
`
export default {
  name: 'rangers',
  data() {
    return {
      key: 'value',
    }
  },
  async asyncData({ $sanityClient, $vuetify }) {
    let fetch = await $sanityClient.fetch(query)

    console.log(fetch)
    return { rangers: fetch.rangers }
  },
}
</script>

<style lang="scss" scoped>
</style>