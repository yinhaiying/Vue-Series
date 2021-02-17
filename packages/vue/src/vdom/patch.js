export function patch(oldVnode, vnode) {
  // console.log("oldVnode:", oldVnode)
  let el = createElm(vnode);
  let parentElm = oldVnode.parentNode;   // 生成真实的DOM
  parentElm.insertBefore(el, oldVnode.nextSibling)   // 将真实DOM插入到老的DOM后面
  parentElm.removeChild(oldVnode);   // 删除老的DOM结点
}


function createElm(vnode) {
  console.log("vnode......", vnode)
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
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
