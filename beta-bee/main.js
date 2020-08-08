import DjsonImports from "./djson-imports.js";

export default class BetaBee {
    constructor(mod) {
        this.mod = mod;
    }

    registerDynamicJsonGenerators() {
        DjsonImports(this.mod);
    }
}