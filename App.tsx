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

import {View} from './components/View.tsx';
import {Button} from './components/Button.tsx';
import {Icon} from './components/Icon.tsx';

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
