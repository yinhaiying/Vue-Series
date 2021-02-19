
export function patch(oldVnode, vnode) {
  console.log("oldVnode:", oldVnode);
  // console.log("newVnode:", vnode);

  if (oldVnode.nodeType === 1) {
    // 如果是真实结点

    let el = createElm(vnode);
    let parentElm = oldVnode.parentNode;   // 生成真实的DOM
    parentElm.insertBefore(el, oldVnode.nextSibling)   // 将真实DOM插入到老的DOM后面
    parentElm.removeChild(oldVnode);   // 删除老的DOM结点
    return el;
  } else {
        console.log("oldVnode111:", oldVnode);
        console.log("newVnode1111:", vnode);
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
      let el = vnode.el = oldVnode.el;
      // 更新属性  新老属性做对比
      updateProperties(vnode, oldVnode.data);
      console.log("oldVnode.children:", oldVnode.children)
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
  let el = vnode.el;
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


// 比较children
function updateChildren(vnode, oldChildren = []) {
  console.log("oldChildren:", oldChildren)
  let el = vnode.el;  // el拿到的是真实结点
  let newChildren = vnode.children || [];
  // 老的有，新的没有，直接删除原来的子元素
  if (oldChildren.length > 0 && newChildren.length === 0) {
    console.log("1")
    el.innerHTML = "";
  } else if (oldChildren.length == 0 && newChildren.length > 0) {
    console.log("2")
    // 老的没有，新的有
    for (let i = 0; i < newChildren.length; i++) {
      let child = newChildren[i];
      el.appendChild(createElm(child))
    }
  }else{
     console.log("3")
    patchChildren(oldChildren,newChildren,el)
  }
}

/* 
前后都有children的比较：
如果暴力比较的话会带来不少性能问题，因此，vue在这部分做了优化。优化思路是：
1. 一些常见的操作做特殊处理。比如，对于数组说常见的操作有，在尾部添加元素push,在头部添加
元素unshift，删除尾部元素pop，删除头部元素shift,倒序reverse等。这些操作就特殊处理。

插入或者删除：
对新旧children同时做循环，哪个先结束，就终止循环。剩下的元素就是进行删除或者添加。

 */
function patchChildren(oldChildren,newChildren,parent){
  console.log("这里执行了吗")
  // oldChildren开头指针
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  // 结束指针
  let oldEndIndex = oldChildren.length -1;
  let oldEndVnode = oldChildren[oldChildren.length];
  // newChildren开头指针
  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  // 结束指针
  let newEndIndex = newChildren.length -1;
  let newEndVnode = newChildren[oldChildren.length];
  // 新旧children同时做循环， 哪个先结束， 就终止循环。 剩下的元素就是进行删除或者添加。
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
    if(isSameVnode(oldStartVnode,newStartVnode)){
      patch(oldStartVnode,newStartVnode);  // 更新属性，递归更新子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
      console.log("newStartIndex:", newStartIndex)
    }
  }
  
  // 将多余的插入进去
  if(newStartIndex <= newEndIndex){
    for(let i = 0;i < newEndIndex;i++){
      parent.appendChild(createElm(newChildren[i]));
    }
  }
}

function isSameVnode(oldVnode,newVnode){
  // 只要标签和key一样就认为是一个虚拟结点，不需要属性也一样
  console.log("oldVnode:",oldVnode,"newVnode:",newVnode)
  return oldVnode.tag === newVnode.tag;
}