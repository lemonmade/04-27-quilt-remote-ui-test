import type {RemoteComponentProps} from '@lemonmade/remote-ui-react/host';
import type {ViewProperties} from '../components.ts';

export function View({children}: RemoteComponentProps<ViewProperties>) {
  return <div>{children}</div>;
}
