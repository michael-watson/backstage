/*
 * Copyright 2024 The Backstage Authors
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

import { MockAuthService } from './MockAuthService';
import {
  DEFAULT_MOCK_SERVICE_SUBJECT,
  DEFAULT_MOCK_USER_ENTITY_REF,
  MOCK_SERVICE_TOKEN_PREFIX,
  MOCK_USER_TOKEN_PREFIX,
  mockCredentials,
} from './mockCredentials';

describe('MockAuthService', () => {
  const auth = new MockAuthService('test');

  it('should reject invalid tokens', async () => {
    await expect(auth.authenticate('')).rejects.toThrow('Invalid mock token');
    await expect(auth.authenticate('not-a-mock-token')).rejects.toThrow(
      'Invalid mock token',
    );
    await expect(auth.authenticate(MOCK_USER_TOKEN_PREFIX)).rejects.toThrow(
      'Unexpected end of JSON input',
    );
    await expect(
      auth.authenticate(`${MOCK_USER_TOKEN_PREFIX}{"invalid":json}`),
    ).rejects.toThrow('Unexpected token');
    await expect(auth.authenticate(MOCK_SERVICE_TOKEN_PREFIX)).rejects.toThrow(
      'Unexpected end of JSON input',
    );
    await expect(
      auth.authenticate(`${MOCK_SERVICE_TOKEN_PREFIX}{"invalid":json}`),
    ).rejects.toThrow('Unexpected token');
  });

  it('should authenticate mock user tokens', async () => {
    await expect(
      auth.authenticate(mockCredentials.user.token()),
    ).resolves.toEqual(mockCredentials.user());

    await expect(
      auth.authenticate(mockCredentials.user.token()),
    ).resolves.toEqual(mockCredentials.user(DEFAULT_MOCK_USER_ENTITY_REF));

    await expect(
      auth.authenticate(mockCredentials.user.token('user:default/other')),
    ).resolves.toEqual(mockCredentials.user('user:default/other'));
  });

  it('should authenticate mock service tokens', async () => {
    await expect(
      auth.authenticate(mockCredentials.service.token()),
    ).resolves.toEqual(mockCredentials.service());

    await expect(
      auth.authenticate(mockCredentials.service.token()),
    ).resolves.toEqual(mockCredentials.service(DEFAULT_MOCK_SERVICE_SUBJECT));

    await expect(
      auth.authenticate(
        mockCredentials.service.token({ subject: 'plugin:catalog' }),
      ),
    ).resolves.toEqual(mockCredentials.service('plugin:catalog'));

    await expect(
      auth.authenticate(
        mockCredentials.service.token({
          targetPluginId: 'test',
        }),
      ),
    ).resolves.toEqual(mockCredentials.service());

    await expect(
      auth.authenticate(
        mockCredentials.service.token({
          targetPluginId: 'other',
        }),
      ),
    ).rejects.toThrow(
      "Invalid mock token target plugin ID, got 'other' but expected 'test'",
    );
  });

  it('should return own service credentials', async () => {
    await expect(auth.getOwnServiceCredentials()).resolves.toEqual(
      mockCredentials.service('plugin:test'),
    );
  });

  it('should check principal types', () => {
    const none = mockCredentials.none();
    const user = mockCredentials.user();
    const service = mockCredentials.service();

    expect(auth.isPrincipal(none, 'unknown')).toBe(true);
    expect(auth.isPrincipal(user, 'unknown')).toBe(true);
    expect(auth.isPrincipal(service, 'unknown')).toBe(true);

    expect(auth.isPrincipal(none, 'none')).toBe(true);
    expect(auth.isPrincipal(user, 'none')).toBe(false);
    expect(auth.isPrincipal(service, 'none')).toBe(false);

    expect(auth.isPrincipal(none, 'user')).toBe(false);
    expect(auth.isPrincipal(user, 'user')).toBe(true);
    expect(auth.isPrincipal(service, 'user')).toBe(false);

    expect(auth.isPrincipal(none, 'service')).toBe(false);
    expect(auth.isPrincipal(user, 'service')).toBe(false);
    expect(auth.isPrincipal(service, 'service')).toBe(true);
  });

  it('should issue plugin request tokens', async () => {
    await expect(
      auth.getPluginRequestToken({
        onBehalfOf: mockCredentials.user(),
        targetPluginId: 'test',
      }),
    ).resolves.toEqual({ token: mockCredentials.user.token() });

    await expect(
      auth.getPluginRequestToken({
        onBehalfOf: mockCredentials.service(),
        targetPluginId: 'test',
      }),
    ).resolves.toEqual({
      token: mockCredentials.service.token({
        targetPluginId: 'test',
      }),
    });

    await expect(
      auth.getPluginRequestToken({
        onBehalfOf: mockCredentials.service('external:other'),
        targetPluginId: 'test',
      }),
    ).resolves.toEqual({
      token: mockCredentials.service.token({
        subject: 'external:other',
        targetPluginId: 'test',
      }),
    });

    await expect(
      auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'other',
      }),
    ).resolves.toEqual({
      token: mockCredentials.service.token({
        subject: 'plugin:test',
        targetPluginId: 'other',
      }),
    });
  });
});
