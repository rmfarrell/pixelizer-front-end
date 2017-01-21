export default {
  state: {
    width: 60,
    height: 0,
    ratio: 0,
    orientation: 'landscape'
  },
  mutations: {
    setRatio (ratio) {
      this.ratio = ratio
      this.orientation = (this.ratio() > 1) ? 'portrait' : 'landscape'
      this.height = Math.round(this.width * this.ratio)
    }
  },
  getters: {
    height () {
      return this.height
    },
    width () {
      return this.width
    },
    ratio () {
      return this.ratio
    },
    orientation () {
      return this.orientation
    }
  },
  actions: {}
}
