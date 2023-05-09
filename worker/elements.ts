import {
  createRemoteElement,
  RemoteRootElement,
  RemoteFragmentElement,
} from '@lemonmade/remote-ui/elements';

import type {
  ViewProperties,
  ButtonProperties,
  ButtonSlots,
  IconProperties,
} from '../components.ts';

export const ViewElement = createRemoteElement<ViewProperties>({
  properties: {},
});

export const ButtonElement = createRemoteElement<ButtonProperties, ButtonSlots>(
  {
    properties: {
      name: {type: String},
      icon: {type: String},
      onPress: {type: Function},
    },
    slots: {
      icon: {},
    },
  },
);

export const IconElement = createRemoteElement<IconProperties>({
  properties: {
    source: {type: String},
  },
});

customElements.define('ui-view', ViewElement);
customElements.define('ui-button', ButtonElement);
customElements.define('ui-icon', IconElement);

customElements.define('remote-fragment', RemoteFragmentElement);
customElements.define('remote-root', RemoteRootElement);

declare global {
  interface HTMLElementTagNameMap {
    'ui-view': InstanceType<typeof ViewElement>;
    'ui-button': InstanceType<typeof ButtonElement>;
    'ui-icon': InstanceType<typeof IconElement>;

    'remote-fragment': RemoteFragmentElement;
    'remote-root': RemoteRootElement;
  }
}
