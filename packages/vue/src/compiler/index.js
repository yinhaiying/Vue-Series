import { parseHTML } from "./parse.js"
import { generate } from "./generate.js"


export function compileToFunctions(template) {
  // console.log("compile:", template)
  // 1. 将html代码转化成ast，可以用ast树来描述代码
  let ast = parseHTML(template);
  // 2. 通过这颗树重新生成代码
  let code = generate(ast);
  // 3. 将字符串变成函数 由于code存在变量，这些变量需要通过实例vm获取，然后无法传递实例
  // 因此，需要使用with进行包裹，将实例传递进去,之后实例vm在调用render函数时，就能够通过
  // this获取到对应的值了。
  let render = new Function(`with(this){return ${code}}`);
  return render;
}
