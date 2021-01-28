<template>
  <div>
    <audio :src="songUrl"
           ref="audio"></audio>
    <div class="play_area">
      <div class="music_info">
        <div class="name">{{song.singer + ' - ' + song.name}}</div>
        <div class="time">{{progress}}</div>
      </div>
      <div class="ctrl_area">
        <i class="iconfont music-prev"
           title="上一首"
           @click="handoverSong('prev')"></i>
        <i class="iconfont music-fr"
           title="快退"
           @click="adjustSong('fr')"></i>
        <i class="iconfont"
           :title="playStatus ? '暂停' : '播放'"
           :class="[playStatus ? 'music-play' : 'music-pause']"
           @click="clickIcon()"></i>
        <i class="iconfont music-ff"
           title="快进"
           @click="adjustSong('ff')"></i>
        <i class="iconfont music-next"
           title="下一首"
           @click="handoverSong('next')"></i>
      </div>
      <div class="progress">
        <div class="progress_bar"
             :style="{width: progressValue}"></div>
        <div class="progress_point"
             @mousedown="dragElem($event, 'horizontal')"
             :style="{left: progressValue}"></div>
      </div>
      <div class="right_area">
        <i class="iconfont music-sequence"
           title="顺序播放"></i>
        <div class="volume_ctrl"
             :class="[showVolume ? '' : 'hide_volume']"
             @mouseleave="showVolume = false">
          <div class="volume_pillar"
               @click="ctrlVolume($event)"></div>
          <div class="volume_bar"
               :style="{height: volume + 'rem'}"></div>
          <div class="volume_point"
               @mousedown="dragElem($event, 'portrait')"
               :style="{top: (10.5 - volume) + 'rem'}"></div>
          <p>{{volume}}</p>
        </div>
        <div class="volume"
             @click="showVolume = true">
          <i v-show="volume > 0"
             title="音量"
             class="iconfont music-volume"></i>
          <span v-show="volume <= 0">静音</span>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
