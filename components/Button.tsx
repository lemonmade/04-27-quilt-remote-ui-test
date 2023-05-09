import type {RemoteComponentProps} from '@lemonmade/remote-ui-react/host';
import type {ButtonProperties, ButtonSlots} from '../components.ts';

export function Button({
  icon,
  onPress,
  children,
}: RemoteComponentProps<ButtonProperties, ButtonSlots>) {
  // console.log({icon, onPress, children});

  return (
    <button
      style={{background: 'violet', borderRadius: 0, border: '0'}}
      onClick={() => onPress?.()}
    >
      {children}
      {icon && <span style={{marginInlineStart: '4px'}}>{icon}</span>}
    </button>
  );
}
