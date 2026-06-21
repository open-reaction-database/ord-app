/*
 * Copyright 2026 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// noAuth is a module-level constant the hook branches on; expose it through a
// getter backed by hoisted state so each test can flip the dev/prod path via a
// live binding (no module reload, which would duplicate React and break hooks).
const env = vi.hoisted(() => ({ noAuth: false }));
vi.mock('common/noAuth.constants.ts', () => ({
  get noAuth() {
    return env.noAuth;
  },
  e2eDevToken: 'dev-token',
}));

const auth0 = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => auth0.value }));

// useSelector runs the real selector against a minimal state shaped to the path
// selectSelf reads (state.entities.users.self), so the mock honors the selector
// argument — and would catch a selector-path regression — without a Provider.
const redux = vi.hoisted(() => ({ self: null as unknown }));
vi.mock('react-redux', () => ({
  useSelector: (
    selector: (state: { entities: { users: { self: unknown } } }) => unknown,
  ) => selector({ entities: { users: { self: redux.self } } }),
}));

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  setAccessTokenGetter: vi.fn(),
  setPermissionDeniedHandler: vi.fn(),
  createUser: vi.fn((arg: unknown) => ({ type: 'users/createUser', payload: arg })),
  getGroupList: vi.fn(() => ({ type: 'groups/getGroupList' })),
}));
vi.mock('store/useAppDispatch', () => ({ useAppDispatch: () => mocks.dispatch }));
vi.mock('store/axiosInstance.ts', () => ({
  default: {},
  setAccessTokenGetter: mocks.setAccessTokenGetter,
  setPermissionDeniedHandler: mocks.setPermissionDeniedHandler,
  getAccessToken: undefined,
}));
vi.mock('store/entities/users/users.thunks', () => ({ createUser: mocks.createUser }));
vi.mock('store/entities/groups/groups.thunks', () => ({
  getGroupList: mocks.getGroupList,
}));

import { useAuth } from './useAuth.ts';

let loginWithRedirect: ReturnType<typeof vi.fn>;
let getAccessTokenSilently: ReturnType<typeof vi.fn>;
let getIdTokenClaims: ReturnType<typeof vi.fn>;

function setAuth0(overrides: Record<string, unknown> = {}): void {
  auth0.value = {
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    loginWithRedirect,
    getAccessTokenSilently,
    getIdTokenClaims,
    ...overrides,
  };
}

beforeEach(() => {
  env.noAuth = false;
  redux.self = null;
  loginWithRedirect = vi.fn();
  getAccessTokenSilently = vi.fn().mockResolvedValue('access-tok');
  getIdTokenClaims = vi.fn().mockResolvedValue({ __raw: 'id-raw' });
  setAuth0();
});

// vi.clearAllMocks() resets the persistent hoisted mocks' call history between
// tests (their vi.fn implementations are preserved); the per-test Auth0 spies
// are rebuilt fresh in beforeEach.
afterEach(() => {
  vi.clearAllMocks();
});

describe('useAuth — no-auth dev/E2E bypass', () => {
  beforeEach(() => {
    env.noAuth = true;
  });

  it('registers a dev-token getter and provisions the mock user without redirecting', async () => {
    await act(async () => {
      renderHook(() => useAuth());
    });
    expect(mocks.setAccessTokenGetter).toHaveBeenCalledTimes(1);
    const getter = mocks.setAccessTokenGetter.mock.calls[0][0] as () => Promise<string>;
    await expect(getter()).resolves.toBe('dev-token');
    expect(mocks.createUser).toHaveBeenCalledWith({
      access_token: 'dev-token',
      id_token: 'dev-token',
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'users/createUser',
      payload: { access_token: 'dev-token', id_token: 'dev-token' },
    });
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it('reports app-loading until the current user is populated', async () => {
    const { result, rerender } = renderHook(() => useAuth());
    expect(result.current).toBe(true);
    redux.self = { id: 1 };
    rerender();
    expect(result.current).toBe(false);
  });
});

describe('useAuth — Auth0 flow', () => {
  it('redirects to Auth0 when unauthenticated and not loading', () => {
    setAuth0({ isAuthenticated: false, isLoading: false });
    renderHook(() => useAuth());
    expect(loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({ returnTo: expect.any(String) }),
      }),
    );
  });

  it('does not redirect while Auth0 is still loading', () => {
    setAuth0({ isAuthenticated: false, isLoading: true });
    renderHook(() => useAuth());
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it('registers the silent token getter once authenticated', () => {
    setAuth0({ isAuthenticated: true });
    renderHook(() => useAuth());
    expect(mocks.setAccessTokenGetter).toHaveBeenCalledWith(getAccessTokenSilently);
  });

  it('provisions the user from the id/access tokens when a user is present', async () => {
    setAuth0({ isAuthenticated: true, user: { sub: 'auth0|1' } });
    await act(async () => {
      renderHook(() => useAuth());
    });
    expect(mocks.createUser).toHaveBeenCalledWith({
      access_token: 'access-tok',
      id_token: 'id-raw',
    });
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'users/createUser',
      payload: { access_token: 'access-tok', id_token: 'id-raw' },
    });
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it('redirects when token provisioning throws', async () => {
    getAccessTokenSilently.mockRejectedValue(new Error('token failure'));
    setAuth0({ isAuthenticated: true, user: { sub: 'auth0|1' } });
    await act(async () => {
      renderHook(() => useAuth());
    });
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({ returnTo: expect.any(String) }),
      }),
    );
  });
});

describe('useAuth — permission re-gate on 403 (#617)', () => {
  it('registers a handler that refreshes group roles', async () => {
    renderHook(() => useAuth());
    expect(mocks.setPermissionDeniedHandler).toHaveBeenCalledTimes(1);
    const handler = mocks.setPermissionDeniedHandler.mock.calls[0][0] as () => void;

    await act(async () => {
      handler();
    });

    expect(mocks.getGroupList).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'groups/getGroupList' });
  });

  it('ignores re-entrant refreshes while one is still in flight', async () => {
    renderHook(() => useAuth());
    const handler = mocks.setPermissionDeniedHandler.mock.calls[0][0] as () => void;

    // Hold the first refresh open so the in-flight guard is active for the re-entrant call.
    let settleRefresh: () => void = () => {};
    mocks.dispatch.mockReturnValueOnce(
      new Promise<void>(resolve => (settleRefresh = resolve)),
    );

    handler();
    handler(); // re-entrant; must be ignored while the first refresh is pending
    expect(mocks.getGroupList).toHaveBeenCalledTimes(1);

    await act(async () => {
      settleRefresh();
      await Promise.resolve();
    });

    handler(); // the guard has cleared, so a fresh 403 refreshes again
    expect(mocks.getGroupList).toHaveBeenCalledTimes(2);
  });
});
