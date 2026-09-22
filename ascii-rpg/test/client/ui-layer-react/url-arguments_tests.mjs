import assert from "node:assert/strict";
import test from "node:test";
import { withUrlArgument } from "../../../src/client/ui-layer-react/url-arguments.js";

test("adds an argument without removing unrelated URL arguments", () => {
  const nextUrl = withUrlArgument("https://example.test/game?other=keep", "randomSeed", "value");

  assert.equal(nextUrl.searchParams.get("randomSeed"), "value");
  assert.equal(nextUrl.searchParams.get("other"), "keep");
});

test("updates an existing argument without removing unrelated URL arguments", () => {
  const nextUrl = withUrlArgument("https://example.test/game?randomSeed=old&other=keep", "randomSeed", "value");

  assert.equal(nextUrl.searchParams.get("randomSeed"), "value");
  assert.equal(nextUrl.searchParams.get("other"), "keep");
  assert.equal([...nextUrl.searchParams.keys()].filter((key) => key === "randomSeed").length, 1);
});
