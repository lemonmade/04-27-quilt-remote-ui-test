import '@lemonmade/remote-ui/polyfill';

import {retain} from '@quilted/quilt/threads';
import type {RemoteMutationCallback} from '@lemonmade/remote-ui';

import {renderPreact, PreactSection} from './worker/preact.ts';
import {renderSolid, SolidSection} from './worker/solid.ts';

export function render(callback: RemoteMutationCallback) {
  retain(callback);

  const root = document.createElement('remote-root');
  root.connect(callback);

  const preactRoot = document.createElement('ui-view');
  renderPreact(PreactSection, preactRoot);
  root.append(preactRoot);

  const solidRoot = document.createElement('ui-view');
  renderSolid(SolidSection, solidRoot);
  root.append(solidRoot);

  // const vueRoot = document.createElement('ui-view');
  // root.append(vueRoot);
  // createApp({
  //   mounted() {
  //     setInterval(() => {
  //       this.count += 1;
  //     }, 1000);
  //   },
  //   data() {
  //     return {
  //       date: Date.now(),
  //       count: 0,
  //     };
  //   },
  //   methods: {
  //     updateDate() {
  //       this.date = Date.now();
  //     },
  //   },
  //   render() {
  //     return [
  //       `Hello ${this.count} `,
  //       vueH(
  //         'ui-button',
  //         {
  //           name: 'World',
  //           icon: vueH('ui-icon', {source: 'baz'}),
  //           onPress: () => {
  //             this.date = Date.now();
  //           },
  //         },
  //         String(this.date),
  //       ),
  //     ];
  //   },
  // }).mount(vueRoot);
}
