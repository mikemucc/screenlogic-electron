"use strict";

const { useEffect, useState, useRef, useCallback } = React;
const e = React.createElement;

const POLL_INTERVAL_MS = 10000;
const CLEANER_STANDBY_POLL_MS = 30000;

function CircuitToggle({ circuit, onToggle, bodyIndex, isDisabled, isPending }) {
  return e(
    "div",
    {
      key: circuit.id,
      className: `circuit-toggle${circuit.state ? " active" : ""}${isDisabled ? " disabled" : ""}${isPending ? " pending" : ""}`,
      onClick: isDisabled ? undefined : () => onToggle(circuit.id, bodyIndex),
      role: "switch",
      "aria-checked": circuit.state ? "true" : "false",
      "aria-disabled": isDisabled ? "true" : "false",
      tabIndex: isDisabled ? -1 : 0,
      onKeyDown: (evt) => { if (!isDisabled && (evt.key === "Enter" || evt.key === " ")) { evt.preventDefault(); onToggle(circuit.id, bodyIndex); } },
    },
    e(
      "div",
      { className: `toggle-switch${circuit.state ? " active" : ""}${isDisabled ? " disabled" : ""}${isPending ? " pending" : ""}` },
      e("div", { className: "toggle-knob" })
    ),
    e("span", { className: `circuit-name${isDisabled ? " disabled" : ""}` }, circuit.name, isDisabled && e("span", { className: "disabled-badge" }, "Disabled"))
  );
}

function LightsCard({ lights, onLightCommand }) {
  const firstLight = lights[0];
  const lightId = firstLight?.id;
  const lightsOn = !!firstLight?.state;
  const pending = !!firstLight?.pending;

  const colorLightButtons = [
    { text: "Set", command: 2 },
    { text: "Sync", command: 3 },
    { text: "Swim", command: 4 },
  ];

  const intelliBriteButtons = [
    { text: "Party", command: 5 },
    { text: "Romance", command: 6 },
    { text: "Caribbean", command: 7 },
    { text: "American", command: 8 },
    { text: "Sunset", command: 9 },
    { text: "Royal", command: 10 },
  ];

  const solidColorButtons = [
    { text: "Blue", command: 13, color: "#2400c7" },
    { text: "Green", command: 14, color: "#00a008" },
    { text: "Red", command: 15, color: "#c20000" },
    { text: "White", command: 16, color: "#ffffff" },
    { text: "Purple", command: 17, color: "#d800ff" },
  ];

  return e(
    "div",
    { className: `body-card${lightsOn ? " is-on" : ""}` },
e(
        "div",
        { className: "body-card-header" },
        e("div", { className: "body-icon" }, "\u{1F4A1}"),
        e(
          "div",
          { className: "body-info" },
          e("h3", { className: "body-name" }, "Lights")
        ),
      e(
        "div",
        { className: "body-status" },
        e("button", {
          className: pending
            ? "status-pill status-pending"
            : `status-pill${lightsOn ? " status-on" : " status-off"}`,
          onClick: pending ? undefined : () => onLightCommand(lightId, lightsOn ? 0 : 1),
          title: pending ? "Changing..." : lightsOn ? "Turn off lights" : "Turn on lights",
        }, pending ? "..." : lightsOn ? "On" : "Off")
      )
    ),
    e(
      "div",
      { className: "light-section light-section-combined" },
      e(
        "div",
        { className: "light-sub-section" },
        e("h5", { className: "light-section-title" }, "Color Lights"),
        e(
          "div",
          { className: "light-btn-grid" },
          colorLightButtons.map(btn =>
            e("button", {
              key: btn.text,
              className: "light-btn color-light-btn",
              onClick: () => onLightCommand(lightId, btn.command),
            }, btn.text)
          )
        )
      ),
      e(
        "div",
        { className: "light-sub-section" },
        e("h5", { className: "light-section-title" }, "Solid Colors"),
        e(
          "div",
          { className: "light-color-grid" },
          solidColorButtons.map(btn =>
            e("button", {
              key: btn.text,
              className: "light-color-fab",
              style: { backgroundColor: btn.color },
              onClick: () => onLightCommand(lightId, btn.command),
              "aria-label": btn.text,
            })
          )
        )
      )
    ),
    e(
      "div",
      { className: "light-section" },
      e("h5", { className: "light-section-title" }, "IntelliBrite"),
      e(
        "div",
        { className: "light-btn-grid" },
        intelliBriteButtons.map(btn =>
          e("button", {
            key: btn.text,
            className: "light-btn intellibrite-btn",
            onClick: () => onLightCommand(lightId, btn.command),
          }, btn.text)
        )
      )
    )
  );
}

