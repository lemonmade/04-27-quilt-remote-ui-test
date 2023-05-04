import 'preact/debug';
import {useEffect, useMemo} from 'react';
import {
  retain,
  release,
  useThreadWorker,
  createThreadWorker,
} from '@quilted/quilt/threads';
import {
  RemoteReceiver,
  RemoteRootRenderer,
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
  type RemoteComponentProps,
} from '@lemonmade/remote-ui-react/host';

import type {
  ViewProps,
  ButtonProps,
  ButtonSlots,
  IconProps,
} from './components.ts';

const createWorker = createThreadWorker(() => import('./worker.tsx'));

const components = new Map([
  ['remote-fragment', RemoteFragmentRenderer],
  ['ui-view', createRemoteComponentRenderer(View)],
  ['ui-button', createRemoteComponentRenderer(Button)],
  ['ui-icon', createRemoteComponentRenderer(Icon)],
]);

export default function App() {
  const worker = useThreadWorker(createWorker);
  const receiver = useMemo(() => new RemoteReceiver({retain, release}), []);

  useEffect(() => {
    worker.render(receiver.receive);
  }, [worker, receiver]);

  return <RemoteRootRenderer receiver={receiver} components={components} />;
}

function View({children}: RemoteComponentProps<ViewProps>) {
  return <div>{children}</div>;
}

function Button({
  icon,
  onPress,
  children,
}: RemoteComponentProps<ButtonProps, ButtonSlots>) {
  return (
    <button style={{background: 'red'}} onClick={() => onPress?.()}>
      {children}
      {icon && <span style={{marginInlineStart: '4px'}}>{icon}</span>}
    </button>
  );
}

function Icon({source}: RemoteComponentProps<IconProps>) {
  return <span>Icon {source}</span>;
}
