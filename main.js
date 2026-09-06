'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenlogicService = require('./src/screenlogic-service');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const handlers = {
  discover: async (timeout) => screenlogicService.findLocalUnits(timeout),
  closeFinder: async () => screenlogicService.closeFinder(),
  remoteLogin: async (systemName) => screenlogicService.remoteLogin(systemName),
  closeRemoteLogin: async () => screenlogicService.closeRemoteLogin(),
  initUnit: async (server) => screenlogicService.initWithUnit(server),
  initConnection: async (systemName, address, port, password, senderId) => screenlogicService.initConnection(systemName, address, port, password, senderId),
  connect: async () => screenlogicService.connect(),
  close: async () => screenlogicService.close(),
  addClient: async (clientId, senderId) => screenlogicService.addClient(clientId, senderId),
  removeClient: async (clientId, senderId) => screenlogicService.removeClient(clientId, senderId),
  getVersion: async (senderId) => screenlogicService.getVersion(senderId),
  pingServer: async (senderId) => screenlogicService.pingServer(senderId),
  reconnect: async () => screenlogicService.reconnect(),
  status: async () => screenlogicService.status(),
  getSystemTime: async (senderId) => screenlogicService.getSystemTime(senderId),
  setSystemTime: async (date, adjustForDST, senderId) => screenlogicService.setSystemTime(date, adjustForDST, senderId),
  getWeatherForecast: async (senderId) => screenlogicService.getWeatherForecast(senderId),
  getHistoryData: async (fromTime, toTime, senderId) => screenlogicService.getHistoryData(fromTime, toTime, senderId),
  getAllCircuitNames: async (senderId) => screenlogicService.getAllCircuitNames(senderId),
  getNCircuitNames: async (senderId) => screenlogicService.getNCircuitNames(senderId),
  getCircuitNames: async (size, senderId) => screenlogicService.getCircuitNames(size, senderId),
  getCircuitDefinitions: async (senderId) => screenlogicService.getCircuitDefinitions(senderId),
  getEquipmentConfiguration: async (senderId) => screenlogicService.getEquipmentConfiguration(senderId),
  getEquipmentState: async (senderId) => screenlogicService.getEquipmentState(senderId),
  getCustomNames: async (senderId) => screenlogicService.getCustomNames(senderId),
  setCustomName: async (idx, name, senderId) => screenlogicService.setCustomName(idx, name, senderId),
  cancelDelay: async (senderId) => screenlogicService.cancelDelay(senderId),
  getControllerConfig: async (senderId) => screenlogicService.getControllerConfig(senderId),
  sendLightCommand: async (command, senderId) => screenlogicService.sendLightCommand(command, senderId),
  setCircuitRuntimeById: async (circuitId, runTime, senderId) => screenlogicService.setCircuitRuntimeById(circuitId, runTime, senderId),
  setCircuit: async (circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId) => screenlogicService.setCircuit(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId),
  setCircuitState: async (circuitId, state, senderId) => screenlogicService.setCircuitState(circuitId, state, senderId),
  setSetPoint: async (bodyIndex, temperature, senderId) => screenlogicService.setSetPoint(bodyIndex, temperature, senderId),
  setCoolSetPoint: async (bodyIndex, temperature, senderId) => screenlogicService.setCoolSetPoint(bodyIndex, temperature, senderId),
  setHeatMode: async (bodyIndex, heatMode, senderId) => screenlogicService.setHeatMode(bodyIndex, heatMode, senderId),
  setPumpSpeed: async (pumpId, circuitId, speed, isRPMs, senderId) => screenlogicService.setPumpSpeed(pumpId, circuitId, speed, isRPMs, senderId),
  getPumpStatus: async (pumpId, senderId) => screenlogicService.getPumpStatus(pumpId, senderId),
  setScheduleEventById: async (scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId) => screenlogicService.setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId),
  addNewScheduleEvent: async (scheduleType, senderId) => screenlogicService.addNewScheduleEvent(scheduleType, senderId),
  deleteScheduleEventById: async (scheduleId, senderId) => screenlogicService.deleteScheduleEventById(scheduleId, senderId),
  getScheduleData: async (scheduleType, senderId) => screenlogicService.getScheduleData(scheduleType, senderId),
  getChemHistoryData: async (fromTime, toTime, senderId) => screenlogicService.getChemHistoryData(fromTime, toTime, senderId),
  getChemicalData: async (senderId) => screenlogicService.getChemicalData(senderId),
  getIntellichlorConfig: async (senderId) => screenlogicService.getIntellichlorConfig(senderId),
  setIntellichlorOutput: async (poolOutput, spaOutput, senderId) => screenlogicService.setIntellichlorOutput(poolOutput, spaOutput, senderId),
  setIntellichlorIsActive: async (isActive, senderId) => screenlogicService.setIntellichlorIsActive(isActive, senderId),
};

ipcMain.on('screenlogic:subscribeEquipmentState', (event) => {
  const listener = (state) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send('screenlogic:equipmentStateUpdate', state);
    }
  };
  screenlogicService.subscribeEquipmentState(listener);
});

Object.keys(handlers).forEach((name) => {
  ipcMain.handle(`screenlogic:${name}`, async (event, ...args) => {
    try {
      return await handlers[name](...args);
    } catch (err) {
      console.error(`IPC handler screenlogic:${name} error:`, err);
      throw err;
    }
  });
});