function BodyCard({ body, onCircuitToggle, onHeaterChange, onHeatModeChange, onBodyToggle, pendingCircuitId }) {
  const { index, name, temp, setPoint, circuits, isHeating, heatMode, heatModes, isOn, pending } = body;
  const icon = name.includes("Pool") ? "\u{1F3CA}" : "\u{2668}";

  return e(
    "div",
    { className: `body-card${isHeating ? " heating" : ""}${isOn ? " is-on" : ""}` },
    e(
      "div",
      { className: "body-card-header" },
      e("div", { className: "body-icon" }, icon),
      e(
        "div",
        { className: "body-info" },
        e("h3", { className: "body-name" }, name),
        e("span", { className: "body-temp-inline" }, temp ? `${(Math.round(temp * 10) / 10).toFixed(1)}\u00B0F` : "--\u00B0F")
      ),
      e(
        "div",
        { className: "body-status" },
        e("button", {
          className: pending
            ? "status-pill status-pending"
            : `status-pill${isOn ? " status-on" : " status-off"}`,
          onClick: pending ? undefined : () => onBodyToggle(index, !isOn),
          title: pending ? "Changing..." : isOn ? "Turn off" : "Turn on",
        }, pending ? "..." : isOn ? "On" : "Off")
      )
    ),
circuits && circuits.length > 0 &&
        e(
          "div",
          { className: "circuits-list" },
          circuits.map((circuit) => e(CircuitToggle, { circuit, onToggle: onCircuitToggle, bodyIndex: index, isPending: circuit.id === pendingCircuitId }))
        ),
    e(
      "div",
      { className: "heater-section" },
      e("div", { className: "section-label" }, "Heater"),
      heatModes && heatModes.length > 0 &&
        e(
          "div",
          { className: "heat-mode-grid" },
          heatModes.map((mode) =>
            e(
              "button",
              {
                key: mode.value,
                className: `heat-mode-btn${heatMode === mode.value ? " active" : ""}`,
                onClick: () => onHeatModeChange(index, mode.value),
              },
              mode.name
            )
          )
        ),
      e(
        "div",
        { className: "heater-controls" },
        e(
          "button",
          {
            className: "temp-btn",
            onClick: () => onHeaterChange(index, Math.max(40, (setPoint || 80) - 1)),
            "aria-label": "Decrease set point",
          },
          "\u2212"
        ),
        e("span", { className: "temp-setpoint" }, Math.round(setPoint || 80), "\u00B0F"),
        e("input", {
          type: "range",
          min: "40",
          max: "104",
          value: setPoint || 80,
          onChange: (evt) => onHeaterChange(index, parseInt(evt.target.value, 10)),
          className: "temp-slider",
          "aria-label": "Set point temperature",
        }),
        e(
          "button",
          {
            className: "temp-btn",
            onClick: () => onHeaterChange(index, Math.min(104, (setPoint || 80) + 1)),
            "aria-label": "Increase set point",
          },
          "+"
        )
      )
    )
  );
}

function Spinner() {
  return e("div", { className: "spinner" });
}

function LoadingView({ message }) {
  return e(
    "div",
    { className: "status-view" },
    e(Spinner),
    e("p", { className: "status-message" }, message || "Connecting\u2026")
  );
}

function ErrorView({ message, onRetry }) {
  return e(
    "div",
    { className: "status-view error" },
    e("div", { className: "error-icon" }, "\u26A0"),
    e("p", { className: "status-message" }, message || "Something went wrong"),
    onRetry && e("button", { className: "retry-btn", onClick: onRetry }, "Retry")
  );
}

