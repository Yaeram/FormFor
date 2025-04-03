const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Выбираем путь к файлу в зависимости от режима
  const startURL = isDev
    ? 'http://localhost:3000' // В dev-режиме загружаем React-сервер
    : `file://${path.join(app.getAppPath(), 'build', 'index.html')}`; // В продакшене загружаем локальный файл

  console.log("Загружаем страницу:", startURL);
  win.loadURL(startURL);

  // Включаем DevTools только в dev-режиме
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Логируем ошибки загрузки
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Ошибка загрузки:', errorDescription);
  });
}

app.whenReady().then(createWindow);
