<template>
  <li @click="playThisOne()"
      :class="{'play':songIndex==index}">{{name.split('.')[0]}}</li>
</template>
<script>
export default {
  computed: {
    songIndex (n) {
      return this.musicIndex + 1
    }
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: 0
    },
    musicIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    playThisOne () {
      this.$emit('update:musicIndex', this.index - 1)
      this.$emit('play-music')
    }
  }
}
</script>
<style lang='scss' scoped>
li {
  height: 2rem;
  line-height: 2rem;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  padding: 0 20px;
  transform: all 0.5s;
  -webkit-app-region: no-drag;
}
.play {
  font-weight: bold;
  background-color: transparentize($color: #aaa, $amount: 0.6);
}
</style>
