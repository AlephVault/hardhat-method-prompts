const {BaseBlueprintPrompt} = require("./base");

/**
 * This blueprint-related prompt asks for many values
 * (via individual prompts) and then assembles those
 * values into a tuple.
 */
class TuplePluginPrompt extends BaseBlueprintPrompt {
    constructor({argumentTypes, ...options}) {
        super(options);
        if (!(argumentTypes instanceof Array)) {
            throw new Error(`The option argumentTypes must be an array`);
        }
        this._argumentTypes = argumentTypes;
    }

    async _run() {
        console.log(this.options.message);

        // Attempt 1. Use this._given if it looks like an array.
        // In this case, it will become a fixed input.
        // Otherwise, set it to undefined.
        if (this._given) {
            if (typeof this._given.length !== "number" || this._given.length !== this._argumentTypes.length) {
                console.error(`Invalid given value: ${this._given}`);
                this._given = undefined;
            } else {
                return await this._runFixed();
            }
        }

        // Attempt 2. Invalid or missing this._given values.
        const given = this._given || [];
        const elements = [];
        for(let index = 0; index < this._argumentTypes.length; index++) {
            elements.push((await this._apply([{
                name: "element",
                description: "A tuple element",
                message: `Element #${elements.length}:`,
                argumentType: this._argumentTypes[index]
            }], given[index])).element);
        }
        return elements;
    }

    async run() {
        this.value = await this._run();
        this.submit();
        return this.value;
    }
}

module.exports = {TuplePluginPrompt};