const App = () => {
  const [outsideTemp, setOutsideTemp] = useState(null);
  const [bodies, setBodies] = useState([]);
  const [features, setFeatures] = useState([]);
  const [lights, setLights] = useState([]);
  const [cleanerId, setCleanerId] = useState(null);
  const [cleanerStandby, setCleanerStandby] = useState(false);
  const [showCleanerMenu, setShowCleanerMenu] = useState(false);
  const cleanerMenuRef = useRef(null);
  const cleanerStandbyConfirmedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [config, setConfig] = useState(null);
  const [connected, setConnected] = useState(false);
  const [freezeMode, setFreezeMode] = useState(0);
  const [controllerName, setControllerName] = useState("");
  const [controllerIP, setControllerIP] = useState("");
  const [pump, setPump] = useState(null);

  const configRef = useRef(null);
  const controllerConfigRef = useRef(null);
  const bodiesRef = useRef([]);
  const featuresRef = useRef([]);
  const mountedRef = useRef(true);

  const getHeatModes = useCallback((cfg) => {
    const defaultModes = [{ value: 0, name: "Off" }, { value: 1, name: "Heat" }];
    if (!cfg || !cfg.heaterConfig) {
      return defaultModes;
    }

    const hc = cfg.heaterConfig;
    const modes = [{ value: 0, name: "Off" }];

    if (hc.gasHeaterPresent) modes.push({ value: 1, name: "Gas" });
    if (hc.heatPumpPresent) modes.push({ value: 2, name: "Pump" });
    if (hc.solarHeatPumpPresent || hc.body1SolarPresent || hc.body0SolarPresent) {
      modes.push({ value: 3, name: "Solar" });
    }

    return modes.length > 1 ? modes : defaultModes;
  }, []);

  const loadEquipmentData = useCallback(async (cfg) => {
    try {
      const state = await window.screenlogic.getEquipmentState(0);

      if (!state || !state.bodies) {
        throw new Error("Missing state data from controller");
      }

      const heatModes = getHeatModes(cfg);

      const equipConfig = configRef.current;
      const controllerConfig = controllerConfigRef.current;
      const circuitInterfaceMap = {};
      const circuitFunctionMap = {};
      const circuitNameFromConfig = {};

      if (controllerConfig && Array.isArray(controllerConfig.circuitArray)) {
        controllerConfig.circuitArray.forEach((c) => {
          if (c.circuitId !== undefined) {
            if (c.interface !== undefined) circuitInterfaceMap[c.circuitId] = c.interface;
            if (c.function !== undefined) circuitFunctionMap[c.circuitId] = c.function;
            if (c.name) circuitNameFromConfig[c.circuitId] = c.name;
          }
        });
      } else if (equipConfig && Array.isArray(equipConfig.circuitArray)) {
        equipConfig.circuitArray.forEach((c) => {
          if (c.circuitId !== undefined) {
            if (c.interface !== undefined) circuitInterfaceMap[c.circuitId] = c.interface;
            if (c.function !== undefined) circuitFunctionMap[c.circuitId] = c.function;
            if (c.name) circuitNameFromConfig[c.circuitId] = c.name;
          }
        });
      }

      const bodiesData = state.bodies.map((body, idx) => {
        const isHeating = body.setPoint > body.currentTemp && body.heatMode > 0;
        return {
          index: idx,
          name: idx === 0 ? "Pool" : "Spa",
          temp: body.currentTemp || 0,
          setPoint: body.setPoint || 80,
          heatMode: body.heatMode || 0,
          isHeating,
          isOn: idx === 0,
          pending: false,
          heatModes,
          circuits: [],
        };
      });

      const featuresData = [];
      const lightsData = [];
      const unknownData = [];
      let detectedCleanerId = null;

      if (state.circuitArray && Array.isArray(state.circuitArray)) {
        state.circuitArray.forEach((circuit) => {
          const circuitId = circuit.id;
          const defName = circuitNameFromConfig[circuitId];
          const interfaceVal = circuitInterfaceMap[circuitId];
          const functionVal = circuitFunctionMap[circuitId];

          if (interfaceVal === 5) return;

          const lowerName = (defName || '').toLowerCase();
          const isCleaner = lowerName.includes('cleaner') || lowerName.includes('vacuum') || interfaceVal === 6;
          if (isCleaner) detectedCleanerId = circuitId;

          const circuitData = {
            id: circuitId,
            name: defName || `Circuit ${circuitId}`,
            state: circuit.state || false,
            function: functionVal,
            interface: interfaceVal,
          };

          if (functionVal === 2) {
            bodiesData[0].circuitData = circuitData;
            bodiesData[0].isOn = !!circuit.state;
            return;
          }
          if (functionVal === 1) {
            bodiesData[1].circuitData = circuitData;
            bodiesData[1].isOn = !!circuit.state;
            return;
          }

          if (isCleaner) {
            bodiesData[0].circuits.push(circuitData);
          } else if (interfaceVal === 2) {
            featuresData.push(circuitData);
          } else if (interfaceVal === 3 || interfaceVal === 4) {
            lightsData.push(circuitData);
          } else if (interfaceVal === 0) {
            bodiesData[0].circuits.push(circuitData);
          } else if (interfaceVal === 1) {
            bodiesData[1].circuits.push(circuitData);
          } else {
            unknownData.push(circuitData);
          }
        });
      }

      if (!mountedRef.current) return;

      setBodies(bodiesData);
      setLights(lightsData);
      setFeatures(featuresData);
      setCleanerId(detectedCleanerId);
      bodiesRef.current = bodiesData;
      featuresRef.current = featuresData;
      setOutsideTemp(state.airTemp ?? null);
      setError(null);
      setDebugInfo("");
      setLoading(false);
    } catch (err) {
      console.error("Error loading equipment data:", err);
      if (!mountedRef.current) return;
      setError(err.message || "Failed to load equipment data");
      setLoading(false);
    }
  }, [getHeatModes]);

  const loadPumpStatus = useCallback(async () => {
    if (!mountedRef.current) return;
    const cfg = configRef.current;
    if (!cfg || !Array.isArray(cfg.pumps) || cfg.pumps.length === 0) return;
    try {
      const status = await window.screenlogic.getPumpStatus(1, 0);
      if (!mountedRef.current) return;
      setPump(status);
    } catch (err) {
      console.error("Error loading pump status:", err);
    }
  }, []);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    featuresRef.current = features;
  }, [features]);

  const initializeConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo("Discovering units\u2026");

    try {
      const units = await window.screenlogic.discover(5000);

      if (!units || units.length === 0) {
        throw new Error("No ScreenLogic units found on the network");
      }

      setDebugInfo(`Found ${units.length} unit(s). Connecting\u2026`);

      const unit = units[0];
      setControllerName(unit.gatewayName || "ScreenLogic");
      setControllerIP(`${unit.address}:${unit.port}`);
      await window.screenlogic.initUnit(unit);
      await window.screenlogic.connect();
      setConnected(true);

      setDebugInfo("Loading equipment data\u2026");

      const cfg = await window.screenlogic.getEquipmentConfiguration(0);
      configRef.current = cfg;
      setConfig(cfg);

      try {
        const ctrlConfig = await window.screenlogic.getControllerConfig(0);
        controllerConfigRef.current = ctrlConfig;
      } catch (e) {
        console.warn("Could not load controller config:", e);
      }

      await loadEquipmentData(cfg);
      loadPumpStatus();
    } catch (err) {
      console.error("Connection error:", err);
      setConnected(false);
      setError(err.message || "Failed to connect to ScreenLogic");
      setDebugInfo("");
      setLoading(false);
    }
  }, [loadEquipmentData, loadPumpStatus]);

  useEffect(() => {
    if (!pump) return undefined;
    const interval = setInterval(() => {
      loadPumpStatus();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pump, loadPumpStatus]);

  useEffect(() => {
    mountedRef.current = true;
    initializeConnection();

    const unsubscribe = window.screenlogic.onEquipmentStateUpdate((state) => {
      if (!state || !mountedRef.current) return;
      if (state.freezeMode !== undefined) setFreezeMode(state.freezeMode);
      if (state.airTemp !== undefined) setOutsideTemp(state.airTemp ?? null);
      if (!state.bodies) return;

      setBodies((prev) => {
        if (!prev.length) return prev;
        return prev.map((body, idx) => {
          const serverBody = state.bodies[idx];
          if (!serverBody) return body;
          const isHeating = serverBody.setPoint > serverBody.currentTemp && serverBody.heatMode > 0;
          const circuitData = body.circuitData;
          const isOn = circuitData
            ? !!state.circuitArray?.find((c) => c.id === circuitData.id)?.state
            : body.isOn;
          return {
            ...body,
            temp: serverBody.currentTemp || body.temp,
            setPoint: serverBody.setPoint || body.setPoint,
            heatMode: serverBody.heatMode || body.heatMode,
            isHeating,
            isOn,
            pending: false,
          };
        });
      });

      setLights((prev) => {
        if (!prev.length) return prev;
        return prev.map((light) => {
          const sc = state.circuitArray?.find((c) => c.id === light.id);
          return sc ? { ...light, state: !!sc.state, color: sc.colorSet } : light;
        });
      });

      setFeatures((prev) => {
        return prev.map((feat) => {
          const sc = state.circuitArray?.find((c) => c.id === feat.id);
          return sc ? { ...feat, state: !!sc.state } : feat;
        });
      });

      if (state.cleanerDelay !== undefined) {
        setCleanerStandby(state.cleanerDelay > 0);
        cleanerStandbyConfirmedRef.current = state.cleanerDelay > 0;
      }

      setBodies((prev) => {
        if (!prev.length || cleanerId == null) return prev;
        const sc = state.circuitArray?.find((c) => c.id === cleanerId);
        if (!sc) return prev;
        return prev.map((b) => ({
          ...b,
          circuits: b.circuits.map((c) => c.id === cleanerId ? { ...c, state: !!sc.state } : c),
        }));
      });
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [initializeConnection, cleanerId]);

  useEffect(() => {
    if (!cleanerStandby || !cleanerStandbyConfirmedRef.current) return undefined;
    const interval = setInterval(async () => {
      const state = await window.screenlogic.getEquipmentState(0).catch(() => null);
      if (!state || state.cleanerDelay === undefined) return;
      setCleanerStandby(state.cleanerDelay > 0);
    }, CLEANER_STANDBY_POLL_MS);
    return () => clearInterval(interval);
  }, [cleanerStandby]);

  const handleCircuitToggle = useCallback(async (circuitId, bodyIndex) => {
    const currentFeatures = featuresRef.current;
    const currentBodies = bodiesRef.current;

    if (cleanerId === circuitId) {
      const body = bodyIndex >= 0 ? currentBodies[bodyIndex] : null;
      const circuit = body && body.circuits.find((c) => c.id === circuitId);
      if (!circuit) return;

      if (!circuit.state) {
        setBodies((prev) =>
          prev.map((b, idx) =>
            idx === bodyIndex
              ? { ...b, circuits: b.circuits.map((c) => c.id === circuitId ? { ...c, state: true } : c) }
              : b
          )
        );
        setCleanerStandby(true);
        try {
          await window.screenlogic.setCircuitState(circuitId, 1, 0);
          for (let attempt = 0; attempt < 3; attempt++) {
            const state = await window.screenlogic.getEquipmentState(0).catch(() => null);
            if (state) {
              setCleanerStandby(!!state.cleanerDelay);
              cleanerStandbyConfirmedRef.current = state.cleanerDelay > 0;
              if (state.circuitArray) {
                setBodies((prev) =>
                  prev.map((b, idx) =>
                    idx === bodyIndex
                      ? { ...b, circuits: b.circuits.map((c) => {
                          const sc = state.circuitArray.find((x) => x.id === c.id);
                          return sc ? { ...c, state: !!sc.state, color: sc.colorSet } : c;
                        }) }
                      : b
                  )
                );
              }
              if (state.cleanerDelay > 0) break;
            }
            await new Promise((r) => setTimeout(r, 400));
          }
        } catch (err) {
          console.error("Error turning on cleaner:", err);
        }
      } else {
        setBodies((prev) =>
          prev.map((b, idx) =>
            idx === bodyIndex
              ? { ...b, circuits: b.circuits.map((c) => c.id === circuitId ? { ...c, state: false } : c) }
              : b
          )
        );
        try {
          if (cleanerStandby) {
            await window.screenlogic.cancelDelay(0);
          }
          await window.screenlogic.setCircuitState(circuitId, 0, 0);
        } catch (err) {
          console.error("Error turning off cleaner:", err);
        }
        setCleanerStandby(false);
      }
      return;
    }

    let newState = false;
    if (bodyIndex === -1) {
      const circuit = currentFeatures.find((c) => c.id === circuitId);
      newState = circuit ? !circuit.state : false;
      setFeatures((prev) =>
        prev.map((c) => c.id === circuitId ? { ...c, state: newState } : c)
      );
    } else {
      const body = currentBodies[bodyIndex];
      const circuit = body && body.circuits.find((c) => c.id === circuitId);
      newState = circuit ? !circuit.state : false;
      setBodies((prev) =>
        prev.map((b, idx) => {
          if (idx !== bodyIndex) return b;
          return {
            ...b,
            circuits: b.circuits.map((c) => c.id === circuitId ? { ...c, state: newState } : c),
          };
        })
      );
    }

    try {
      await window.screenlogic.setCircuitState(circuitId, newState, 0);

      const state = await window.screenlogic.getEquipmentState(0);
      if (!state || !state.circuitArray) return;

      if (bodyIndex === -1) {
        setFeatures((prev) =>
          prev.map((c) => {
            const serverCircuit = state.circuitArray.find((sc) => sc.id === c.id);
            return serverCircuit ? { ...c, state: !!serverCircuit.state, color: serverCircuit.colorSet } : c;
          })
        );
      } else {
        setBodies((prev) =>
          prev.map((body, idx) => {
            if (idx !== bodyIndex) return body;
            return {
              ...body,
              circuits: body.circuits.map((c) => {
                const serverCircuit = state.circuitArray.find((sc) => sc.id === c.id);
                return serverCircuit ? { ...c, state: !!serverCircuit.state, color: serverCircuit.colorSet } : c;
              }),
            };
          })
        );
      }
    } catch (err) {
      console.error("Error toggling circuit:", err);
      const state = await window.screenlogic.getEquipmentState(0).catch(() => null);
      if (!state) return;
      if (bodyIndex === -1) {
        setFeatures((prev) =>
          prev.map((c) => {
            const serverCircuit = state.circuitArray.find((sc) => sc.id === c.id);
            return serverCircuit ? { ...c, state: !!serverCircuit.state, color: serverCircuit.colorSet } : c;
          })
        );
      } else {
        setBodies((prev) =>
          prev.map((body, idx) => {
            if (idx !== bodyIndex) return body;
            return {
              ...body,
              circuits: body.circuits.map((c) => {
                const serverCircuit = state.circuitArray.find((sc) => sc.id === c.id);
                return serverCircuit ? { ...c, state: !!serverCircuit.state, color: serverCircuit.colorSet } : c;
              }),
            };
          })
        );
      }
    }
  }, [cleanerId, cleanerStandby]);

  const handleHeaterChange = useCallback(async (bodyIndex, temp) => {
    try {
      await window.screenlogic.setSetPoint(bodyIndex, temp, 0);
      setBodies((prev) =>
        prev.map((body, idx) =>
          idx === bodyIndex
            ? { ...body, setPoint: temp, isHeating: temp > body.temp && body.heatMode > 0 }
            : body
        )
      );
    } catch (err) {
      console.error("Error setting set point:", err);
    }
  }, []);

  const handleHeatModeChange = useCallback(async (bodyIndex, mode) => {
    try {
      await window.screenlogic.setHeatMode(bodyIndex, mode, 0);
      setBodies((prev) =>
        prev.map((body, idx) =>
          idx === bodyIndex
            ? { ...body, heatMode: mode, isHeating: mode > 0 && body.setPoint > body.temp }
            : body
        )
      );
    } catch (err) {
      console.error("Error setting heat mode:", err);
    }
  }, []);

  const handleLightCommand = useCallback(async (circuitId, command) => {
    try {
      const newState = command === 1;
      setLights((prev) =>
        prev.map((light) =>
          light.id === circuitId ? { ...light, state: newState, pending: true } : light
        )
      );
      await window.screenlogic.sendLightCommand(command, 0);
      await new Promise((r) => setTimeout(r, 1200));
      setLights((prev) =>
        prev.map((light) =>
          light.id === circuitId ? { ...light, pending: false } : light
        )
      );
    } catch (err) {
      console.error("Error sending light command:", err);
      setLights((prev) =>
        prev.map((light) =>
          light.id === circuitId ? { ...light, pending: false } : light
        )
      );
    }
  }, []);

  const handleBodyToggle = useCallback(async (bodyIndex, isOn) => {
    const currentBodies = bodiesRef.current;
    try {
      if (!isOn) {
        setBodies((prev) =>
          prev.map((body, idx) =>
            idx === bodyIndex ? { ...body, isOn: false, pending: true } : body
          )
        );
        const body = currentBodies[bodyIndex];
        if (body && body.circuitData) {
          try {
            await window.screenlogic.setCircuitState(body.circuitData.id, 0, 0);
          } catch (e) {
            console.warn(`Failed to turn off body ${bodyIndex}:`, e);
          }
        }
        await new Promise((r) => setTimeout(r, 1000));
        setBodies((prev) =>
          prev.map((body, idx) =>
            idx === bodyIndex ? { ...body, pending: false } : body
          )
        );
        return;
      }

      const body = currentBodies[bodyIndex];
      if (!body || !body.circuitData) {
        console.warn(`No circuitData for body ${bodyIndex}`);
        return;
      }

      setBodies((prev) =>
        prev.map((b, idx) =>
          idx === bodyIndex ? { ...b, isOn: true, pending: true } : b
        )
      );

      try {
        await window.screenlogic.setCircuitState(body.circuitData.id, 1, 0);
      } catch (e) {
        console.warn(`Failed to turn on body ${bodyIndex}:`, e);
        setBodies((prev) =>
          prev.map((b, idx) =>
            idx === bodyIndex ? { ...b, pending: false } : b
          )
        );
        return;
      }

      await new Promise((r) => setTimeout(r, 1000));

      const otherIdx = bodyIndex === 0 ? 1 : 0;
      const otherBody = currentBodies[otherIdx];

      if (otherBody && otherBody.isOn && otherBody.circuitData) {
        try {
          await window.screenlogic.setCircuitState(otherBody.circuitData.id, 0, 0);
        } catch (e) {
          console.warn(`Failed to turn off body ${otherIdx}:`, e);
        }
      }

      setBodies((prev) =>
        prev.map((b, idx) =>
          idx === bodyIndex ? { ...b, isOn: true, pending: false } : { ...b, isOn: false }
        )
      );
    } catch (err) {
      console.error("Error toggling body:", err);
    }
  }, []);

  const handleStartCleanerNow = useCallback(async () => {
    setShowCleanerMenu(false);
    try {
      await window.screenlogic.cancelDelay(0);
      setCleanerStandby(false);
    } catch (err) {
      console.error("Error canceling cleaner delay:", err);
    }
  }, []);

  useEffect(() => {
    if (!showCleanerMenu) return undefined;
    const handleClickOutside = (evt) => {
      if (cleanerMenuRef.current && !cleanerMenuRef.current.contains(evt.target)) {
        setShowCleanerMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCleanerMenu]);

    if (loading) {
    return e("div", { className: "app-shell" }, e(LoadingView, { message: debugInfo }));
  }

  if (error) {
    return e("div", { className: "app-shell" }, e(ErrorView, { message: error, onRetry: initializeConnection }));
  }

  if (bodies.length === 0) {
    return e(
      "div",
      { className: "app-shell" },
      e(ErrorView, { message: "No pool/spa bodies found", onRetry: initializeConnection })
    );
  }

  return e(
    "div",
    { className: "app-shell" },
    e(
      "div",
      { className: "header" },
      e(
        "div",
        { className: "header-brand" },
        e(
          "div",
          { className: "header-brand-row" },
          e("span", { className: "header-title" }, "ScreenLogic"),
          e("span", { className: "header-info-icon", "data-tooltip": controllerName }, "i")
        ),
        e("span", { className: "header-ip" }, controllerIP)
      ),
      e(
        "div",
        { className: "header-stats" },
        cleanerStandby &&
          e("div",
            { className: "header-standby-wrapper", ref: cleanerMenuRef },
            e("button",
              {
                className: "header-standby-icon",
                "data-tooltip": "Cleaner on Standby",
                onClick: () => setShowCleanerMenu((v) => !v),
                "aria-label": "Cleaner on Standby",
                title: "Cleaner on Standby",
              },
              e("svg",
                { viewBox: "0 0 24 24", width: "22", height: "22", "aria-hidden": "true" },
                e("circle", { cx: "12", cy: "12", r: "8", fill: "none", stroke: "currentColor", strokeWidth: "1.8" }),
                e("path", { d: "M12 7.5V12l3 1.8", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" })
              )
            ),
            showCleanerMenu &&
              e("div",
                { className: "header-standby-menu" },
                e("button",
                  {
                    className: "header-standby-menu-item",
                    onClick: handleStartCleanerNow,
                  },
                  "Start Cleaner Now"
                )
              )
          ),
        freezeMode > 0 &&
          e("span", { className: "header-mode-icon freeze-icon", title: "Freeze Protect Active" }, "\u2744\uFE0F"),
        pump &&
          e(
            "div",
            { className: "header-stat header-pump" },
            e("div", { className: "header-pump-rows" },
              e("div", { className: "header-pump-row" },
                e("span", { className: "header-pump-value" }, pump.pumpRPMs.toLocaleString()),
                e("span", { className: "header-pump-label" }, "RPM")
              ),
              e("div", { className: "header-pump-row" },
                e("span", { className: "header-pump-value" }, pump.pumpGPMs),
                e("span", { className: "header-pump-label" }, "GPM")
              )
            ),
            e("span", { className: `header-pump-icon${(pump.pumpRPMs > 0 || pump.pumpGPMs > 0) ? " pump-on" : " pump-off"}`, title: "Pump" })
          ),
        e("div", { className: "header-divider" }),
        e(
          "div",
          { className: "header-stat" },
          e("span", { className: "header-stat-value" }, outsideTemp != null ? `${Math.round(outsideTemp)}\u00B0F` : "--\u00B0F"),
          e("span", { className: "header-stat-label" }, "Outside")
        )
      )
    ),
    e(
      "div",
      { className: "bodies-grid" },
      bodies.map((body) =>
        e(BodyCard, {
          key: body.index,
          body,
          onCircuitToggle: handleCircuitToggle,
          onHeaterChange: handleHeaterChange,
          onHeatModeChange: handleHeatModeChange,
          onBodyToggle: handleBodyToggle,
          pendingCircuitId: cleanerStandby ? cleanerId : null,
        })
      )
    ),
    (lights && lights.length > 0) || (features && features.length > 0) ?
      e("div", { className: "lights-features-row" },
        lights && lights.length > 0 &&
          e(LightsCard, {
            lights,
            onLightCommand: handleLightCommand,
          }),
        features && features.length > 0 &&
          e("div", { className: "body-card features-card" },
            e("div", { className: "body-card-header" },
              e("div", { className: "body-icon" }, "\u2699"),
              e("div", { className: "body-info" },
                e("h3", { className: "body-name" }, "Features")
              )
            ),
            e("div", { className: "circuits-section" },
              e("div", { className: "circuits-list" },
                features.map((circuit) => e(CircuitToggle, { circuit, onToggle: handleCircuitToggle, bodyIndex: -1 }))
              )
            )
          )
      ) :
      null
  );
};

ReactDOM.render(e(App), document.getElementById("root"));