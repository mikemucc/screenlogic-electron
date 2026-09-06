"use strict";

const { useEffect, useState, useRef, useCallback } = React;
const e = React.createElement;

const POLL_INTERVAL_MS = 10000;

function CircuitToggle({ circuit, onToggle, bodyIndex, isDisabled }) {
  return e(
    "div",
    {
      key: circuit.id,
      className: `circuit-toggle${circuit.state ? " active" : ""}${isDisabled ? " disabled" : ""}`,
      onClick: isDisabled ? undefined : () => onToggle(circuit.id, bodyIndex),
      role: "switch",
      "aria-checked": circuit.state ? "true" : "false",
      "aria-disabled": isDisabled ? "true" : "false",
      tabIndex: isDisabled ? -1 : 0,
      onKeyDown: (evt) => { if (!isDisabled && (evt.key === "Enter" || evt.key === " ")) { evt.preventDefault(); onToggle(circuit.id, bodyIndex); } },
    },
    e(
      "div",
      { className: `toggle-switch${circuit.state ? " active" : ""}${isDisabled ? " disabled" : ""}` },
      e("div", { className: "toggle-knob" })
    ),
    e("span", { className: `circuit-name${isDisabled ? " disabled" : ""}` }, circuit.name, isDisabled && e("span", { className: "disabled-badge" }, "Disabled"))
  );
}

