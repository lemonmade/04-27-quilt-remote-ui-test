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
} from '@lemonmade/remote-ui-react/host';

const createWorker = createThreadWorker(() => import('./worker.tsx'));

const components = new Map([
  ['remote-fragment', RemoteFragmentRenderer],
  ['ui-icon', createRemoteComponentRenderer(Icon)],
  ['ui-button', createRemoteComponentRenderer(Button)],
]);

export default function App() {
  const worker = useThreadWorker(createWorker);
  const receiver = useMemo(() => new RemoteReceiver({retain, release}), []);

  useEffect(() => {
    worker.render(receiver.receive);
  }, [worker, receiver]);

  return <RemoteRootRenderer receiver={receiver} components={components} />;
}

function Button({children, onPress, icon}) {
  return (
    <button style={{background: 'red'}} onClick={() => onPress?.()}>
      {children}
      {icon && <span style={{marginInlineStart: '4px'}}>{icon}</span>}
    </button>
  );
}

function Icon({source, slot}) {
  return <span>Icon {source}</span>;
}
