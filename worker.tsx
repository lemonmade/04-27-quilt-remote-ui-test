import '@lemonmade/remote-ui/polyfill';
import {
  RemoteElement,
  RemoteRootElement,
  type RemoteMutationCallback,
  type RemoteElementSlotsDefinition,
  type RemoteElementPropertiesDefinition,
  type RemoteSlotsFromElementConstructor,
  type RemotePropertiesFromElementConstructor,
} from '@lemonmade/remote-ui/elements';
import {retain} from '@quilted/quilt/threads';

import {
  h,
  Fragment,
  render as renderPreact,
  isValidElement,
  type ComponentType,
} from 'preact';
import type {ReactNode} from 'react';
import {useState, useEffect} from 'preact/hooks';

// TODO: package this up
class RemoteFragmentElement extends RemoteElement {}

export interface ButtonProps {
  name: string;
  icon?: string;
  onPress?(): void;
}

interface ButtonSlots {
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

const Button = createRemoteReactComponent('ui-button', ButtonElement);

export interface IconProps {
  source: string;
}

export class IconElement extends RemoteElement<IconProps> {
  static readonly remoteProperties: RemoteElementPropertiesDefinition<IconProps> =
    {
      source: {attribute: true},
    };
}

const Icon = createRemoteReactComponent('ui-icon', IconElement);

customElements.define('ui-button', ButtonElement);
customElements.define('ui-icon', IconElement);

customElements.define('remote-fragment', RemoteFragmentElement);
customElements.define('remote-root', RemoteRootElement);

export function render(callback: RemoteMutationCallback) {
  retain(callback);

  const root = document.createElement('remote-root') as RemoteRootElement;
  root.connect(callback);

  renderPreact(h(MyComponent, null), root);

  // let count = 0;
  // root.innerHTML = `Hello ${count} <my-element name="World">${Date.now()}</my-element>`;
  // root.children[0].onPress = () =>
  //   (root.children[0].textContent = String(Date.now()));

  // setInterval(() => {
  //   root.childNodes[0].textContent = `Hello ${++count} `;
  // }, 1000);
}

function MyComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [date, setDate] = useState(Date.now());

  return h(
    Fragment,
    null,
    `Hello ${count} `,
    h(
      Button,
      {
        // name: 'World',
        name: 'World',
        icon: h(Icon, {source: 'baz', slot: 'icon'}),
        onPress: () => {
          setDate(Date.now());
        },
      },
      String(date),
    ),
  );
}

export type RemoteComponentType<
  Properties extends Record<string, any> = {},
  Slots extends Record<string, any> = {},
> = ComponentType<RemoteComponentProps<Properties, Slots>>;

export type RemoteComponentProps<
  Properties extends Record<string, any> = {},
  Slots extends Record<string, any> = {},
> = Omit<Properties, keyof Slots> & {
  [Slot in keyof Slots]: ReactNode;
};

export type RemoteComponentPropsFromElementConstructor<
  ElementConstructor extends {new (): RemoteElement<any, any>},
> = RemoteComponentProps<
  RemotePropertiesFromElementConstructor<ElementConstructor>,
  RemoteSlotsFromElementConstructor<ElementConstructor>
>;

export type RemoteComponentTypeFromElementConstructor<
  ElementConstructor extends {new (): RemoteElement<any, any>},
> = RemoteComponentType<
  RemotePropertiesFromElementConstructor<ElementConstructor>,
  RemoteSlotsFromElementConstructor<ElementConstructor>
>;

function createRemoteReactComponent<
  Properties extends Record<string, any>,
  Slots extends Record<string, any>,
>(
  ElementName: string,
  {
    remoteProperties,
    remoteSlots,
  }: {
    new (): RemoteElement<Properties, Slots>;
    remoteProperties: RemoteElementPropertiesDefinition<Properties>;
    remoteSlots: RemoteElementSlotsDefinition<Slots>;
  },
): RemoteComponentType<Properties, Slots> {
  const propertyMap = new Map<string, string>();
  const allowedSlots = new Set(remoteSlots ? Object.keys(remoteSlots) : []);

  if (remoteProperties != null) {
    for (const property of Object.keys(remoteProperties)) {
      const descriptor = remoteProperties[property]!;

      // Alias callbacks to `_`-prefixed names so that they don’t
      // get converted into event listeners
      if (descriptor.callback) {
        propertyMap.set(property, `_${property}`);
      }
    }
  }

  const RemoteComponent: RemoteComponentType<Properties, Slots> =
    propertyMap.size > 0 || allowedSlots.size > 0
      ? function RemoteComponent(props) {
          const updatedProps: Record<string, any> = {};
          const children = toChildren(props.children);

          for (const prop in props) {
            const propValue = props[prop];

            if (allowedSlots.has(prop) && isValidElement(propValue)) {
              children.push(h('remote-fragment', {slot: prop}, propValue));
              continue;
            }

            const propertyAlias = propertyMap.get(prop);

            if (propertyAlias) {
              updatedProps[propertyAlias] = propValue;
            } else {
              updatedProps[prop] = propValue;
            }
          }

          return h(ElementName, updatedProps, ...children);
        }
      : function RemoteComponent(props) {
          return h(ElementName, props);
        };

  RemoteComponent.displayName = `RemoteComponent(${ElementName})`;

  return RemoteComponent;
}

// Simple version of React.Children.toArray()
function toChildren(value: any) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}
