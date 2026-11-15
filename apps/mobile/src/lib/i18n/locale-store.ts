/**
 * Module-level synchronous locale store.
 */

import type { IntlShape } from "react-intl";
import { createIntl, createIntlCache } from "react-intl";

type LocaleSnapshot = {
  locale: string;
};

const listeners = new Set<() => void>();

let snapshot: LocaleSnapshot = {
  locale: "en",
};

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeLocaleStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLocaleSnapshot(): LocaleSnapshot {
  return snapshot;
}

/**
 * Called by `MobileIntlProvider` whenever the resolved locale changes.
 * Updates the module-level snapshot and notifies all `useSyncExternalStore`
 * subscribers synchronously.
 */
export function publishLocale(locale: string): void {
  if (snapshot.locale === locale) return;
  snapshot = { locale };
  emit();
}

const intlCache = createIntlCache();
let intl: IntlShape = createIntl({ locale: "en", messages: {}, onError: () => {} }, intlCache);

/** Set by MobileIntlProvider so non-React code (notifications) formats in the active locale. */
export function publishIntlMessages(locale: string, messages: Record<string, string>): void {
  intl = createIntl({ locale, defaultLocale: "en", messages }, intlCache);
}

export function getIntl(): IntlShape {
  return intl;
}
