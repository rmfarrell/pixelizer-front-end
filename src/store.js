const Store = {
  state: {
    width: 60,
    height: 0,
    ratio: 0,
    pxDensity: 60,
    renderHeight: 0,
    renderWidth: 0,
    frameCount: 1,
    currentFrame: 1,
    orientation: 'landscape',
    options: [{}, {
      width: 60,
      funkiness: 0,
      renderAlgorithm: 'squares',
      blendMode: 'none'
    }]
  },
  mutations: {
    setRatio (state, ratio) {
      state.ratio = ratio
      state.orientation = (ratio > 1) ? 'portrait' : 'landscape'
      state.height = Math.round(state.width * state.ratio)
      state.renderHeight = state.height * state.pxDensity
      state.renderWidth = state.width * state.pxDensity
    },
    setWidth (state, width) {
      state.width = width
      state.height = Math.round(state.width * state.ratio)
      state.renderHeight = state.height * state.pxDensity
      state.renderWidth = state.width * state.pxDensity
    },
    addFrame (state) {
      state.frameCount = Math.min(window.Globals.maxFrames, state.frameCount + 1)
    },
    goToFrame (state, frameNum) {
      state.currentFrame = (frameNum <= state.frameCount) ? frameNum : 1
    },
    setOptions (state, options) {
      state.options[state.currentFrame] = options
    }
  },
  getters: {
    height: state => {
      return state.height
    },
    options: state => {
      return state.options[state.currentFrame]
    },
    width: state => {
      return state.width
    },
    ratio: state => {
      return state.ratio
    },
    orientation: state => {
      return state.orientation
    },
    renderHeight: state => {
      return state.renderHeight
    },
    renderWidth: state => {
      return state.renderWidth
    },
    pxDensity: state => {
      return state.pxDensity
    },
    currentFrame: state => {
      return state.currentFrame
    },
    frameCount: state => {
      return state.frameCount
    }
  },
  actions: {}
}

export default Store
