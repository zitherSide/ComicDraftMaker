<template>
  <v-main>
    <v-toolbar class="align-center" src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
        <v-toolbar-title>
            {{$route.params.projID}}: {{title}}
        </v-toolbar-title>
        <v-spacer/>
        <v-btn color="success" @click="save">Save</v-btn>
    </v-toolbar>
    <v-row>
        <v-col cols="1" align="center" align-self="center">
            <v-row class="ma-5">
                <v-btn icon v-if="hasPage(parseInt($route.params.page) + 1)" @click="movePage(`${parseInt($route.params.page) + 1}`)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-row>
            <v-row class="mt-5 ml-5">
                <v-btn v-if="!hasPage(parseInt($route.params.page) + 1)" color="primary" @click="addNewPage"><v-icon>mdi-plus</v-icon></v-btn>
            </v-row>
        </v-col>

        <v-col cols="10">
            <v-row v-for="(row, rowId) in cards" :key="rowId" align="center" justify="center">
                <v-col v-for="(card, colId) in row" :key="colId" :cols="Math.max(1, card.cols)">
                    <v-card>
                        <v-card-actions class='justify-space-between'>
                            <v-btn icon v-if="card.cols > 0"
                              @click="cards[rowId][colId].cols-=1"><v-icon>mdi-arrow-collapse</v-icon></v-btn>
                            <v-btn icon 
                              @click="cards[rowId][colId].cols+=1"><v-icon>mdi-arrow-expand</v-icon></v-btn>
                            <v-spacer/>
                            <v-btn icon @click="cards[rowId].splice(colId, 0, emptyCell)"><v-icon>mdi-chevron-left</v-icon></v-btn>
                            <v-btn icon @click="cards[rowId].splice(colId, 1)"><v-icon>mdi-delete</v-icon></v-btn>
                            <v-btn icon @click="cards[rowId].splice(colId-1, 0, emptyCell)"><v-icon>mdi-chevron-right</v-icon></v-btn>
                        </v-card-actions>
                        <v-card-text v-if="card.cols > 0">
                            <v-textarea auto-grow v-model="card.line" dense flat/>
                            <v-textarea auto-grow v-model="card.situation" flat/>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
        
        <v-col cols="1" align-self="center">
            <v-row class="ma-5">
                <v-btn icon v-if="hasPage($route.params.page - 1)" @click="movePage(`${$route.params.page - 1}`)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
            </v-row>
        </v-col>
    </v-row>
    <v-row justify="center" class="ma-5">
        <v-btn outlined @click="cards.push([emptyCell])"><v-icon>mdi-plus</v-icon></v-btn>
        <v-btn outlined @click="cards.pop()"><v-icon>mdi-minus</v-icon></v-btn>
    </v-row>

    <v-footer class="justify-center" color="secondary">
        <span>- {{parseInt($route.params.page) + 1}} / {{pageNum}} -</span>
    </v-footer>
  </v-main>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import axios from 'axios'
import {getAxios, createNewPage, postAxios} from '~/pages/index.vue'

const {bind} = require('lodash')

const getTitle = id => {
  const getTitleQuery = {
    sql: 'select name from projects where id = ?',
    values:[id]
  }
  return bind(getAxios, this, 'getAllSQLResults', getTitleQuery)
}

const getContent = (id, page) => {
  const getContentQuery = {
    sql: 'select page, content from contents where id = ? and page = ?',
    values: [id, page]
  }
  return bind(getAxios, this, 'getAllSQLResults', getContentQuery)
}

const getPageNum = (id) => {
    const getPageNumQuery = {
        sql: 'select page from contents where id = ?',
        values: [id]
    }
    return bind(getAxios, this, 'getAllSQLResults', getPageNumQuery)
}

const editPage = (id, page, content) => {
  const body = {
    sql: 'update contents set content = ? where id = ? and page = ?',
    values: [content, id, page]
  }
  return bind(postAxios, this, 'postSQL', body)
}

const emptyCell = {line: '', situation: '', cols: 1}

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  async mounted(){
    getTitle(this.$route.params.projID)()
      .then( res => this.title = res.data[0].name)
      .then( () => getContent(this.$route.params.projID, this.$route.params.page)() )
      .then( res => {
          this.cards = JSON.parse(res.data[0].content)
          return getPageNum(this.$route.params.projID)()
        })
      .then( res => this.pageNum = res.data.length)
      .catch( err => console.log(err))
  },
  data() {
    return {
      title: String,
      cards: Array,
      pageNum: 0,
      emptyCell: {line: '', situation: '', cols: 1}
    }
  },
  methods: {
      hasPage(page){
          return page >= 0 && page < this.pageNum
      },
      addRow(){
          const row = []
          this.cards[0].forEach(element => {
              row.push(emptyCell)
          })
          this.cards.push(Object.create(row))
      },
      addNewPage(){
          createNewPage(this.$route.params.projID, parseInt(this.$route.params.page) + 1)()
            .then( () => getPageNum(this.$route.params.projID)())
            .then( res => this.pageNum = res.data.length)
            .catch( err => console.log(err))
      },
      save(){
          editPage(this.$route.params.projID, this.$route.params.page, JSON.stringify(this.cards))()
            .catch(err => console.log(err))
      },
      movePage(page){
        editPage(this.$route.params.projID, this.$route.params.page, JSON.stringify(this.cards))()
          .then( () => this.$router.push(page))
          .catch(err => console.log(err))
      }
  }
}
</script>
