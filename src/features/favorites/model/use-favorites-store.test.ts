import { useFavoritesStore } from "./use-favorites-store";

describe("favorite public-ID migration", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favoriteIds: [], _hasHydrated: true });
  });

  it("replaces a persisted numeric alias when its public identity resolves", () => {
    useFavoritesStore.setState({
      favoriteIds: [123, "AAAAAAAAQACAAAAAAAAAAA"],
    });

    useFavoritesStore
      .getState()
      .migrateLegacyFavorite(123, "jVLkgJjOTbik43IeIBvHcg");

    expect(useFavoritesStore.getState().favoriteIds).toEqual([
      "jVLkgJjOTbik43IeIBvHcg",
      "AAAAAAAAQACAAAAAAAAAAA",
    ]);
  });

  it("deduplicates when the public identity was already favorited", () => {
    useFavoritesStore.setState({
      favoriteIds: [123, "jVLkgJjOTbik43IeIBvHcg"],
    });

    useFavoritesStore
      .getState()
      .migrateLegacyFavorite(123, "jVLkgJjOTbik43IeIBvHcg");

    expect(useFavoritesStore.getState().favoriteIds).toEqual([
      "jVLkgJjOTbik43IeIBvHcg",
    ]);
  });

  it("migrates a numeric string created during a frontend-first rollout", () => {
    useFavoritesStore.setState({ favoriteIds: ["123"] });

    useFavoritesStore
      .getState()
      .migrateLegacyFavorite("123", "jVLkgJjOTbik43IeIBvHcg");

    expect(useFavoritesStore.getState().favoriteIds).toEqual([
      "jVLkgJjOTbik43IeIBvHcg",
    ]);
  });
});
