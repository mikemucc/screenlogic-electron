'use strict';

const ScreenLogic = require('node-screenlogic');
const { FindUnits, RemoteLogin, screenlogic } = ScreenLogic;

let currentFinder = null;
let currentRemoteLogin = null;
let currentServer = null;

async function findLocalUnits(searchTimeMs = 5000) {
  const finder = new FindUnits();
  currentFinder = finder;
  try {
    return await finder.searchAsync(searchTimeMs);
  } finally {
    if (currentFinder) {
      currentFinder.close();
      currentFinder = null;
    }
  }
}

async function closeFinder() {
  if (!currentFinder) {
    return false;
  }
  currentFinder.close();
  currentFinder = null;
  return true;
}

async function remoteLogin(systemName) {
  if (!systemName) {
    throw new Error('systemName is required');
  }
  const gateway = new RemoteLogin(systemName);
  currentRemoteLogin = gateway;
  return gateway.connectAsync();
}

async function closeRemoteLogin() {
  if (!currentRemoteLogin) {
    return false;
  }
  await currentRemoteLogin.closeAsync();
  currentRemoteLogin = null;
  return true;
}

function initWithUnit(server) {
  if (!server || typeof server.address !== 'string' || !server.address) {
    throw new Error('A valid local unit is required to initialize the connection');
  }

  screenlogic.initUnit(server);
  currentServer = server;
  return true;
}

function initConnection(systemName, address, port, password = '', senderId = 0) {
  if (!systemName || !address || !port) {
    throw new Error('systemName, address, and port are required');
  }

  screenlogic.init(systemName, address, port, password, senderId);
  currentServer = { systemName, address, port, password, senderId };
  return true;
}

async function connect() {
  return screenlogic.connectAsync();
}

async function close() {
  return screenlogic.closeAsync();
}

async function addClient(clientId, senderId) {
  return screenlogic.addClientAsync(clientId, senderId);
}

async function removeClient(clientId, senderId) {
  return screenlogic.removeClientAsync(clientId, senderId);
}

async function getVersion(senderId) {
  return screenlogic.getVersionAsync(senderId);
}

async function pingServer(senderId) {
  return screenlogic.pingServerAsync(senderId);
}

async function reconnect() {
  return screenlogic.reconnectAsync();
}

function status() {
  return screenlogic.status();
}

async function getSystemTime(senderId) {
  return screenlogic.equipment.getSystemTimeAsync(senderId);
}

async function setSystemTime(date, adjustForDST, senderId) {
  return screenlogic.equipment.setSystemTimeAsync(date, adjustForDST, senderId);
}

async function getWeatherForecast(senderId) {
  return screenlogic.equipment.getWeatherForecastAsync(senderId);
}

async function getHistoryData(fromTime, toTime, senderId) {
  return screenlogic.equipment.getHistoryDataAsync(fromTime, toTime, senderId);
}

async function getAllCircuitNames(senderId) {
  return screenlogic.equipment.getAllCircuitNamesAsync(senderId);
}

async function getNCircuitNames(senderId) {
  return screenlogic.equipment.getNCircuitNamesAsync(senderId);
}

async function getCircuitNames(size, senderId) {
  return screenlogic.equipment.getCircuitNamesAsync(size, senderId);
}

async function getCircuitDefinitions(senderId) {
  return screenlogic.equipment.getCircuitDefinitionsAsync(senderId);
}

async function getEquipmentConfiguration(senderId) {
  return screenlogic.equipment.getEquipmentConfigurationAsync(senderId);
}

async function getEquipmentState(senderId) {
  return screenlogic.equipment.getEquipmentStateAsync(senderId);
}

async function getCustomNames(senderId) {
  return screenlogic.equipment.getCustomNamesAsync(senderId);
}

async function setCustomName(idx, name, senderId) {
  return screenlogic.equipment.setCustomNameAsync(idx, name, senderId);
}

async function cancelDelay(senderId) {
  return screenlogic.equipment.cancelDelayAsync(senderId);
}

