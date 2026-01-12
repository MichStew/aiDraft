export type BleConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export interface BleDeviceInfo {
  id: string;
  name: string | null;
}

export interface PuffEvent {
  delta: number;
  total: number;
  timestamp: number;
}

export const PUFF_SERVICE_UUID = "9fcefd20-3f2a-4d7b-9b42-9b2ea9f6b0a1";
export const PUFF_COUNT_UUID = "9fcefd21-3f2a-4d7b-9b42-9b2ea9f6b0a1";
const DEVICE_NAME_PREFIX = "Purifier-ACQD";

const statusListeners = new Set<(status: BleConnectionStatus) => void>();
const puffListeners = new Set<(event: PuffEvent) => void>();

let status: BleConnectionStatus = "disconnected";
let device: BluetoothDevice | null = null;
let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
let lastDeviceCount: number | null = null;
let userInitiatedDisconnect = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const storageKeyPrefix = "acqd:puffCount:";
const fallbackStorageKey = "acqd:puffCount";

const setStatus = (nextStatus: BleConnectionStatus) => {
  if (status === nextStatus) return;
  status = nextStatus;
  statusListeners.forEach((listener) => listener(status));
};

const getStorageKey = () =>
  device?.id ? `${storageKeyPrefix}${device.id}` : fallbackStorageKey;

const loadStoredCount = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey());
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const persistCount = (count: number) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getStorageKey(), String(count));
  } catch {
    return;
  }
};

const parsePuffCount = (value: DataView | null) => {
  if (!value || value.byteLength < 4) return 0;
  return value.getUint32(0, true);
};

const emitPuff = (delta: number, total: number) => {
  if (delta <= 0) return;
  const event = { delta, total, timestamp: Date.now() };
  puffListeners.forEach((listener) => listener(event));
};

const applyInitialCount = (currentCount: number) => {
  const storedCount = loadStoredCount();
  if (storedCount !== null && currentCount >= storedCount) {
    const delta = currentCount - storedCount;
    if (delta > 0) {
      emitPuff(delta, currentCount);
    }
  }
  lastDeviceCount = currentCount;
  persistCount(currentCount);
};

const handleCharacteristicValueChanged = (event: Event) => {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const count = parsePuffCount(target.value);

  if (lastDeviceCount === null) {
    lastDeviceCount = count;
    persistCount(count);
    return;
  }

  if (count < lastDeviceCount) {
    lastDeviceCount = count;
    persistCount(count);
    return;
  }

  const delta = count - lastDeviceCount;
  if (delta > 0) {
    emitPuff(delta, count);
  }
  lastDeviceCount = count;
  persistCount(count);
};

const setupCharacteristic = async () => {
  if (!device?.gatt) {
    throw new Error("Bluetooth device is not available.");
  }

  const server = device.gatt.connected ? device.gatt : await device.gatt.connect();
  const service = await server.getPrimaryService(PUFF_SERVICE_UUID);
  const nextCharacteristic = await service.getCharacteristic(PUFF_COUNT_UUID);

  if (characteristic) {
    characteristic.removeEventListener(
      "characteristicvaluechanged",
      handleCharacteristicValueChanged
    );
  }

  characteristic = nextCharacteristic;
  const value = await characteristic.readValue();
  const count = parsePuffCount(value);
  applyInitialCount(count);

  characteristic.addEventListener(
    "characteristicvaluechanged",
    handleCharacteristicValueChanged
  );
  await characteristic.startNotifications();
};

const handleDisconnected = () => {
  if (characteristic) {
    characteristic.removeEventListener(
      "characteristicvaluechanged",
      handleCharacteristicValueChanged
    );
  }

  characteristic = null;
  lastDeviceCount = null;

  if (userInitiatedDisconnect) {
    userInitiatedDisconnect = false;
    setStatus("disconnected");
    return;
  }

  setStatus("reconnecting");
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  reconnectTimer = setTimeout(() => {
    reconnect().catch(() => undefined);
  }, 1200);
};

const connectInternal = async (
  requestNewDevice: boolean,
  reconnecting: boolean
): Promise<BleDeviceInfo> => {
  if (!isSupported()) {
    throw new Error("Web Bluetooth is not available in this browser.");
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  userInitiatedDisconnect = false;
  setStatus(reconnecting ? "reconnecting" : "connecting");

  if (!requestNewDevice && device?.gatt?.connected && characteristic) {
    setStatus("connected");
    return { id: device.id, name: device.name ?? null };
  }

  if (requestNewDevice || !device) {
    if (device) {
      device.removeEventListener("gattserverdisconnected", handleDisconnected);
    }

    device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          namePrefix: DEVICE_NAME_PREFIX,
          services: [PUFF_SERVICE_UUID],
        },
      ],
      optionalServices: [PUFF_SERVICE_UUID],
    });

    device.addEventListener("gattserverdisconnected", handleDisconnected);
  }

  await setupCharacteristic();
  setStatus("connected");
  return { id: device.id, name: device.name ?? null };
};

const connect = () => connectInternal(true, false);

const reconnect = () => connectInternal(false, true);

const disconnect = () => {
  userInitiatedDisconnect = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (device?.gatt?.connected) {
    device.gatt.disconnect();
  } else {
    setStatus("disconnected");
  }
};

const subscribeStatus = (listener: (status: BleConnectionStatus) => void) => {
  statusListeners.add(listener);
  listener(status);
  return () => {
    statusListeners.delete(listener);
  };
};

const subscribePuffs = (listener: (event: PuffEvent) => void) => {
  puffListeners.add(listener);
  return () => {
    puffListeners.delete(listener);
  };
};

const isSupported = () =>
  typeof navigator !== "undefined" && Boolean(navigator.bluetooth);

const getStatus = () => status;

export const blePuffDevice = {
  connect,
  reconnect,
  disconnect,
  subscribeStatus,
  subscribePuffs,
  isSupported,
  getStatus,
};
