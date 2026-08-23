import { fetchProductAction } from './product-actions.api';

describe('product-action session bootstrap', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('does not cache a rejected session request', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network failure'));

    await expect(fetchProductAction('/v1/map/query')).rejects.toThrow('network failure');

    fetchMock
      .mockResolvedValueOnce({ ok: true, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    await expect(fetchProductAction('/v1/map/query')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('re-bootstraps the session after a 401 from the proxy', async () => {
    jest.resetModules();
    global.fetch = fetchMock;
    const { fetchProductAction: freshFetchProductAction } = await import('./product-actions.api');

    fetchMock
      .mockResolvedValueOnce({ ok: true, statusText: 'OK' })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: { get: () => 'application/json' },
        json: async () => ({ title: 'Session expired' }),
      })
      .mockResolvedValueOnce({ ok: true, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    await expect(freshFetchProductAction('/v1/map/query')).rejects.toMatchObject({ status: 401 });
    await expect(freshFetchProductAction('/v1/map/query')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
