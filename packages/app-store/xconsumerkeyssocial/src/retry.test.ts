import { describe, it, expect } from "vitest";
import { retryWithBackoff } from "../lib/twitterManager";

describe("retryWithBackoff", () => {
  it("retries on 429 and eventually succeeds", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      if (calls < 3) {
        const e: any = new Error("Rate limited");
        e.response = { status: 429, headers: { "retry-after": "0" } };
        throw e;
      }
      return "ok";
    };

    const res = await retryWithBackoff(fn, { retries: 4, baseDelayMs: 1 });
    expect(res).toBe("ok");
    expect(calls).toBe(3);
  });

  it("gives up after retries", async () => {
    let calls = 0;
    const fn = async () => {
      calls++;
      const e: any = new Error("Rate limited");
      e.response = { status: 429, headers: { "retry-after": "0" } };
      throw e;
    };

    await expect(retryWithBackoff(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow();
    expect(calls).toBe(3); // initial + 2 retries
  });
});
