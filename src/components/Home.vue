/**
 * 音乐播放器结构页面
 */
<template>
  <div>
    <!-- 播放器logo与窗口控制 -->
    <div class="page_head">
      <h5>
        <i class="iconfont music-logo"></i>
        音乐播放器
      </h5>
      <div class="window_ctrl">
        <i ref="min"
           class="iconfont music-minimize"></i>
        <!--<i ref="max"
           class="iconfont music-maximize"></i>-->
        <i ref="close"
           class="iconfont music-close"></i>
      </div>
    </div>
    <!-- 页面主体，左侧歌曲列表右侧歌词区域 -->
    <div class="page_main">
      <ol>
        <!-- 歌曲列表 -->
        <div class="ol_head">
          <h4>播放列表
            <i class="iconfont music-list"></i>
          </h4>
          <i @click="openDialog()"
             class="iconfont music-add"></i>
        </div>

        <music-item v-for="(music, index) in musicList"
                    :key="index"
                    :name="music"
                    :music-index.sync="musicIndex"
                    @play-music="playThisOne()"
                    :index="index"></music-item>

        <p v-show="musicList.length < 1">当前文件夹下没有歌曲</p>
      </ol>
      <!-- 歌词区域 -->
      <lyric-area :song-list="musicList"
                  :music-index="musicIndex"
                  :current="current"
                  :file-url="fileUrl"></lyric-area>
    </div>
    <!-- 音乐播放控制 -->
    <player-area ref="player"
                 :song-list="musicList"
                 :music-index.sync="musicIndex"
                 :current.sync="current"
                 :file-url="fileUrl"></player-area>
  </div>
</template>

<script>
import MusicItem from './MusicItem.vue'
import PlayerArea from './PlayerArea.vue'
import LyricArea from './LyricArea'
export default {
  data () {
    return {
      musicList: [], // 歌曲列表
      fileUrl: 'E:/music', // 歌曲所在文件夹位置
      musicIndex: 0, // 当前播放歌曲下标
      current: 0 // 当前已播放时间
    }
  },
  created () {
    this.getMusicList()
  },
  mounted () {
    let ipcRenderer = window.ipcRenderer
    /*
    this.$refs.max.addEventListener('click', () => {
      // 发送最大化命令
      ipcRenderer.send('window-max')
    })
    */
    this.$refs.min.addEventListener('click', () => {
      // 发送最小化命令
      ipcRenderer.send('window-min')
    })

    this.$refs.close.addEventListener('click', () => {
      // 发送关闭命令
      ipcRenderer.send('window-close')
    })
  },
  components: {
    PlayerArea,
    MusicItem,
    LyricArea
  },
  methods: {
    playThisOne () { // 调用音乐播放控制组件播放指定下标歌曲
      this.$refs.player.playThisMusic(this.musicIndex)
    },
    openDialog () { // 打开文件夹选择弹窗1，此为electron提供的功能
      let ipcRenderer = window.ipcRenderer
      ipcRenderer.send('open-directory-dialog', 'openDirectory')
      ipcRenderer.on('selectedItem', (e, path) => {
        this.fileUrl = path.replace(/\\/g, '/')
        this.getMusicList()
      })
    },
    getMusicList () { // 获取歌曲列表
      const param = {
        fileUrl: this.fileUrl
      }
      const _this = this
      this.$axios.post('/music/list', param).then(
        res => {
          _this.musicList = res.data
        }
      ).catch(res => {
        console.log(res)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page_head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3399ff;
  color: #fff;
  padding: 10px 20px;
  -webkit-app-region: drag;
  h5 {
    font-size: 1.2rem;
    margin: 0;
    i {
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }
  }
  .window_ctrl {
    width: 3rem;
    display: flex;
    justify-content: space-between;
    i {
      cursor: pointer;
    }
  }
}
.page_main {
  display: flex;
  height: calc(100vh - 80px);
  background-image: url(./../img/bg.jpg);
  background-size: cover;
  ol {
    width: 20rem;
    background-color: transparentize($color: #aaa, $amount: 0.6);
    margin: 0;
    color: #fff;
    padding: 0;
    flex: none;
    position: relative;
    .ol_head {
      height: 4rem;
      line-height: 4rem;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      h4 {
        margin: 0;
        i {
          display: inline-block;
          position: relative;
          top: 1px;
        }
      }
      .music-add {
        position: relative;
        top: 3px;
        cursor: pointer;
      }
    }
    p {
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
}
</style>
