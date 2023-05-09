import {render, type ComponentType} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {html} from 'htm/preact';

import {createRemoteComponent} from '@lemonmade/remote-ui-react';

import {ButtonElement, IconElement} from './elements.ts';

export function renderPreact(Component: ComponentType<any>, parent: Element) {
  render(html`<${Component} />`, parent);
}

const Button = createRemoteComponent(ButtonElement, {
  element: 'ui-button',
});

const Icon = createRemoteComponent(IconElement, {element: 'ui-icon'});

export function PreactSection() {
  const [count, setCount] = useState(0);
  const [date, setDate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return html`
    Preact ${count}
    <${Button}
      name="World"
      onPress=${() => setDate(Date.now())}
      icon=${html`<${Icon} source="baz" />`}
    >
      ${date}
    <//>
  `;
}
