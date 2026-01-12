import { useEffect } from "react";
import { blePuffDevice, PuffEvent } from "../services/blePuffDevice";

export function useBlePuffEvents(handler: (event: PuffEvent) => void) {
  useEffect(() => blePuffDevice.subscribePuffs(handler), [handler]);
}
