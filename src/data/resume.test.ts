import { describe, expect, it } from "vitest";

import { getResumeData } from "./resume";

describe("localized resume data", () => {
  it("returns friendly Vietnamese profile and experience copy", () => {
    const resume = getResumeData("vi");

    expect(resume.description).toContain("dev");
    expect(resume.summary).toContain("Sinh ziên");
    expect(resume.work[0]?.description).toContain("Tham gia");
    expect(resume.education[0]?.degree).toBe("Hệ thống Thông tin");
  });

  it("keeps the English resume available", () => {
    const resume = getResumeData("en");

    expect(resume.description).toContain("Developer");
    expect(resume.education[0]?.degree).toBe("Information Systems");
  });

  it("keeps each project linked to its source repository", () => {
    const expectedProjectLinks = [
      "https://github.com/quan-vo-dinh/saas-pos-microservices-qrtable",
      "https://github.com/quan-vo-dinh/multi-vendor-api",
      "https://github.com/quan-vo-dinh/kicks-shoes",
      "https://github.com/quan-vo-dinh/car-garage-management",
    ];

    expect(getResumeData("en").projects.map((project) => project.href)).toEqual(
      expectedProjectLinks
    );
    expect(getResumeData("vi").projects.map((project) => project.href)).toEqual(
      expectedProjectLinks
    );
  });
});
