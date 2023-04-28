import '@lemonmade/remote-ui/polyfill';
import {
  RemoteElement,
  RemoteRootElement,
  type RemoteMutationCallback,
} from '@lemonmade/remote-ui/elements';
import {retain} from '@quilted/quilt/threads';

import {h, Fragment, render as renderPreact} from 'preact';
import {useState, useEffect} from 'preact/hooks';

export class ButtonElement extends RemoteElement {
  static readonly properties = {
    name: {attribute: true},
    _onPress: {attribute: true},
  };
}

customElements.define('ui-button', ButtonElement);
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
      'ui-button',
      {
        name: 'World',
        _onPress: () => {
          setDate(Date.now());
        },
      },
      String(date),
    ),
  );
}