export default {
  data () {
    return {
      playStatus: false, // 播放状态
      audio: null, // 播放器
      currentTime: 0, // 当前播放时间
      duration: '', // 音频时长
      songIndex: 0,
      songUrl: '',
      volume: 10,
      showVolume: false
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
  computed: {
    progress () { // 当前时间/总时长
      return this.formatSeconds(this.currentTime) + ' / ' + this.formatSeconds(this.duration)
    },
    progressValue () { // 当前歌曲播放进度
      return this.currentTime / this.duration * 100 + '%'
    },
    song () {
      if (this.songList.length > 0) {
        const src = this.songList[this.songIndex]
        const songInfo = src.split('.')[0].replace(/%20/g, ' ').split('-')
        return {
          src: this.fileUrl + '/' + src,
          name: songInfo[1],
          singer: songInfo[0]
        }
      }
      return {
        src: '',
        name: '未知歌曲',
        singer: '未知歌手'
      }
    }
  },
  watch: {
    songList (n) {
      if (n.length > 0) {
        this.getMusic()
      } else {
        this.currentTime = 0
        this.duration = 0
        this.playStatus = true
      }
    }
  },
  mounted () {
    this.audio = this.$refs.audio
    // 绑定监听事件实时获取歌曲时间信息
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
      this.$emit('update:current', this.currentTime)
      if (this.currentTime >= this.duration && this.currentTime > 0) { // 一首歌播放完自动播放下一首
        this.handoverSong('next')
      }
    })
    this.audio.addEventListener('canplay', () => {
      this.duration = this.audio.duration
    })
    this.audio.addEventListener('loadeddata', () => {
      if (this.audio.readyState >= 2 && this.playStatus) {
        this.playMusic()
      }
    })
  },
  methods: {
    playMusic () { // 切换播放状态
      if (this.duration > 0) {
        this.playStatus = true
        this.audio.play()
      }
    },
    pauseMusic () { // 暂停状态
      this.playStatus = false
      this.audio.pause()
    },
    clickIcon () { // 点击播放或者暂停按钮切换状态
      this.playStatus ? this.pauseMusic() : this.playMusic()
    },
    formatSeconds (value) { // 时间标准化为xx:xx
      let s = parseInt(value) // 秒
      s = isNaN(s) ? 0 : s
      let m = 0 // 分
      if (s > 60) {
        m = parseInt(s / 60)
        s = parseInt(s % 60)
      }
      return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
    },
    adjustSong (type) { // 快进快退操作
      if (this.duration > 0) {
        if (type.indexOf('r') > -1) { // 快退
          this.audio.currentTime -= 3
          this.audio.currentTime = this.audio.currentTime < 0 ? 0 : this.audio.currentTime
        } else { // 快进
          this.audio.currentTime += 3
          this.audio.currentTime = this.audio.currentTime > this.audio.duration ? this.audio.duration : this.audio.currentTime
        }
      }
    },
    handoverSong (type) { // 切换上一首下一首，最后一首与第一首衔接在一起
      if (type.indexOf('next') > -1) {
        this.songIndex++
        this.songIndex = this.songIndex < this.songList.length ? this.songIndex : 0
      } else {
        this.songIndex--
        this.songIndex = this.songIndex > -1 ? this.songIndex : this.songList.length - 1
      }
      this.$emit('update:musicIndex', this.songIndex)
      this.playThisMusic(this.songIndex)
    },
    playThisMusic (index) {
      this.playStatus = true
      this.songIndex = index
      this.getMusic()
    },
    getMusic () { // 获取音频文件
      const _this = this
      const param = {
        file: this.song.src
      }
      this.$axios({
        method: 'post',
        url: '/music/file',
        data: param,
        responseType: 'blob'
      }).then(
        res => {
          _this.songUrl = window.URL.createObjectURL(res.data)
          console.log(res.data)
        }
      ).catch(res => {
        console.log(res)
      })
    },
    ctrlVolume (e) {
      console.log(e.layerY)
      this.volume = parseInt(11 - e.layerY / 16)
      this.audio.volume = this.volume / 10
    },
    dragElem (e, direction) { // 移动拼图
      const el = e.target
      const sX = e.clientX - el.offsetLeft
      const sY = e.clientY - el.offsetTop
      el.style.transition = 'none'

      document.onmousemove = (e) => { // 拼图随鼠标移动
        const eX = e.clientX - sX
        const eY = e.clientY - sY
        if (direction.indexOf('horizontal') > -1) {
          el.style.left = eX + 'px'
          this.audio.currentTime = parseInt(el.style.left) / window.innerWidth * this.audio.duration
        } else {
          if (eY >= 0 && eY <= 160) {
            el.style.top = eY + 8 + 'px'
            this.volume = parseInt(10 - eY / 16)
            this.audio.volume = this.volume / 10
          }
        }
      }
      document.onmouseup = (e) => { // 移动结束时的操作
        document.onmousemove = null
        el.style.transition = 'all 0.5s'
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.play_area {
  width: 100%;
  height: 80px;
  background-color: #3399ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  padding: 0 20px;
  position: absolute;
  bottom: 0;
  .music_info {
    div {
      white-space: nowrap;
    }
  }
  .ctrl_area {
    width: 15rem;
    margin: auto;
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    i {
      font-size: 32px;
      color: #fff;
      cursor: pointer;
    }
  }

  .progress {
    width: 100%;
    top: -2px;
    left: 0;
    height: 4px;
    border-radius: 25px;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.6);
    .progress_bar {
      width: 0;
      height: 4px;
      border-radius: 25px;
      background-color: rgba(255, 255, 255, 0.6);
    }

    .progress_point {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #fff;
      position: absolute;
      top: -2px;
      margin-left: -2px;
      -webkit-app-region: no-drag;
      cursor: pointer;
    }
  }

  .right_area {
    display: flex;
    i {
      padding-left: 20px;
      cursor: pointer;
    }
    .volume_ctrl {
      width: 40px;
      height: 13rem;
      position: absolute;
      overflow-y: hidden;
      bottom: 54px;
      right: 11px;
      padding-top: 1rem;
      background-color: transparentize($color: #fff, $amount: 0.2);
      transition: all 0.5s;
      .volume_pillar {
        width: 10px;
        height: 10rem;
        margin-left: 15px;
        border-radius: 25px;
        background-color: transparentize($color: #aaa, $amount: 0.4);
        -webkit-app-region: no-drag;
      }
      .volume_bar {
        width: 10px;
        height: 10rem;
        background-color: #3399ff;
        border-radius: 25px;
        position: absolute;
        left: 15px;
        bottom: 2rem;
        transform: all 0.5s;
      }
      .volume_point {
        width: 16px;
        height: 16px;
        background-color: #fff;
        box-shadow: 0 0 5px #aaa;
        border-radius: 50%;
        position: absolute;
        top: 10rem;
        left: 12px;
        transform: all 0.5s;
        -webkit-app-region: no-drag;
        cursor: pointer;
      }

      p {
        width: 40px;
        height: 1.5rem;
        line-height: 1.5rem;
        text-align: center;
        color: #aaa;
        position: absolute;
        bottom: 0;
        margin: auto;
      }
    }
    .hide_volume {
      height: 0;
      padding: 0;
      div {
        display: none;
      }
      p {
        display: none;
      }
    }
  }
}

.music-pause {
  transform: rotateZ(180deg);
}
</style>
