
export function mapState(stateArr) {
  let obj = {};
  for (let i = 0; i < stateArr.length; i++) {
    let stateName = stateArr[i];
    obj[stateName] = function () {
      return this.$store.state[stateName]
    }
  }
  console.log("obj:", obj)
  return obj;
}



export function mapGetters(gettersArr) {
  let obj = {};
  for (let i = 0; i < gettersArr.length; i++) {
    let getterName = gettersArr[i];
    obj[getterName] = function () {
      return this.$store.getters[getterName]
    }
  }
  console.log("getters:", obj)
  return obj;
}
