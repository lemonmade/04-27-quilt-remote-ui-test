import {useState, useDebugValue, useEffect, type ComponentType} from 'react';
import {
  RemoteReceiver,
  type RemoteTextReceived,
  type RemoteElementReceived,
  type RemoteChildReceived,
  type RemoteNodeReceived,
} from '@lemonmade/remote-ui';

export interface RemoteRootRendererProps {
  receiver: RemoteReceiver;
  components: RemoteComponentRendererMap;
}

export interface RemoteComponentRendererProps {
  remote: RemoteElementReceived;
  receiver: RemoteReceiver;
  components: RemoteComponentRendererMap;
}

export type RemoteComponentRendererMap = Map<
  string,
  ComponentType<RemoteComponentRendererProps>
>;

export {RemoteReceiver};

export function RemoteRootRenderer(props: RemoteRootRendererProps) {
  const {receiver} = props;
  const {children} = useRemoteReceived(receiver.root, receiver)!;
  return <>{children.map((child) => renderRemoteNode(child, props))}</>;
}

export function renderRemoteNode(
  node: RemoteChildReceived,
  {
    receiver,
    components,
  }: {
    receiver: RemoteReceiver;
    components: RemoteComponentRendererMap;
  },
) {
  switch (node.type) {
    case 1: {
      const Component = components.get(node.element);

      if (Component == null) {
        throw new Error(
          `No component found for remote element: ${node.element}`,
        );
      }

      return (
        <Component remote={node} receiver={receiver} components={components} />
      );
    }
    case 3: {
      return <RemoteTextRenderer remote={node} receiver={receiver} />;
    }
    default: {
      throw new Error(`Unknown remote node type: ${String(node)}`);
    }
  }
}

export function RemoteTextRenderer({
  remote,
  receiver,
}: {
  remote: RemoteTextReceived;
  receiver: RemoteReceiver;
}) {
  const text = useRemoteReceived(remote, receiver);
  return text ? <>{text.data}</> : null;
}

export function createRemoteComponentRenderer<Props = Record<string, unknown>>(
  Component: ComponentType<Props>,
): ComponentType<RemoteComponentRendererProps> {
  function RemoteComponentRenderer({
    remote,
    receiver,
    components,
  }: RemoteComponentRendererProps) {
    const component = useRemoteReceived(remote, receiver);

    if (!component) return null;

    const {children, properties} = component;

    const options = {receiver, components};

    return (
      <Component {...(properties as any)}>
        {children.map((child) => renderRemoteNode(child, options))}
      </Component>
    );
  }

  (RemoteComponentRenderer as any).displayName = `RemoteComponent(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return RemoteComponentRenderer as any;
}

interface ReceivedState<T extends RemoteNodeReceived> {
  receiver: RemoteReceiver;
  id: RemoteNodeReceived['id'];
  version?: RemoteNodeReceived['version'];
  value?: T;
}

export function useRemoteReceived<T extends RemoteNodeReceived>(
  remote: T,
  receiver: RemoteReceiver,
) {
  const [state, setState] = useState<ReceivedState<T>>(() => {
    const value = receiver.get<T>(remote);

    return {
      id: remote.id,
      version: value?.version,
      value,
      receiver,
    };
  });

  let returnValue: T | undefined = state.value;

  // If parameters have changed since our last render, schedule an update with its current value.
  if (state.receiver !== receiver || state.id !== remote.id) {
    // When the consumer of this hook changes receiver or attached node, the node they switched
    // to might already be unmounted. We guard against that by making sure we don’t get null
    // back from the receiver, and storing the “attached” node in state whether it is actually
    // attached or not, so we have a paper trail of how we got here.
    const updated = receiver.get<T>(remote);

    // If the subscription has been updated, we'll schedule another update with React.
    // React will process this update immediately, so the old subscription value won't be committed.
    // It is still nice to avoid returning a mismatched value though, so let's override the return value.
    returnValue = updated;

    setState({
      receiver,
      id: remote.id,
      version: updated?.version,
      value: returnValue,
    });
  }

  useDebugValue(returnValue);

  useEffect(() => {
    let didUnsubscribe = false;

    const checkForUpdates = () => {
      if (didUnsubscribe) return;

      setState((previousState) => {
        const {
          id: previousId,
          version: previousVersion,
          receiver: previousReceiver,
        } = previousState;

        const {id} = remote;

        // Ignore values from stale sources
        if (previousReceiver !== receiver || previousId !== id) {
          return previousState;
        }

        // This function is also called as part of the initial useEffect() when the
        // component mounts. It’s possible that between the initial render (when the
        // remote component was for sure attached, to the best of the host’s knowledge)
        // and the effect, the component was removed from the remote tree. You’ll see that
        // the rest of this callback is careful to handle cases where the node is in this
        // state.
        const value = receiver.get<T>(remote);
        const version = value?.version;

        // If the value hasn't changed, no update is needed.
        // Return state as-is so React can bail out and avoid an unnecessary render.
        if (previousVersion === version) {
          return previousState;
        }

        return {receiver, value, id, version};
      });
    };

    const abort = new AbortController();

    receiver.subscribe(remote, checkForUpdates, {signal: abort.signal});

    // Passive effect, so we need to check if anything has changed
    checkForUpdates();

    return () => {
      didUnsubscribe = true;
      abort.abort();
    };
  }, [receiver, remote.id]);

  return returnValue;
}
