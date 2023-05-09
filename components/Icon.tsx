import type {RemoteComponentProps} from '@lemonmade/remote-ui-react/host';
import type {IconProperties} from '../components.ts';

export function Icon({source}: RemoteComponentProps<IconProperties>) {
  return <span>Icon: {source}</span>;
}
