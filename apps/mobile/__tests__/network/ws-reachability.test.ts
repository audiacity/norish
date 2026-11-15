import { describe, expect, it, vi } from "vitest";

import { notifyDisconnectUnlessNormalClose } from "@/lib/ws-reachability";

describe("notifyDisconnectUnlessNormalClose", () => {
  it("ignores a normal close (old client closed on remount)", () => {
    const notify = vi.fn();

    notifyDisconnectUnlessNormalClose({ _code: 1000, _wasClean: false }, notify);
    notifyDisconnectUnlessNormalClose({ code: 1000 }, notify);

    expect(notify).not.toHaveBeenCalled();
  });

  it("flags abnormal closes as backend unreachable", () => {
    const notify = vi.fn();

    notifyDisconnectUnlessNormalClose({ code: 1006 }, notify);
    notifyDisconnectUnlessNormalClose(undefined, notify);

    expect(notify).toHaveBeenCalledTimes(2);
  });
});
