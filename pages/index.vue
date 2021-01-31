<template>
  <v-main>
    <v-card>
      <v-toolbar color="primary">
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title>Plot Drafter</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon><v-icon>mdi-magnify</v-icon></v-btn>
      </v-toolbar>
      <v-card-actions>
        <v-row align="center" class="ma-1">
          <v-text-field v-model="newProjName"/>
          <v-btn outlined color="success" small @click="createProject(newProjName)"><v-icon>mdi-plus</v-icon></v-btn>
        </v-row>
      </v-card-actions>
      <v-list>
        <v-subheader>Projects</v-subheader>
        <v-list-item-group v-model=selectedlist>
          <v-list-item v-for="proj in projects" :key="proj.id">
            <v-list-item-content @click="$router.push(`${proj.id}/0`)">
              <v-row justify="space-between">
                <v-col cols="1"><v-list-item-title>{{proj.id}}</v-list-item-title></v-col>
                <v-col><v-list-item-title>{{proj.name}}</v-list-item-title></v-col>
                <v-col cols="1"><v-list-item-action><v-btn icon @click.stop="deleteProject(proj.id)"><v-icon>mdi-delete</v-icon></v-btn></v-list-item-action></v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-main>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import axios from 'axios'

const {bind} = require('lodash')

const baseUrl = 'http://localhost:3000/api/'
export const postAxios = (api, obj) => {
  const url = baseUrl + api
  return axios.post(url, obj)
}
export const getAxios = async (api, params) =>{
  const url = baseUrl + api
  return axios.get(url, {params})
    .catch( err => console.log(api + ' error: ' + err))
}

const createTable = (tableName, tableDef) => {
  const body = {
    sql: `create table if not exists "${tableName}" (${tableDef})`,
    values: []
  }
  return bind(postAxios, this, 'postSQL', body)
}

const createProjectTable = () => {
  const def = `"id" integer unique not null,
              "name" text not null,
               primary key("id")`
  return createTable("projects", def)()
}

const createContentTable = () => {
  const def = `"id" integer not null,
              "page" integer not null,
              "content" text,
              primary key("id", "page")`
  return createTable("contents", def)()
}


const getProjectListQuery = {
  sql: 'select id, name from projects',
  values: []
}
const getProjectList = bind(getAxios, this, 'getAllSQLResults', getProjectListQuery)

const deleteContent = (id) => {
  const body = {
    sql: 'delete from contents where id = ?',
    values: [id]
  }
  return bind(postAxios, this, 'postSQL', body)
}

const deleteProject = (id) => {
  const body = {
    sql: 'delete from projects where id = ?',
    values: [id]
  }
  return bind(postAxios, this, 'postSQL', body)
}

const createProject = (projName) => {
  const body = {
    sql: 'insert into projects(name) values(?)',
    values: [projName]
  }
  return bind(postAxios, this, 'postSQL', body)
}

const getLastInsertedIDQuery = {
  sql: 'select last_insert_rowid()',
  values: []
}
const getLastInsertedID = bind(getAxios, this, 'getAllSQLResults', getLastInsertedIDQuery)

export const savePage = (projID, page, content) => {
  const body = {
    sql: 'insert into contents(id, page, content) values(?, ?, ?)',
    values: [projID, page, content]
  }
  return bind(postAxios, this, 'postSQL', body)
}

export const emptyPage = [
  [{line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}],
  [{line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}],
  [{line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}, {line: 'Hey!', situation: 'Noticed', cols: 3}]
]

export const createNewPage = (projID, page) => bind(savePage, this, projID, page, JSON.stringify(emptyPage))()

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data() {
    return {
      newProjName: "",
      selectedlist: 0,
      projects: [
        {id: 0, name: "test"},
        {id: 1, name: "test2"}
      ],
    }
  },
  computed: {
    selectedProjectId() {
      return this.selectedlist
    }
  },
  async mounted(){
    createProjectTable()
      .then( () => createContentTable())
      .then( async() => this.projects = (await getProjectList()).data)
  },
  methods: {
    async createProject(projName){
      createProject(projName)()
        .then( () => getLastInsertedID())
        .then( id => {
          const insertedID = id.data[0]["last_insert_rowid()"]
          this.projects.push({id: insertedID, name: projName})
          return createNewPage(insertedID, 0)()
        })
        .catch( err => console.log('create project failed: ' + err))
    },
    deleteProject(projId){
      deleteContent(projId)()
        .then( () => deleteProject(projId)())
        .then( () => this.projects = this.projects.filter( elem => elem.id != projId))
        .catch( err => console.log('failed to delete project: ' + err))
    },
    alert(obj){
      alert(obj)
    }
  }
}
</script>
