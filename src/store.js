const Store = {
  state: {
    width: 60,
    height: 0,
    ratio: 0,
    orientation: 'landscape'
  },
  mutations: {
    setRatio (state, ratio) {
      state.ratio = ratio
      state.orientation = (ratio > 1) ? 'portrait' : 'landscape'
      state.height = Math.round(state.width * state.ratio)
    }
  },
  getters: {
    height: state => {
      return state.height
    },
    width: state => {
      return state.width
    },
    ratio: state => {
      return state.ratio
    },
    orientation: state => {
      return state.orientation
    }
  },
  actions: {}
}

export default Store
