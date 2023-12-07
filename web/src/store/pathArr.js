import { defineStore } from 'pinia';

export const usepathArrStore = defineStore({
  id: 'pathArrStore',
  state: () => ({
    pathArr: [],
  }),
  getters: {},
  actions: {
    setPathArr(val) {
      this.pathArr = val;
    },
  },
  persist: true,
});
