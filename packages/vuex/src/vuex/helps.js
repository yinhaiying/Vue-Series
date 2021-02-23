
export function mapState(stateArr) {
  let obj = {};
  for (let i = 0; i < stateArr.length; i++) {
    let stateName = stateArr[i];
    obj[stateName] = function () {
      return this.$store.state[stateName]
    }
  }
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
  return obj;
}


export function mapMutations(mutationsArr) {
  let obj = {};
  for (let i = 0; i < mutationsArr.length; i++) {
    let mutationName = mutationsArr[i];
    obj[mutationName] = function () {
      let item = this.$store._mutations[mutationName];
      item.forEach((mutation) => {
        mutation(...arguments)
      })
    }
  }
  return obj;
}

export function mapActions(actionsArr) {
  let obj = {};
  for (let i = 0; i < actionsArr.length; i++) {
    let actionName = actionsArr[i];
    obj[actionName] = function () {
      let item = this.$store._actions[actionName];
      console.log("222:", this.$store)
      item.forEach((action) => {
        action(...arguments)
      })
    }
  }
  console.log("obj:", obj)
  return obj;
}
