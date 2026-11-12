'use strict';

const mockService = {
  findLocalUnits: jest.fn(),
  closeFinder: jest.fn(),
  connect: jest.fn(),
  getEquipmentState: jest.fn(),
  subscribeEquipmentState: jest.fn(),
  unsubscribeEquipmentState: jest.fn(),
};

jest.mock('../src/screenlogic-service', () => mockService);

describe('preload bridge', () => {
  let screenlogic;

  beforeAll(() => {
    global.window = {};
    jest.isolateModules(() => {
      require('../preload');
    });
    screenlogic = global.window.screenlogic;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete global.window;
  });

  test('exposes window.screenlogic', () => {
    expect(screenlogic).toBeDefined();
  });

  test('discovers units through the service directly', async () => {
    mockService.findLocalUnits.mockResolvedValue(['unit']);
    const result = await screenlogic.discover(2500);
    expect(mockService.findLocalUnits).toHaveBeenCalledWith(2500);
    expect(result).toEqual(['unit']);
  });

  test('connects through the service directly', async () => {
    mockService.connect.mockResolvedValue(true);
    await screenlogic.connect();
    expect(mockService.connect).toHaveBeenCalled();
  });

  test('subscribes and unsubscribes equipment state updates', () => {
    const callback = jest.fn();
    const unsubscribe = screenlogic.onEquipmentStateUpdate(callback);

    expect(mockService.subscribeEquipmentState).toHaveBeenCalledWith(expect.any(Function));

    const listener = mockService.subscribeEquipmentState.mock.calls[0][0];
    listener({ airTemp: 82, bodies: [] });
    expect(callback).toHaveBeenCalledWith({ airTemp: 82, bodies: [] });

    unsubscribe();
    expect(mockService.unsubscribeEquipmentState).toHaveBeenCalledWith(listener);
  });
});
