import { isNormalWebSocketClose } from "@norish/shared-react/providers";

/**
 * A normal (1000) close is a deliberate one: the keyed provider closes the
 * previous client on remount (auth change) while its replacement is already
 * open. A real outage closes abnormally (1006 etc.) or never reconnects, and
 * each failed reconnect closes again, so it still flips to unreachable.
 * shortcut: the shared callbacks carry no client identity, so we filter by
 * close code; a server that gracefully closes with 1000 is only noticed on
 * the next failed reconnect.
 */
export function notifyDisconnectUnlessNormalClose(
  cause: unknown,
  notifyDisconnect: () => void
): void {
  if (!isNormalWebSocketClose(cause)) {
    notifyDisconnect();
  }
}
