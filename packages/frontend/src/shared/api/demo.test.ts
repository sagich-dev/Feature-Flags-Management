import { describe, expect, it } from "vitest";
import { getDemo, getHealth } from "@/shared/api/demo";

describe("api demo (MSW)", () => {
	it("fetches health and demo successfully", async () => {
		await expect(getHealth()).resolves.toMatchObject({ ok: true });
		await expect(getDemo()).resolves.toMatchObject({ message: expect.any(String) });
	});
});
