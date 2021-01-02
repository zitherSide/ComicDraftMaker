<template>
  <v-main>
    <v-row v-for="(row, rowId) in cards" :key="rowId" align="center" justify="">
      <v-col v-for="(card, colId) in row" :key="colId" :cols="Math.max(1, card.cols)">
        <v-card >
          <v-card-actions class='justify-space-between'>
            <v-btn icon v-if="card.cols > 0"
              @click="cards[rowId][colId].cols-=1"><v-icon>mdi-arrow-collapse</v-icon></v-btn>
            <v-btn icon 
              @click="cards[rowId][colId].cols+=1"><v-icon>mdi-arrow-expand</v-icon></v-btn>
          </v-card-actions>
          <v-card-text v-if="card.cols > 0">
            <v-textarea auto-grow v-model="card.line" dense flat/>
            <v-textarea auto-grow v-model="card.situation" flat/>
          </v-card-text>
        </v-card>
      </v-col>
      <v-btn outlined><v-icon>mdi-plus</v-icon></v-btn>
    </v-row>
  </v-main>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data() {
    return {
      cards: [
        [
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 3
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          }
        ],
        [
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 3
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          }
        ],
        [
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 3
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          },
          {
            line: 'Hey!',
            situation: 'Noticed',
            cols: 4
          },
        ]
      ]
    }
  }
}
</script>
