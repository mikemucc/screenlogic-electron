'use strict';

const fs = require('fs');
const path = require('path');

const preloadPath = path.join(__dirname, '..', 'preload.js');

const sigs = {
  discover: 'timeout',
  closeFinder: '',
  remoteLogin: 'systemName',
  closeRemoteLogin: '',
  initUnit: 'server',
  initConnection: 'systemName, address, port, password, senderId',
  connect: '',
  close: '',
  addClient: 'clientId, senderId',
  removeClient: 'clientId, senderId',
  getVersion: 'senderId',
  pingServer: 'senderId',
  reconnect: '',
  status: '',
  getSystemTime: 'senderId',
  setSystemTime: 'date, adjustForDST, senderId',
  getWeatherForecast: 'senderId',
  getHistoryData: 'fromTime, toTime, senderId',
  getAllCircuitNames: 'senderId',
  getNCircuitNames: 'senderId',
  getCircuitNames: 'size, senderId',
  getCircuitDefinitions: 'senderId',
  getEquipmentConfiguration: 'senderId',
  getEquipmentState: 'senderId',
  getCustomNames: 'senderId',
  setCustomName: 'idx, name, senderId',
  cancelDelay: 'senderId',
  getControllerConfig: 'senderId',
  sendLightCommand: 'command, senderId',
  setCircuitRuntimeById: 'circuitId, runTime, senderId',
  setCircuit: 'circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId',
  setCircuitState: 'circuitId, state, senderId',
  setSetPoint: 'bodyIndex, temperature, senderId',
  setCoolSetPoint: 'bodyIndex, temperature, senderId',
  setHeatMode: 'bodyIndex, heatMode, senderId',
  setPumpSpeed: 'pumpId, circuitId, speed, isRPMs, senderId',
  getPumpStatus: 'pumpId, senderId',
  setScheduleEventById: 'scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId',
  addNewScheduleEvent: 'scheduleType, senderId',
  deleteScheduleEventById: 'scheduleId, senderId',
  getScheduleData: 'scheduleType, senderId',
  getChemHistoryData: 'fromTime, toTime, senderId',
  getChemicalData: 'senderId',
  getIntellichlorConfig: 'senderId',
  setIntellichlorOutput: 'poolOutput, spaOutput, senderId',
  setIntellichlorIsActive: 'isActive, senderId',
};

const handlerNames = Object.keys(sigs);

let preload = "'use strict';\n\n";
preload += "const { contextBridge, ipcRenderer } = require('electron');\n\n";
preload += "const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);\n\n";
preload += "contextBridge.exposeInMainWorld('screenlogic', {\n";

for (const name of handlerNames) {
  const sig = sigs[name];
  const params = sig || '';
  const invokeArgs = sig ? `, ${sig}` : '';
  preload += `  ${name}: (${params}) => invoke('screenlogic:${name}'${invokeArgs}),\n`;
}

preload += "});\n";

fs.writeFileSync(preloadPath, preload);
console.log(`Generated preload.js with ${handlerNames.length} handlers`);
