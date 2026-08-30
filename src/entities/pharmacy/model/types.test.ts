import { DEFAULT_RADIUS, normalizeRadius } from './types';

describe('normalizeRadius', () => {
  it.each([2, 5, 10, 20])('accepts the supported radius %s', (radius) => {
    expect(normalizeRadius(radius)).toBe(radius);
  });

  it('falls back for an arbitrary URL value', () => {
    expect(normalizeRadius(3)).toBe(DEFAULT_RADIUS);
  });
});
