import {
  RemoteElement,
  RemoteRootElement,
  RemoteFragmentElement,
  type RemoteElementSlotsDefinition,
  type RemoteElementPropertiesDefinition,
} from '@lemonmade/remote-ui/elements';
import {createRemoteComponent} from '@lemonmade/remote-ui-react';

export interface ViewProps {}

export class ViewElement extends RemoteElement<ViewProps> {}

export interface ButtonProps {
  name: string;
  icon?: string;
  onPress?(): void;
}

export interface ButtonSlots {
  icon?: true;
}

export class ButtonElement extends RemoteElement<ButtonProps, ButtonSlots> {
  static readonly remoteSlots: RemoteElementSlotsDefinition<ButtonSlots> = {
    icon: {},
  };

  static readonly remoteProperties: RemoteElementPropertiesDefinition<ButtonProps> =
    {
      name: {attribute: true},
      icon: {attribute: true},
      onPress: {attribute: true, callback: true},
    };
}

export interface IconProps {
  source: string;
}

export class IconElement extends RemoteElement<IconProps> {
  static readonly remoteProperties: RemoteElementPropertiesDefinition<IconProps> =
    {
      source: {attribute: true},
    };
}

export const View = createRemoteComponent(ViewElement, {
  element: 'ui-view',
});
export const Button = createRemoteComponent(ButtonElement, {
  element: 'ui-button',
});
export const Icon = createRemoteComponent(IconElement, {element: 'ui-icon'});

customElements.define('ui-view', ViewElement);
customElements.define('ui-button', ButtonElement);
customElements.define('ui-icon', IconElement);

customElements.define('remote-fragment', RemoteFragmentElement);
customElements.define('remote-root', RemoteRootElement);

declare global {
  interface HTMLElementTagNameMap {
    'ui-view': ViewElement;
    'ui-button': ButtonElement;
    'ui-icon': IconElement;

    'remote-fragment': RemoteFragmentElement;
    'remote-root': RemoteRootElement;
  }
}
