/**
 * 生成vNode
 */
function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

/**
 * 挂载虚拟dom到真实dom
 */
function mount(vnode, parent) {
  const { tag, props, children } = vnode;
  // 1. 创建element实例
  const el = (vnode.el = document.createElement(tag));

  // 2. 添加props属性
  if (props) {
    for (const key in props) {
      const value = props[key];
      setProp(el, key, value);
    }
  }

  // 3. 添加children
  if (typeof children === 'string') {
    el.textContent = children;
  } else {
    for (const item of children) {
      mount(item, el);
    }
  }

  parent.appendChild(el);
}

/**
 * 对比两个vNode不同
 */
function patch(n1, n2) {
  // 标签不同
  if (n1.tag !== n2.tag) {
    const parentEl = n1.el.parentElement;
    parentEl.removeChild(n1.el);
    mount(n2, parentEl);
    return;
  }

  // 标签相同
  const el = (n2.el = n1.el);

  // 处理 props
  const oldProps = n1.props || {};
  const newProps = n2.props || {};
  for (const key in newProps) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (oldVal !== newVal) {
      // 事件替换
      if (key.startsWith('on') && oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
      setProp(el, key, newVal);
    }
  }

  // old中存在但是new中不存在的属性，移除
  for (const key in oldProps) {
    if (!(key in newProps)) {
      removeProp(el, key, oldProps[key]);
    }
  }

  // 处理 children
  const oldChildren = n1.children || [];
  const newChildren = n2.children || [];
  if (typeof newChildren === 'string') {
    if (typeof oldChildren === 'string') {
      el.textContent = newChildren;
    } else {
      el.innerHTML = newChildren;
    }
  } else if (typeof oldChildren === 'string') {
    // 1. old是字符串，直接挂载
    el.innerHTML = '';
    for (const item of newChildren) {
      mount(item, el);
    }
  } else {
    // old、new 都是数组
    const oldLen = oldChildren.length;
    const newLen = newChildren.length;
    const comLen = Math.min(oldLen, newLen);

    for (let i = 0; i < comLen; i++) {
      const oldNode = oldChildren[i];
      const newNode = newChildren[i];
      patch(oldNode, newNode);
    }

    // 如果new > old，new多余的执行添加操作
    if (newLen > oldLen) {
      newChildren.slice(oldLen).forEach((item) => mount(item, el));
    }

    // 如果new < old，old多余的执行删除操作
    if (newLen < oldLen) {
      oldChildren.slice(newLen).forEach((item) => {
        el.removeChild(item.el);
      });
    }
  }
}

/**
 * 给element中添加属性
 */
function setProp(el, key, value) {
  if (key.startsWith('on')) {
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.setAttribute(key, value);
  }
}

/**
 * 从element中移除属性
 */
function removeProp(el, key, value) {
  if (key.startsWith('on')) {
    el.removeEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.removeAttribute(key);
  }
}

export { h, mount, patch };
