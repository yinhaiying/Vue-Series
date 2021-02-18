import e from "express";

export function patch(oldVnode, vnode) {
  // console.log("oldVnode:", oldVnode);
  // console.log("newVnode:", vnode);

  if (oldVnode.nodeType === 1) {
    // 如果是真实结点
    console.log("oldVnode:", oldVnode)
    let el = createElm(vnode);
    let parentElm = oldVnode.parentNode;   // 生成真实的DOM
    parentElm.insertBefore(el, oldVnode.nextSibling)   // 将真实DOM插入到老的DOM后面
    parentElm.removeChild(oldVnode);   // 删除老的DOM结点
    return el;
  } else {
    // 如果是虚拟DOM，
    if (oldVnode.tag !== vnode.tag) {
      return oldVnode.el.parentNode.replaceChild(newDOM, oldVnode.el)
    }
    //如果是undefined，说明是文本结点
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        return oldVnode.el.textContent = vnode.text;
      }
    }
    // 标签相同，复用标签，将两者的差异更新到原来的结点即可。
    if (oldVnode.tag === vnode.tag && oldVnode) {
      let el = oldVnode.el && vnode.el ? oldVnode.el : document.body;
      // 更新属性  新老属性做对比
      updateProperties(vnode, oldVnode.data);
      updateChildren(vnode, oldVnode.children)
      return el;
    }
  }
}


export function createElm(vnode) {
  let {
    tag,
    data,
    key,
    children,
    text
  } = vnode;
  if (typeof tag === "string") {
    // 创建元素，放到vnode.el上作为父元素记录下来
    vnode.el = document.createElement(vnode.tag);
    // 更新属性
    updateProperties(vnode);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}


function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {};
  let el = vnode.el || document.body;
  // 老的有，新的没有。 删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key);
    }
  }

  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  // 老的样式中有，新的没有，删除老的样式
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 新的有，直接用新的
  for (let key in newProps) {
    if (key === "style") {
      for (let styleName in newProps[key]) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps["class"]
    } else {
      // console.log("el:", el)
      el.setAttribute(key, newProps[key])
    }
  }
}


function updateChildren(vnode, oldChildren = []) {
  console.log("比对children")
  let el = vnode.el || document.body;  // el拿到的是真实结点
  let newChildren = vnode.children || [];
  // 老的有，新的没有，直接删除原来的子元素
  if (oldChildren.length > 0 && newChildren.length === 0) {
    el.innerHTML = "";
  } else if (oldChildren.length == 0 && newChildren.length > 0) {
    // 老的没有，新的有
    for (let i = 0; i < newChildren.length; i++) {
      let child = newChildren[i];
      el.appendChild(createElm(child))
    }
  }
}
