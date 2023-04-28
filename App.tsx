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
  createRemoteComponentRenderer,
} from './RemoteReceiver.tsx';

const createWorker = createThreadWorker(() => import('./worker.ts'));

const components = new Map([
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

function Button({children, onPress, ...props}) {
  return (
    <button style={{background: 'red'}} onClick={() => props._onPress()}>
      {children}
    </button>
  );
}
