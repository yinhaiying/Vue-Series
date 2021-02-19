
/*
  <div id = "app">
    hello
    <span id= "my">world</span>
  </div>
  <script>

  render(){
    return  _c("div",{id:"app",style:{color:red}},_v("hello"),_c('span',{id:"my"}, _v("world"))
  }


*/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;   // {{}} 匹配双大括号中除换行以外的字符
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      // {color:red;fontSize:12px}
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function gen(node) {
  if (node.type === 1) {
    return generate(node);
  } else if (node.type === 3) {
    let text = node.text;
    // 如果是普通文本，不带大括号(也就是不含变量)
    // 如果不是普通文本，含有变量  hello,{{name}}  需要处理成_v("hello" + _s(name))
    // 需要将大括号包裹的结果，弄成_s(变量)
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }
    let tokens = [];
    let lastIndex = defaultTagRE.lastIndex = 0;
    let match, index;  // 每次匹配的结果
    while (match = defaultTagRE.exec(text)) {
      index = match.index;
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join("+")})`
  }
}


function genChildren(el) {
  const children = el.children;
  if (children) {
    // 将所有转化后的children用,拼接起来
    return children.map((child) => gen(child)).join(",")
  }
}




//  generate的作用是生成这样的字符串
//  _c("div",{id:"app",style:{color:red}},_v("hello"),_c('span',{id:"my"}, _v("world"))
export function generate(el) {
  let children = genChildren(el);

  let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
    }${children ? `, ${children}` : ""})`;

  return code;
}
