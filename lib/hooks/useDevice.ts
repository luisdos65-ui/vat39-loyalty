"use client";

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'vat39_device_id';

export function useDevice() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
