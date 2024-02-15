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

import React, { ComponentProps } from 'react';
import { useApp, IconComponent } from '@backstage/core-plugin-api';
import { compatWrapper } from '../compatWrapper';

/**
 * @public
 * Props for the SystemIcon component.
 */
export type SystemIconProps = ComponentProps<IconComponent> & {
  // The id of the system icon to render.
  id: string;
  // An optional fallback icon component to render when the system icon is not found.
  // Default to () => null.
  Fallback?: IconComponent;
};

function SystemIcon(props: SystemIconProps) {
  const { id, Fallback = () => null, ...rest } = props;
  const app = useApp();
  const Component = app.getSystemIcon(id) ?? Fallback;
  return <Component {...rest} />;
}

/**
 * @public
 * SystemIcon is a component that renders a system icon by its id.
 * @example
 * Rendering the "kind:api" icon:
 * ```tsx
 * <SystemIcon id="kind:api" />
 * ```
 * @example
 * Customizing the fallback icon:
 * ```tsx
 * <SystemIcon id="kind:api" Fallback={ApiFallbackIcon} />
 * ```
 * @example
 * Customizing the icon font size:
 * ```tsx
 * <SystemIcon id="kind:api" fontSize="medium" />
 * ```
 */
function CompatSystemIcon(props: SystemIconProps) {
  try {
    // Check if the app context is available
    useApp();
    return <SystemIcon {...props} />;
  } catch {
    // Fallback to the compat wrapper if the app context is not available
    return compatWrapper(<SystemIcon {...props} />);
  }
}

export { CompatSystemIcon as SystemIcon };
