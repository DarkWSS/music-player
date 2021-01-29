/**
 * electron功能的主要实现文件
 */
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 1000, // 宽度
    height: 600, // 高度
    frame: false, // 边框
    center: true, // 居中
    resizable: false, // 允许变更宽高
    webPreferences: {
      nodeIntegration: true,
      // devTools: true, // 允许控制台
      preload: __dirname + '/preload.js' // 加载额外文件，引入在vue里使用的electron属性
    }
  })

  win.loadURL('http://127.0.0.1:5000/#/') // 加载Url，该url时python服务启动的的url

  //接收最小化命令
  ipcMain.on('window-min', function () {
    win.minimize();
  })
  //接收最大化命令
  ipcMain.on('window-max', function () {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  })
  //接收关闭命令
  ipcMain.on('window-close', function () {
    win.close();
  })
  // 打开弹窗
  ipcMain.on('open-directory-dialog', function (event, p) {
    dialog.showOpenDialog({
      properties: [p]
    }).then(result => {
      if (result) {// 如果有选中
        event.sender.send('selectedItem', result.filePaths[0])
      }
    }).catch(err => {
      console.error('ERROR: ', err)
    })
  })
}

// 从 python-shell 导入一个 PythonShell 对象 (注意大小写)
const { PythonShell } = require("python-shell")
PythonShell.run(
  __dirname + '/app.py', null, function (err, results) {
    if (err) throw err
    console.log('results', results)
  }
)

app.whenReady().then(createWindow)

if (require('electron-squirrel-startup')) return

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})