async function getControllerConfig(senderId) {
  return screenlogic.equipment.getControllerConfigAsync(senderId);
}

async function sendLightCommand(command, senderId) {
  return screenlogic.circuits.sendLightCommandAsync(command, senderId);
}

async function setCircuitRuntimeById(circuitId, runTime, senderId) {
  return screenlogic.circuits.setCircuitRuntimebyIdAsync(circuitId, runTime, senderId);
}

async function setCircuit(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId) {
  return screenlogic.circuits.setCircuitAsync(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId);
}

async function setCircuitState(circuitId, state, senderId) {
  return screenlogic.circuits.setCircuitStateAsync(circuitId, state, senderId);
}

async function setSetPoint(bodyIndex, temperature, senderId) {
  return screenlogic.bodies.setSetPointAsync(bodyIndex, temperature, senderId);
}

async function setCoolSetPoint(bodyIndex, temperature, senderId) {
  return screenlogic.bodies.setCoolSetPointAsync(bodyIndex, temperature, senderId);
}

async function setHeatMode(bodyIndex, heatMode, senderId) {
  return screenlogic.bodies.setHeatModeAsync(bodyIndex, heatMode, senderId);
}

async function setPumpSpeed(pumpId, circuitId, speed, isRPMs, senderId) {
  return screenlogic.pump.setPumpSpeedAsync(pumpId, circuitId, speed, isRPMs, senderId);
}

async function getPumpStatus(pumpId, senderId) {
  return screenlogic.pump.getPumpStatusAsync(pumpId, senderId);
}

async function setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId) {
  return screenlogic.schedule.setScheduleEventByIdAsync(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId);
}

async function addNewScheduleEvent(scheduleType, senderId) {
  return screenlogic.schedule.addNewScheduleEventAsync(scheduleType, senderId);
}

async function deleteScheduleEventById(scheduleId, senderId) {
  return screenlogic.schedule.deleteScheduleEventByIdAsync(scheduleId, senderId);
}

async function getScheduleData(scheduleType, senderId) {
  return screenlogic.schedule.getScheduleDataAsync(scheduleType, senderId);
}

async function getChemHistoryData(fromTime, toTime, senderId) {
  return screenlogic.chem.getChemHistoryDataAsync(fromTime, toTime, senderId);
}

async function getChemicalData(senderId) {
  return screenlogic.chem.getChemicalDataAsync(senderId);
}

async function getIntellichlorConfig(senderId) {
  return screenlogic.chlor.getIntellichlorConfigAsync(senderId);
}

async function setIntellichlorOutput(poolOutput, spaOutput, senderId) {
  return screenlogic.chlor.setIntellichlorOutputAsync(poolOutput, spaOutput, senderId);
}

async function setIntellichlorIsActive(isActive, senderId) {
  return screenlogic.chlor.setIntellichlorIsActiveAsync(isActive, senderId);
}

module.exports = {
  findLocalUnits,
  closeFinder,
  remoteLogin,
  closeRemoteLogin,
  initWithUnit,
  initConnection,
  connect,
  close,
  addClient,
  removeClient,
  getVersion,
  pingServer,
  reconnect,
  status,
  getSystemTime,
  setSystemTime,
  getWeatherForecast,
  getHistoryData,
  getAllCircuitNames,
  getNCircuitNames,
  getCircuitNames,
  getCircuitDefinitions,
  getEquipmentConfiguration,
  getEquipmentState,
  getCustomNames,
  setCustomName,
  cancelDelay,
  getControllerConfig,
  sendLightCommand,
  setCircuitRuntimeById,
  setCircuit,
  setCircuitState,
  setSetPoint,
  setCoolSetPoint,
  setHeatMode,
  setPumpSpeed,
  getPumpStatus,
  setScheduleEventById,
  addNewScheduleEvent,
  deleteScheduleEventById,
  getScheduleData,
  getChemHistoryData,
  getChemicalData,
  getIntellichlorConfig,
  setIntellichlorOutput,
  setIntellichlorIsActive,
  screenlogic,
};
