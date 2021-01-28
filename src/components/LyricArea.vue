<template>
  <div class="lyric_area">
    <div class="lyric_scroll_area"
         ref="scroll">
      <p v-for="(lrc, index) in lyricList"
         :key="index"
         :class="{'current_lyric': currentLyric(index), 'hide_lyric': index <= currentIndex - 5}">{{lrc.c}}</p>
    </div>
    <p v-show="lyricList.length < 1"
       class="no_lyric">暂无歌词</p>
  </div>
</template>
<script>
export default {
  data () {
    return {
      lyricList: [],
      time: this.current,
      currentIndex: 0
    }
  },
  props: {
    songList: {
      type: Array,
      default: () => {
        return []
      }
    },
    fileUrl: {
      type: String,
      default: ''
    },
    musicIndex: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 0
    }
  },
  watch: {
    songList (n) {
      if (n.length > 0) {
        this.getLyric()
      } else {
        this.lyricList = []
      }
    },
    current (n) {
      this.time = n
    },
    musicIndex (n) {
      this.getLyric()
    }
  },
  methods: {
    getLyric () {
      const param = {
        file: this.fileUrl + '/' + this.songList[this.musicIndex].split('.')[0] + '.lrc'
      }
      this.lyricList = []
      this.currentIndex = 0
      this.$axios({
        method: 'post',
        url: '/music/lyric',
        data: param
      }).then(
        res => {
          const lrc = res.data
          if (lrc.length > 0) {
            const lrcs = lrc.split('\n')// 用回车拆分成数组
            for (let i in lrcs) { // 遍历歌词数组
              lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, '') // 去除前后空格
              let t = lrcs[i].substring(lrcs[i].indexOf('[') + 1, lrcs[i].indexOf(']'))// 取[]间的内容
              let s = t.split(':')// 分离:前后文字
              if (!isNaN(parseInt(s[0]))) { // 是数值
                let arr = lrcs[i].match(/\[(\d+:.+?)\]/g)// 提取时间字段，可能有多个
                let start = 0
                for (let k in arr) {
                  start += arr[k].length // 计算歌词位置
                }
                let content = lrcs[i].substring(start)// 获取歌词内容
                if (content.length > 0) {
                  for (let k in arr) {
                    let t = arr[k].substring(1, arr[k].length - 1).split(':')// 取[]间的内容
                    this.lyricList.push({// 对象{t:时间,c:歌词}加入ms数组
                      t: (parseFloat(t[0]) * 60 + parseFloat(t[1])).toFixed(3),
                      c: content
                    })
                  }
                }
              }
            }
          }
        }
      ).catch(res => {
        console.log(res)
      })
    },
    currentLyric (index) {
      if (index < this.lyricList.length - 1) {
        const current = this.time >= this.lyricList[index].t && this.time <= this.lyricList[index + 1].t
        this.currentIndex = current ? index : this.currentIndex
        return current
      }
      return true
    }
  }
}
</script>
<style lang='scss' scoped>
.lyric_area {
  width: 100%;
  padding: 20px 0;
  position: relative;
  background-color: rgba(0, 0, 0, 0.5);
  .lyric_scroll_area {
    height: 100%;
    overflow: hidden;
    p {
      text-align: center;
      margin: 0;
      height: 3rem;
      line-height: 3rem;
      transition: all 0.5s;
      color: #fff;
    }
    .current_lyric {
      color: #ffcc33;
      font-weight: bold;
      font-size: 1.6rem;
    }
    .hide_lyric {
      height: 0;
      overflow-y: hidden;
    }
  }

  .no_lyric {
    text-align: center;
    color: #bbb;
    position: absolute;
    height: 2rem;
    left: 0;
    right: 0;
    line-height: 2rem;
    top: 0;
    bottom: 0;
    margin: auto;
  }
}
</style>
