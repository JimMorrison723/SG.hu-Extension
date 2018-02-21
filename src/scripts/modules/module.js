export class Module {

  constructor(name) {
    this.moduleName = name
  }

  getStatus() {
    return this.active
  }

  getName() {
    return this.moduleName;
  }

  get toggleStatus() {
    return (this.active) ? this.active = false : this.active = true
  }

}