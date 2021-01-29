const electronInstaller = require('electron-winstaller')
const path = require('path')

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: __dirname + '/out/MusicPlayer-win32-x64',
  outputDirectory: path.join('./tmp/installer64'),
  authors: 'Music Player Inc.',
  exe: 'MusicPlayer.exe',
  setupIcon: path.join('music.ico'),
  noMsi: true
  // iconUrl: path.join('music.ico')
})
resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`))