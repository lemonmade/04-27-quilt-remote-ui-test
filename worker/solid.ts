import {createSignal, onCleanup} from 'solid-js';
import {render as renderSolid} from 'solid-js/web';
import solidHtml from 'solid-js/html';

export {renderSolid};

export function SolidSection() {
  const [count, setCount] = createSignal(0);
  const [date, setDate] = createSignal(Date.now());
  const timer = setInterval(() => {
    setCount((count) => count + 1);
  }, 1_000);

  onCleanup(() => {
    clearInterval(timer);
  });

  return solidHtml`
    <ui-view>
      Solid ${() => String(count())}
      <ui-button name="World" prop:onPress=${() => () => setDate(Date.now())}>
        ${() => String(date())}
        <ui-icon source=${'baz'} slot="icon" />
      </ui-button>
    </ui-view>
  `;
}
