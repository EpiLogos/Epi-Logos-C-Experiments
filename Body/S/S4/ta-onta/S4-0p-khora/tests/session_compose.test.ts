import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { composePhaseVakAddress, rehearPhaseVakAddress } from "../modules/z-phase-vak.ts";
import { isValidVakAddress } from "../../shared/vak_address.ts";

describe("Z-phase VAK factories", () => {
  it("composePhase initialises dialogical CPF + Nous CF at session start", () => {
    const vak = composePhaseVakAddress();
    assert.equal(vak.cpf, "(00/00)");
    assert.equal(vak.cf, "(00/00)");
    assert.equal(vak.cp, "CP4.0");
    assert.deepEqual(vak.ct, ["CT0"]);
    assert.equal(vak.cfp, "CFP0");
    assert.equal(vak.cs.code, "CS1");
    assert.equal(vak.cs.direction, "Day");
    assert.ok(isValidVakAddress(vak), "compose phase VAK is canonically valid");
  });

  it("rehearPhase configures Möbius CF + Night' synthesis at session end", () => {
    const vak = rehearPhaseVakAddress();
    assert.equal(vak.cpf, "(4.0/1-4.4/5)");
    assert.equal(vak.cf, "(5/0)");
    assert.equal(vak.cp, "CP4.5");
    assert.deepEqual(vak.ct, ["CT5"]);
    assert.equal(vak.cfp, "CFP3");
    assert.equal(vak.cs.code, "CS0");
    assert.equal(vak.cs.direction, "Night'");
    assert.ok(isValidVakAddress(vak), "rehear phase VAK is canonically valid");
  });
});
