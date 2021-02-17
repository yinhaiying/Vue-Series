



const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  // <aaa></aaa>  匹配标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;  // <aaa:xxx></aaa:xxx>
const startTagOpen = new RegExp(`^<${qnameCapture}`);  // 标签开头的正则，捕获的是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的</div>


// 匹配属性的三种情况 ：   class = "xxx"  class = 'xxx'  class = xxx
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;



const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的>  </div>  <input />
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;   // {{}} 匹配双大括号中除换行以外的字符









export function parseHTML(html) {
  let root;
  let currentPatent;
  let stack = [];
  while (html) {
    let textEnd = html.indexOf("<");  // 是否以<开头
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();   // 开始标签匹配的结果
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      // 结束标签
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);   // 将结束标签传入
        advance(endTagMatch[0].length);
        continue;
      }
    }
    // console.log("textEnd:", textEnd)
    // 是文本
    let text;
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      chars(text);
      advance(textEnd);
      continue;
    }

    break;
  }
  function advance(n) {
    html = html.substring(n)
  }
  // 处理开头标签  <div id = "app">
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      };
      advance(start[0].length);
      // 如果直接是闭合标签了,说明属性结束了
      let end;
      let attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
        advance(attr[0].length);
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
  // <div id = "app">hello {{name}}<span>world</span></div>
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentPatent = element;
    stack.push(element);   // 将ast元素放入栈中
  }
  function end(tagName) {
    let element = stack.pop();
    currentPatent = stack[stack.length - 1]  // [div,p]
    if (currentPatent) {
      element.parent = currentPatent;
      currentPatent.children.push(element);
    }
  }

  function chars(text) {
    text = text.replace(/\s/g, "");
    if (text) {
      currentPatent.children.push({
        tag: "",
        type: 3,
        children: [],
        text: text,
      })
    }
  }

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,   // 元素类型
      children: [],
      attrs: attrs,
      parent: null
    }
  }
  return root;
}
