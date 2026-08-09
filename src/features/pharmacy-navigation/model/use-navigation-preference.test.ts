import { act } from "@testing-library/react";

import {
  NAVIGATION_PREFERENCE_STORAGE_KEY,
  useNavigationPreferenceStore,
} from "./use-navigation-preference";

describe("useNavigationPreferenceStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useNavigationPreferenceStore.setState({
      preferredProvider: "ask",
      _hasHydrated: true,
    });
  });

  it("persists the selected provider in local storage", () => {
    act(() => {
      useNavigationPreferenceStore
        .getState()
        .setPreferredProvider("apple-maps");
    });

    const storedValue = JSON.parse(
      localStorage.getItem(NAVIGATION_PREFERENCE_STORAGE_KEY) ?? "{}"
    );

    expect(storedValue.state).toEqual({
      preferredProvider: "apple-maps",
    });
  });

  it("rehydrates the provider and marks the store as hydrated", async () => {
    useNavigationPreferenceStore.setState({
      preferredProvider: "ask",
      _hasHydrated: false,
    });
    localStorage.setItem(
      NAVIGATION_PREFERENCE_STORAGE_KEY,
      JSON.stringify({
        state: { preferredProvider: "waze" },
        version: 0,
      })
    );

    await act(async () => {
      await useNavigationPreferenceStore.persist.rehydrate();
    });

    expect(useNavigationPreferenceStore.getState()).toMatchObject({
      preferredProvider: "waze",
      _hasHydrated: true,
    });
  });
});
