/**
 * 歌曲列表
 */
<template>
  <li @click="playThisOne()"
      :class="{'play':musicIndex==index}">{{name.split('.')[0]}}</li>
</template>
<script>
export default {
  props: {
    name: { // 歌曲名
      type: String,
      default: ''
    },
    index: { // 当前歌曲下标
      type: Number,
      default: 0
    },
    musicIndex: { // 当前播放歌曲下标
      type: Number,
      default: 0
    }
  },
  methods: {
    playThisOne () { // 播放当前歌曲
      this.$emit('update:musicIndex', this.index)
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
