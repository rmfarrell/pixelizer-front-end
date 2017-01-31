<template lang="pug">
  #app
    #overlay(
      :class="isForceThumbnails ? 'force-open' : '' ",
      @mouseleave="isForceThumbnails = false"
    )
      .renders(v-show="isImage")
        render(v-for="r in frameCount", :index="r")
        a.new-frame.big-button(v-if="isNextButton", @click="createFrame()")
          .label
            strong &plus;
            small Add Frame
            small {{frameCount + 1}}/{{maxFrames}}

      .column.algorithm-selector
        ul
          li(v-for="r in renderOptions")
            a(
              @click="setAlgorithm(r)",
              :class="renderAlgorithm === r ? 'active' : ''"
            ) {{r}}

        p.label Blend Mode:
        select(v-model="blendMode")
          option(v-for="bm in blendModeOptions", :value="bm") {{bm}}

      .settings.column
        p.label Resolution:
        slider(
          v-model="width",
          :lazy="true",
          setValue="setWidth",
          ref="widthSlider",
          :max="maxResolution",
          :min="minResolution",
          :interval="2"
        )
          div(slot="tooltip-single") {{width}}&times;{{height}}
        p.label Randomness:
        slider(
          v-model="funkiness",
          :lazy="true",
          ref="funkinessSlider",
          :max="maxFunkiness",
        )
          div(slot="tooltip-single") {{funkiness}}

      .column
        p third column

    label.upload-button.big-button(v-if="!isImage")
      strong &blk14;
      small Select image
      input(
        type="file",
        accept="image/*",
        @change="fileUploaded($event)"
      )

    canvas#input-canvas(:width="width", :height="height", style="display:none")
    #stage(v-show="isImage")
      render(v-for="r in frameCount", :index="r", v-show="r === currentFrame")

    pixel-field(
      :render-algorithm="renderAlgorithm",
      :image-data="imageData",
      :funkiness="funkiness",
      :blend-mode="blendMode"
    )
    div
</template>

<script>
  import { mapGetters } from 'vuex'
  import pixelField from './components/PixelField'
  import render from './components/render.vue'
  import slider from './components/Slider.vue'

  export default {
    name: 'app',
    data () {
      return {
        renderOptions: [
          'squares',
          'circles',
          'triangles',
          'halftone',
          'hexagons'
        ],
        blendModeOptions: [
          'none',
          'multiply',
          'screen',
          'overlay',
          'lighten',
          'luminosity'
        ],
        renderAlgorithm: 'squares',
        blendMode: 'none',
        ctx: null,
        img: new window.Image(),
        imageData: [],
        width: this.$store.getters.options.width || 0,
        isImage: false,
        maxFrames: window.Globals.maxFrames,
        funkiness: this.$store.getters.options.funkiness || 0,
        isForceThumbnails: true,
        maxResolution: 100,
        minResolution: 20,
        maxFunkiness: 50
      }
    },
    mounted () {
      this.ctx = document.getElementById('input-canvas').getContext('2d')
    },
    watch: {
      renderAlgorithm () {
        this.$nextTick(this.updateInput)
      },
      blendMode () {
        this.$nextTick(this.updateInput)
      },
      width () {
        this.$store.commit('setWidth', this.width)
        this.$nextTick(this.updateInput)
      },
      funkiness () {
        this.$nextTick(this.updateInput)
      },
      currentFrame () {
        this.getOptions()
      }
    },
    methods: {
      createFrame () {
        this.$store.commit('addFrame')
        this.goToFrame(this.frameCount)
        this.updateInput()
      },
      getOptions () {
        this.renderAlgorithm = this.options.renderAlgorithm
        this.width = this.options.width
        this.funkiness = this.options.funkiness
        this.blendMode = this.options.blendMode
      },
      updateWidth (val) {
        this.$store.commit('setWidth', val.target.value)
        this.updateInput()
      },
      goToFrame (frame) {
        this.$store.commit('goToFrame', frame)
      },
      fileUploaded (val) {
        this.img.onload = () => {
          this.setDimensions()
          this.updateInput()
        }
        this.img.src = window.URL.createObjectURL(val.target.files[0])
        this.isImage = true
      },
      updateInput () {
        this.setOptions()
        this.$nextTick(this.placeImage)
        this.$nextTick(this.sample)
        this.$nextTick(() => this.$bus.$emit('input-updated'))
      },
      setAlgorithm (ra) {
        this.renderAlgorithm = ra
      },
      setOptions () {
        this.$store.commit('setOptions', {
          width: this.width,
          funkiness: this.funkiness,
          renderAlgorithm: this.renderAlgorithm,
          blendMode: this.blendMode
        })
      },
      setDimensions () {
        this.$store.commit(
          'setRatio',
          this.img.naturalHeight / this.img.naturalWidth
        )
      },
      placeImage () {
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
      },
      sample () {
        if (this.width === 0 || this.height === 0) {
          return
        }
        let imageData = this.ctx.getImageData(0, 0, this.width, this.height)
        let dat = imageData.data
        let out = []
        let counter = 0
        for (let x = 0; x < dat.length; x = x + 4) {
          out[counter] = [dat[x], dat[x + 1], dat[x + 2]]
          counter++
        }
        this.imageData = out
      }
    },
    computed: {
      ...mapGetters([
        'height',
        'ratio',
        'orientation',
        'frameCount',
        'currentFrame',
        'options'
      ]),
      isNextButton () {
        return (this.frameCount < this.maxFrames &&
          (this.frameCount > 0 && this.isImage))
      }
    },
    components: {
      pixelField,
      render,
      slider
    }
  }
</script>
