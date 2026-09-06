'use strict';

const ScreenLogic = require('node-screenlogic');
const service = require('../src/screenlogic-service');

const dummyUnit = {
  address: '192.168.1.100',
  port: 10000,
  gatewayName: 'Local Test Unit',
  type: 2,
  gatewayType: 1,
  gatewaySubtype: 1,
};

describe('screenlogic service wrapper', () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await service.closeFinder().catch(() => {});
    await service.close().catch(() => {});
    await service.closeRemoteLogin().catch(() => {});
  });

  test('findLocalUnits calls FindUnits.searchAsync', async () => {
    const searchSpy = jest.spyOn(ScreenLogic.FindUnits.prototype, 'searchAsync').mockResolvedValue([dummyUnit]);
    const result = await service.findLocalUnits(2500);
    expect(searchSpy).toHaveBeenCalledWith(2500);
    expect(result).toEqual([dummyUnit]);
  });

  test('closeFinder returns false after auto-closing finder', async () => {
    const closeSpy = jest.spyOn(ScreenLogic.FindUnits.prototype, 'close');
    await service.findLocalUnits(1);
    const result = await service.closeFinder();
    expect(result).toBe(false);
    expect(closeSpy).toHaveBeenCalled();
  });

  test('remoteLogin and closeRemoteLogin call RemoteLogin methods', async () => {
    const connectSpy = jest.spyOn(ScreenLogic.RemoteLogin.prototype, 'connectAsync').mockResolvedValue({ ipAddr: '1.2.3.4' });
    const closeSpy = jest.spyOn(ScreenLogic.RemoteLogin.prototype, 'closeAsync').mockResolvedValue(true);
    const remote = await service.remoteLogin('Pentair: 00-00-00');
    expect(connectSpy).toHaveBeenCalled();
    expect(remote.ipAddr).toBe('1.2.3.4');
    const closed = await service.closeRemoteLogin();
    expect(closeSpy).toHaveBeenCalled();
    expect(closed).toBe(true);
  });

  test('initWithUnit initializes unit connection', () => {
    const initUnitSpy = jest.spyOn(ScreenLogic.screenlogic, 'initUnit');
    expect(service.initWithUnit(dummyUnit)).toBe(true);
    expect(initUnitSpy).toHaveBeenCalledWith(dummyUnit);
  });

  test('initConnection initializes explicit connection settings', () => {
    const initSpy = jest.spyOn(ScreenLogic.screenlogic, 'init');
    expect(service.initConnection('Test', '192.168.1.100', 10000, 'secret', 11)).toBe(true);
    expect(initSpy).toHaveBeenCalledWith('Test', '192.168.1.100', 10000, 'secret', 11);
  });

  test.each([
    ['connect', 'connectAsync', []],
    ['close', 'closeAsync', []],
    ['addClient', 'addClientAsync', [123, 456]],
    ['removeClient', 'removeClientAsync', [123, 456]],
    ['getVersion', 'getVersionAsync', [789]],
    ['pingServer', 'pingServerAsync', [789]],
    ['reconnect', 'reconnectAsync', []],
    ['getSystemTime', 'equipment.getSystemTimeAsync', [0]],
    ['setSystemTime', 'equipment.setSystemTimeAsync', [new Date(), true, 0]],
    ['getWeatherForecast', 'equipment.getWeatherForecastAsync', [0]],
    ['getHistoryData', 'equipment.getHistoryDataAsync', [new Date(), new Date(), 0]],
    ['getAllCircuitNames', 'equipment.getAllCircuitNamesAsync', [0]],
    ['getNCircuitNames', 'equipment.getNCircuitNamesAsync', [0]],
    ['getCircuitNames', 'equipment.getCircuitNamesAsync', [10, 0]],
    ['getCircuitDefinitions', 'equipment.getCircuitDefinitionsAsync', [0]],
    ['getEquipmentConfiguration', 'equipment.getEquipmentConfigurationAsync', [0]],
    ['getEquipmentState', 'equipment.getEquipmentStateAsync', [0]],
    ['getCustomNames', 'equipment.getCustomNamesAsync', [0]],
    ['setCustomName', 'equipment.setCustomNameAsync', [1, 'Spa', 0]],
    ['cancelDelay', 'equipment.cancelDelayAsync', [0]],
    ['getControllerConfig', 'equipment.getControllerConfigAsync', [0]],
    ['sendLightCommand', 'circuits.sendLightCommandAsync', [1, 0]],
    ['setCircuitRuntimeById', 'circuits.setCircuitRuntimebyIdAsync', [2, 30, 0]],
    ['setCircuit', 'circuits.setCircuitAsync', [2, 1, 3, 0, false, 0, 0]],
    ['setCircuitState', 'circuits.setCircuitStateAsync', [2, true, 0]],
    ['setSetPoint', 'bodies.setSetPointAsync', [0, 82, 0]],
    ['setCoolSetPoint', 'bodies.setCoolSetPointAsync', [0, 72, 0]],
    ['setHeatMode', 'bodies.setHeatModeAsync', [0, 3, 0]],
    ['setPumpSpeed', 'pump.setPumpSpeedAsync', [1, 2, 1500, true, 0]],
    ['getPumpStatus', 'pump.getPumpStatusAsync', [1, 0]],
    ['setScheduleEventById', 'schedule.setScheduleEventByIdAsync', [1, 2, 100, 200, 127, 0, 0, 80, 0]],
    ['addNewScheduleEvent', 'schedule.addNewScheduleEventAsync', [0, 0]],
    ['deleteScheduleEventById', 'schedule.deleteScheduleEventByIdAsync', [1, 0]],
    ['getScheduleData', 'schedule.getScheduleDataAsync', [0, 0]],
    ['getChemHistoryData', 'chem.getChemHistoryDataAsync', [new Date(), new Date(), 0]],
    ['getChemicalData', 'chem.getChemicalDataAsync', [0]],
    ['getIntellichlorConfig', 'chlor.getIntellichlorConfigAsync', [0]],
    ['setIntellichlorOutput', 'chlor.setIntellichlorOutputAsync', [10, 10, 0]],
    ['setIntellichlorIsActive', 'chlor.setIntellichlorIsActiveAsync', [true, 0]],
  ])('wrapper %s forwards to screenlogic.%s', async (wrapperName, target, args) => {
    const segments = target.split('.');
    let spyTarget = ScreenLogic.screenlogic;
    let methodName = target;

    if (segments.length > 1) {
      methodName = segments.pop();
      spyTarget = segments.reduce((current, segment) => current[segment], ScreenLogic.screenlogic);
    }

    const spy = jest.spyOn(spyTarget, methodName).mockResolvedValue('ok');
    const result = await service[wrapperName](...args);
    expect(spy).toHaveBeenCalledWith(...args);
    expect(result).toBe('ok');
  });
});
