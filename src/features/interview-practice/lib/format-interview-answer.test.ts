import { describe, expect, it } from "vitest";

import { formatInterviewAnswer } from "./format-interview-answer";

describe("formatInterviewAnswer", () => {
  it("keeps blank lines around fenced code blocks", () => {
    const answer = [
      "TypeScript checks the contract before runtime.",
      "",
      "```ts",
      "const answer: number = 42;",
      "```",
      "",
      "The emitted JavaScript no longer contains the type.",
    ].join("\n");

    expect(formatInterviewAnswer(answer)).toBe(answer);
  });

  it("returns an unclosed fence without looping", () => {
    const answer = ["Intro.", "", "```ts", "const answer = 42;"].join("\n");

    expect(formatInterviewAnswer(answer)).toBe(answer);
  });
});
