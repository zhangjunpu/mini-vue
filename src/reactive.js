class Dep {
  constructor() {
    this.dep = new Set();
  }

  depend() {
    if (activeEffect) this.dep.add(activeEffect);
  }

  notify() {
    this.dep.forEach((effect) => effect());
  }
}

/**
 * 依赖
 */
const targetMap = new WeakMap();
function getDep(target, key) {
  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Dep();
    depMap.set(key, dep);
  }
  return dep;
}

let activeEffect;
function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

/**
 * Vue2数据劫持
 */
function reactive2(raw) {
  Object.keys(raw).forEach((key) => {
    const dep = getDep(raw, key);
    let value = raw[key];
    Object.defineProperty(raw, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newValue) {
        if (value !== newValue) {
          value = newValue;
          dep.notify();
        }
      },
    });
  });
  return raw;
}

/**
 * Vue3数据劫持
 */
function reactive(raw) {
  return new Proxy(raw, {
    get: (target, key) => {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set: (target, key, value) => {
      const dep = getDep(target, key);
      dep.notify();
      target[key] = value;
      return true;
    },
  });
}

export { watchEffect, reactive };
