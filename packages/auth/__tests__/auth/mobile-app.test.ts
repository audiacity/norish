// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("better-auth/adapters/drizzle", async () => {
  const { memoryAdapter } = await import("better-auth/adapters/memory");

  return { drizzleAdapter: () => memoryAdapter({}) };
});
vi.mock("@norish/db/drizzle", () => ({ db: {} }));
vi.mock("@norish/db/repositories/api-keys", () => ({ setApiKeyAuthService: vi.fn() }));
vi.mock("@norish/db/repositories/server-config", () => ({
  setConfig: vi.fn(),
  getConfig: async () => null,
}));
vi.mock("@norish/db/repositories/users", () => ({
  countUsers: vi.fn().mockResolvedValue(2),
  deleteUser: vi.fn(),
  isUserServerOwner: async () => false,
  setUserAdminStatus: vi.fn(),
}));
vi.mock("@norish/db/repositories/households", () => ({ getHouseholdForUser: vi.fn() }));
vi.mock("@norish/shared-server/config/server-config-loader", () => ({
  isRegistrationEnabled: async () => true,
}));
vi.mock("@norish/shared-server/media/avatar-cleanup", () => ({ sweepUserAvatars: vi.fn() }));
vi.mock("@norish/shared-server/realtime/connection", () => ({
  emitConnectionInvalidation: vi.fn(),
}));
vi.mock("@norish/shared-server/logger", () => {
  const logger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

  return { authLogger: logger, trpcLogger: logger, createLogger: () => logger };
});

async function load(flag?: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_URL", "http://localhost:3000");
  if (flag) vi.stubEnv("MOBILE_APP_ENABLED", flag);

  const { auth } = await import("@norish/auth/auth");
  const ctx = await auth.$context;

  return { ids: ctx.options.plugins?.map((p) => p.id) ?? [], origins: ctx.trustedOrigins };
}

afterEach(() => vi.unstubAllEnvs());

describe("MOBILE_APP_ENABLED", () => {
  it("is off by default: no expo plugin, norish:// not trusted", async () => {
    const { ids, origins } = await load();

    expect(ids).not.toContain("expo");
    expect(origins).not.toContain("norish://");
  });

  it("when true adds the expo plugin and trusts norish://", async () => {
    const { ids, origins } = await load("true");

    expect(ids).toContain("expo");
    expect(origins).toContain("norish://");
  });
});
