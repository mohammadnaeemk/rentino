import { Role } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "./register.dto";

function build(payload: Record<string, unknown>): Promise<unknown[]> {
  return validate(plainToInstance(RegisterDto, payload));
}

describe("RegisterDto", () => {
  const valid = {
    name: "علی رضایی",
    email: "ali@example.com",
    password: "Password1",
    role: Role.CUSTOMER,
  };

  it("accepts a well-formed customer or provider registration", async () => {
    await expect(build(valid)).resolves.toHaveLength(0);
    await expect(
      build({ ...valid, role: Role.PROVIDER }),
    ).resolves.toHaveLength(0);
  });

  it("refuses a client that tries to register as ADMIN", async () => {
    const errors = await build({ ...valid, role: Role.ADMIN });
    expect(errors).not.toHaveLength(0);
  });

  it("refuses an unknown role", async () => {
    const errors = await build({ ...valid, role: "SUPERUSER" });
    expect(errors).not.toHaveLength(0);
  });

  it("requires a strong enough password", async () => {
    await expect(
      build({ ...valid, password: "short" }),
    ).resolves.not.toHaveLength(0);
    await expect(
      build({ ...valid, password: "alllowercase1" }),
    ).resolves.not.toHaveLength(0);
    await expect(
      build({ ...valid, password: "NoDigitsHere" }),
    ).resolves.not.toHaveLength(0);
  });

  it("requires a valid email and a non-trivial name", async () => {
    await expect(
      build({ ...valid, email: "not-an-email" }),
    ).resolves.not.toHaveLength(0);
    await expect(build({ ...valid, name: "ا" })).resolves.not.toHaveLength(0);
  });
});
