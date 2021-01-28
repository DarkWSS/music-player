
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    frame: false, // 边框
    center: true, // 居中
    resizable: false, // 变更宽高
    webPreferences: {
      nodeIntegration: true,
      // devTools: true,
      preload: __dirname + '/preload.js'
    }
  })

  win.loadURL('http://127.0.0.1:5000/#/')

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