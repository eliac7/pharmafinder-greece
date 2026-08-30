/** @jest-environment node */

import {
  ApiError,
  fetchAPI,
  getResultSetTooLargeProblem,
  parseApiProblem,
} from "./base";

describe("fetchAPI problem responses", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("preserves the typed Phase-0 overflow problem", async () => {
    const problem = {
      type: "https://pharmafinder.app/problems/result-set-too-large",
      title: "Η περιοχή είναι πολύ μεγάλη",
      status: 422,
      code: "RESULT_SET_TOO_LARGE",
      endpoint: "viewport",
      limit: 500,
      result_count_lower_bound: 501,
      remediation: { kind: "zoom_in" },
    };
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(problem), {
        status: 422,
        statusText: "Unprocessable Entity",
        headers: { "content-type": "application/problem+json" },
      }),
    );

    let caught: unknown;
    try {
      await fetchAPI("/pharmacies/viewport/on_duty");
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect(getResultSetTooLargeProblem(caught, "viewport")).toEqual(problem);
  });

  it("preserves challenge fields from a problem+json response", async () => {
    const problem = parseApiProblem({
      type: "https://pharmafinder.app/problems/challenge-required",
      title: "Απαιτείται επιβεβαίωση",
      status: 428,
      code: "CHALLENGE_REQUIRED",
      challenge: {
        type: "turnstile",
        request_token: "request-token-1",
      },
    });
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(problem), {
        status: 428,
        statusText: "Precondition Required",
        headers: { "content-type": "application/problem+json" },
      }),
    );

    let caught: unknown;
    try {
      await fetchAPI("/v1/pharmacies/reveal", { method: "POST" });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).problem).toMatchObject({
      status: 428,
      code: "CHALLENGE_REQUIRED",
      challenge: {
        type: "turnstile",
        request_token: "request-token-1",
      },
    });
  });
});
