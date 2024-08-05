import { h, mount, patch } from './renderer.js';
import { reactive, watchEffect } from './reactive.js';

function createApp(rootComponent) {
  return {
    mount(selector) {
      const select = document.querySelector(selector);
      let mounted = false; // 是否已挂载
      let oldNode = null;

      watchEffect(() => {
        if (!mounted) {
          oldNode = rootComponent.render();
          mount(oldNode, select);
          mounted = true;
        } else {
          const newNode = rootComponent.render();
          patch(oldNode, newNode);
          oldNode = newNode;
        }
      });
    },
  };
}

export { createApp, h, mount, patch, reactive, watchEffect };
