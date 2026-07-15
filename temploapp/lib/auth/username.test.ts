import { describe, expect, it } from "vitest";
import { cleanUsername, normalizedName, usernameToAuthEmail } from "@/lib/auth/username";

describe("username authentication identifier", () => {
  it("cleans surrounding and repeated spaces", () => {
    expect(cleanUsername("  Pablo   Perez  ")).toBe("Pablo Perez");
  });

  it.each(["Pablo Perez", "pablo pérez", " PABLO   PEREZ "])(
    "maps %j to the same readable email",
    (name) => {
      expect(normalizedName(name)).toBe("pablo perez");
      expect(usernameToAuthEmail(name)).toBe("pablo.perez@temploapp.local");
    },
  );

  it("normalizes a multi-part accented name", () => {
    expect(usernameToAuthEmail("Juan Carlos Gómez")).toBe("juan.carlos.gomez@temploapp.local");
  });
});
