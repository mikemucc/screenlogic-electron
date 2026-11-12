'use strict';

const fs = require('fs');
const path = require('path');

const preloadPath = process.env.PRELOAD_PATH
  ? path.resolve(process.env.PRELOAD_PATH)
  : path.join(__dirname, '..', 'preload.js');

const preload = `'use strict';

const screenlogicService = require('./src/screenlogic-service');

// Expose the ScreenLogic service directly to the renderer. Discovery,
// connection, polling, and schedule management all run in the renderer,
// which is the path that finds local controllers on macOS.
window.screenlogic = {
  discover: screenlogicService.findLocalUnits,
  closeFinder: screenlogicService.closeFinder,
  remoteLogin: screenlogicService.remoteLogin,
  closeRemoteLogin: screenlogicService.closeRemoteLogin,
  initUnit: screenlogicService.initWithUnit,
  initConnection: screenlogicService.initConnection,
  connect: screenlogicService.connect,
  close: screenlogicService.close,
  addClient: screenlogicService.addClient,
  removeClient: screenlogicService.removeClient,
  getVersion: screenlogicService.getVersion,
  pingServer: screenlogicService.pingServer,
  reconnect: screenlogicService.reconnect,
  status: screenlogicService.status,
  getSystemTime: screenlogicService.getSystemTime,
  setSystemTime: screenlogicService.setSystemTime,
  getWeatherForecast: screenlogicService.getWeatherForecast,
  getHistoryData: screenlogicService.getHistoryData,
  getAllCircuitNames: screenlogicService.getAllCircuitNames,
  getNCircuitNames: screenlogicService.getNCircuitNames,
  getCircuitNames: screenlogicService.getCircuitNames,
  getCircuitDefinitions: screenlogicService.getCircuitDefinitions,
  getEquipmentConfiguration: screenlogicService.getEquipmentConfiguration,
  getEquipmentState: screenlogicService.getEquipmentState,
  getCustomNames: screenlogicService.getCustomNames,
  setCustomName: screenlogicService.setCustomName,
  cancelDelay: screenlogicService.cancelDelay,
  getControllerConfig: screenlogicService.getControllerConfig,
  sendLightCommand: screenlogicService.sendLightCommand,
  setCircuitRuntimeById: screenlogicService.setCircuitRuntimeById,
  setCircuit: screenlogicService.setCircuit,
  setCircuitState: screenlogicService.setCircuitState,
  setSetPoint: screenlogicService.setSetPoint,
  setCoolSetPoint: screenlogicService.setCoolSetPoint,
  setHeatMode: screenlogicService.setHeatMode,
  setPumpSpeed: screenlogicService.setPumpSpeed,
  getPumpStatus: screenlogicService.getPumpStatus,
  setScheduleEventById: screenlogicService.setScheduleEventById,
  addNewScheduleEvent: screenlogicService.addNewScheduleEvent,
  deleteScheduleEventById: screenlogicService.deleteScheduleEventById,
  getScheduleData: screenlogicService.getScheduleData,
  getChemHistoryData: screenlogicService.getChemHistoryData,
  getChemicalData: screenlogicService.getChemicalData,
  getIntellichlorConfig: screenlogicService.getIntellichlorConfig,
  setIntellichlorOutput: screenlogicService.setIntellichlorOutput,
  setIntellichlorIsActive: screenlogicService.setIntellichlorIsActive,
  onEquipmentStateUpdate: (callback) => {
    const listener = (state) => callback(state);
    screenlogicService.subscribeEquipmentState(listener);
    return () => screenlogicService.unsubscribeEquipmentState(listener);
  },
};
`;

fs.writeFileSync(preloadPath, preload);
console.log('Generated preload.js with direct screenlogic service');
