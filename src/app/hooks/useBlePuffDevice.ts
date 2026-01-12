import { useCallback, useEffect, useState } from "react";
import { blePuffDevice, BleConnectionStatus, BleDeviceInfo } from "../services/blePuffDevice";

const formatBleError = (error: unknown) => {
  if (error instanceof DOMException) {
    if (error.name === "NotFoundError") {
      return "Pairing was canceled.";
    }
    if (error.name === "NotAllowedError") {
      return "Bluetooth permission was denied.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to connect to the device.";
};

export function useBlePuffDevice() {
  const [status, setStatus] = useState<BleConnectionStatus>(
    blePuffDevice.getStatus()
  );
  const [lastError, setLastError] = useState<string | null>(null);
  const isSupported = blePuffDevice.isSupported();

  useEffect(() => blePuffDevice.subscribeStatus(setStatus), []);

  const connect = useCallback(async (): Promise<BleDeviceInfo> => {
    setLastError(null);
    try {
      return await blePuffDevice.connect();
    } catch (error) {
      const message = formatBleError(error);
      setLastError(message);
      throw error;
    }
  }, []);

  const reconnect = useCallback(async (): Promise<BleDeviceInfo> => {
    setLastError(null);
    try {
      return await blePuffDevice.reconnect();
    } catch (error) {
      const message = formatBleError(error);
      setLastError(message);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setLastError(null);
    blePuffDevice.disconnect();
  }, []);

  return {
    status,
    lastError,
    isSupported,
    connect,
    reconnect,
    disconnect,
  };
}
