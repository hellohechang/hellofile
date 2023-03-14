import { _getData } from '../utils/utils'
import { defineStore } from 'pinia'

export const usepathArrStore = defineStore('pathArr', {
  state: () => ({
    pathArr: _getData("path") || []
  }),
})
