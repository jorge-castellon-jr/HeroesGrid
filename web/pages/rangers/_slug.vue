<template>
  <v-container :style="`max-width: ${$vuetify.breakpoint.thresholds.sm}px`">
    <v-row justify="center">
      <v-col cols="12" sm="8">
        <v-card hover class="overflow-hidden">
          <v-row class="ma-0">
            <v-col cols="12" sm="5" class="pa-0">
              <v-img
                :src="ranger.imageUrl"
                lazy-src="/v.png"
                height="100%"
                max-height="250px"
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
              <v-card-text>
                <div class="text-h4 font-weight-black pb-0">{{ranger.abilityName}}</div>
                <div>{{ranger.abilityDesc}}</div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ranger',
  data() {
    return {
      key: 'value',
    }
  },
  async asyncData({ route, $sanityClient, $vuetify }) {
    const query = `
      {
        "ranger": *[_type == 'ranger' && slug.current == '${route.params.slug}'][0] {
          _id,
          name,
          abilityName,
          abilityDesc,
          color,
          'imageUrl': image.asset->url,
          'team': team->season
          
        }
      }
    `
    let fetch = await $sanityClient.fetch(query)

    console.log($vuetify.breakpoint.thresholds.sm)
    return { ranger: fetch.ranger }
  },
}
</script>

<style lang="scss" scoped>
</style>