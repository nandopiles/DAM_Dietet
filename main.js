const { app, BrowserWindow } = require('electron')

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('login.html')
	win.setMenu(null)

    win.webContents.openDevTools()
}
app.on('ready', createWindow)