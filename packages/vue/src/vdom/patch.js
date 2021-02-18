import e from "express";

export function patch(oldVnode, vnode) {
  // console.log("oldVnode:", oldVnode)
  let el = createElm(vnode);
  let parentElm = oldVnode.parentNode;   // 生成真实的DOM
  parentElm.insertBefore(el, oldVnode.nextSibling)   // 将真实DOM插入到老的DOM后面
  parentElm.removeChild(oldVnode);   // 删除老的DOM结点
  return el;
}


function createElm(vnode) {
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


function updateProperties(vnode) {
  let el = vnode.el;
  let newProps = vnode.data || {};
  for (let key in newProps) {
    if (key === "style") {
      for (let styleName in newProps[key]) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps["class"]
    } else {
      el.setAttribute(key, newProps[key])
    }

  }
}