function LightsCard({ lights, onLightCommand }) {
  const lightsOn = lights.some(l => l.state);

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

  const firstLight = lights[0];
  const lightId = firstLight?.id;

  return e(
    "div",
    { className: "body-card" },
    e(
      "div",
      { className: "body-card-header" },
      e("div", { className: "body-icon" }, "\U0001F4A1"),
      e(
        "div",
        { className: "body-info" },
        e("h3", { className: "body-name" }, "Lights"),
        e("span", { className: "body-temp-label" }, lightsOn ? "On" : "Off")
      ),
      e(
        "div",
        { className: "body-status" },
        e("button", {
          className: `status-pill${lightsOn ? " status-heating" : " status-idle"}`,
          onClick: () => onLightCommand(lightId, lightsOn ? 0 : 1),
          title: lightsOn ? "Turn off lights" : "Turn on lights",
        }, lightsOn ? "On" : "Off")
      )
    ),
    e(
      "div",
      { className: "light-section" },
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
    ),
    e(
      "div",
      { className: "light-section" },
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
  );
}

function BodyCard({ body, onCircuitToggle, onHeaterChange, onHeatModeChange, onBodyToggle }) {
  const { index, name, temp, setPoint, circuits, isHeating, heatMode, heatModes, isOn } = body;
  const icon = name.includes("Pool") ? "\u{1F3CA}" : "\u{2668}";
  const heatModeName = heatModes.find((m) => m.value === heatMode)?.name ?? "Off";

  return e(
    "div",
    { className: `body-card${isHeating ? " heating" : ""}` },
    e(
      "div",
      { className: "body-card-header" },
      e("div", { className: "body-icon" }, icon),
      e(
        "div",
        { className: "body-info" },
        e("h3", { className: "body-name" }, name),
        e(
          "div",
          { className: "body-temp-row" },
          e("span", { className: "body-temp-value" }, temp ? (Math.round(temp * 10) / 10).toFixed(1) : "--", "\u00B0F"),
          e("span", { className: "body-temp-label" }, "Current")
        )
      ),
      e(
        "div",
        { className: "body-status" },
        e("button", {
          className: `status-pill${isOn ? " status-heating" : " status-idle"}`,
          onClick: () => onBodyToggle(index, !isOn),
          title: isOn ? "Turn off" : "Turn on",
        }, isOn ? "On" : "Off")
      )
    ),
    circuits && circuits.length > 0 &&
      e(
        "div",
        { className: "circuits-section" },
        e("div", { className: "section-label" }, "Circuits"),
        e(
          "div",
          { className: "circuits-list" },
          circuits.map((circuit) => e(CircuitToggle, { circuit, onToggle: onCircuitToggle, bodyIndex: index }))
        )
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
      ),
      e("div", { className: "heater-mode-display" }, "Mode: ", e("strong", null, heatModeName))
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [config, setConfig] = useState(null);
  const [connected, setConnected] = useState(false);

  const configRef = useRef(null);
  const controllerConfigRef = useRef(null);
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
          heatModes,
          circuits: [],
        };
      });

      const featuresData = [];
      const lightsData = [];
      const unknownData = [];

      if (state.circuitArray && Array.isArray(state.circuitArray)) {
        state.circuitArray.forEach((circuit) => {
          const circuitId = circuit.id;
          const defName = circuitNameFromConfig[circuitId];
          const interfaceVal = circuitInterfaceMap[circuitId];
          const functionVal = circuitFunctionMap[circuitId];

          if (interfaceVal === 5) return;

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

          if (interfaceVal === 2) {
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
    } catch (err) {
      console.error("Connection error:", err);
      setConnected(false);
      setError(err.message || "Failed to connect to ScreenLogic");
      setDebugInfo("");
      setLoading(false);
    }
  }, [loadEquipmentData]);

  useEffect(() => {
    mountedRef.current = true;
    initializeConnection();

    const interval = setInterval(() => {
      if (configRef.current) {
        loadEquipmentData(configRef.current).catch((err) =>
          console.error("Poll error:", err)
        );
      }
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [initializeConnection, loadEquipmentData]);

  const handleCircuitToggle = useCallback(async (circuitId, bodyIndex) => {
    try {
      if (bodyIndex === -1) {
        let newState = false;
        setFeatures((prev) => {
          const circuit = prev.find((c) => c.id === circuitId);
          if (circuit) newState = !circuit.state;
          return prev.map((c) => c.id === circuitId ? { ...c, state: newState } : c);
        });
        await window.screenlogic.setCircuitState(circuitId, newState, 0);
        return;
      }

      let newState = false;
      setBodies((prev) =>
        prev.map((body, idx) => {
          if (idx !== bodyIndex) return body;
          const circuit = body.circuits.find((c) => c.id === circuitId);
          if (circuit) {
            newState = !circuit.state;
            return {
              ...body,
              circuits: body.circuits.map((c) => c.id === circuitId ? { ...c, state: newState } : c),
            };
          }
          return body;
        })
      );

      await window.screenlogic.setCircuitState(circuitId, newState, 0);

      const state = await window.screenlogic.getEquipmentState(0);
      if (!state || !state.circuitArray) return;

      setBodies((prev) =>
        prev.map((body, idx) => {
          if (idx !== bodyIndex) return body;
          return {
            ...body,
            circuits: body.circuits.map((c) => {
              const serverCircuit = state.circuitArray && state.circuitArray[c.id];
              return serverCircuit ? { ...c, state: serverCircuit.state || false, color: serverCircuit.colorSet } : c;
            }),
          };
        })
      );
    } catch (err) {
      console.error("Error toggling circuit:", err);
      const state = await window.screenlogic.getEquipmentState(0).catch(() => null);
      if (state) {
        if (bodyIndex === -1) {
          setFeatures((prev) =>
            prev.map((c) => {
              const serverCircuit = state.circuitArray && state.circuitArray[c.id];
              return serverCircuit ? { ...c, state: serverCircuit.state || false, color: serverCircuit.colorSet } : c;
            })
          );
        } else {
          setBodies((prev) =>
            prev.map((body, idx) => {
              if (idx !== bodyIndex) return body;
              return {
                ...body,
                circuits: body.circuits.map((c) => {
                  const serverCircuit = state.circuitArray && state.circuitArray[c.id];
                  return serverCircuit ? { ...c, state: serverCircuit.state || false, color: serverCircuit.colorSet } : c;
                }),
              };
            })
          );
        }
      }
    }
  }, []);

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

  const handleLightCommand = useCallback(async (circuitId, command, color) => {
    try {
      await window.screenlogic.sendLightCommand({ circuitId, command, color }, 0);
      const state = await window.screenlogic.getEquipmentState(0);
      if (state && state.circuitArray) {
        setBodies((prev) =>
          prev.map((body) => ({
            ...body,
            circuits: body.circuits.map((c) => {
              const sc = state.circuitArray[c.id];
              return sc ? { ...c, state: sc.state, color: sc.colorSet } : c;
            }),
            features: body.features.map((c) => {
              const sc = state.circuitArray[c.id];
              return sc ? { ...c, state: sc.state, color: sc.colorSet } : c;
            }),
          }))
        );
      }
    } catch (err) {
      console.error("Error sending light command:", err);
    }
  }, []);

const handleBodyToggle = useCallback(async (bodyIndex, isOn) => {
    try {
      if (!isOn) {
        setBodies((prev) =>
          prev.map((body, idx) => (idx === bodyIndex ? { ...body, isOn: false } : body))
        );
        return;
      }

      const body = bodies[bodyIndex];
      if (!body || !body.circuitData) {
        console.warn(`No circuitData for body ${bodyIndex}`);
        return;
      }

      setBodies((prev) =>
        prev.map((body, idx) => ({
          ...body,
          isOn: idx === bodyIndex,
        }))
      );

      try {
        await window.screenlogic.setCircuitState(body.circuitData.id, 1, 0);
      } catch (e) {
        console.warn(`Failed to turn on body ${bodyIndex}:`, e);
      }
    } catch (err) {
      console.error("Error toggling body:", err);
    }
  }, [bodies]);

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
        e("span", { className: "header-title" }, "Pool Control"),
        e("span", { className: "header-subtitle" }, "ScreenLogic")
      ),
      e(
        "div",
        { className: "header-stats" },
        e(
          "div",
          { className: "header-stat" },
          e("span", { className: "header-stat-value" }, outsideTemp != null ? `${Math.round(outsideTemp)}\u00B0F` : "--\u00B0F"),
          e("span", { className: "header-stat-label" }, "Outside")
        ),
        e(
          "div",
          { className: "header-stat" },
          e("span", { className: `header-stat-value ${connected ? "text-ok" : "text-err"}` }, connected ? "Online" : "Offline"),
          e("span", { className: "header-stat-label" }, "Controller")
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
        })
      )
    ),
    lights && lights.length > 0 &&
      e(LightsCard, {
        lights,
        onLightCommand: handleLightCommand,
      }),
    features && features.length > 0 &&
      e("div", { className: "body-card" },
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
  );
};

ReactDOM.render(e(App), document.getElementById("root"));