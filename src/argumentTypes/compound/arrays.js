const {BaseBlueprintPrompt} = require("./base");

/**
 * This blueprint-related prompt asks for a single
 * prompt but repeated for a perhaps-given length
 * of elements.
 */
class ArrayPluginPrompt extends BaseBlueprintPrompt {
    constructor({length, argumentType, ...options}) {
        super(options);
        if (length !== undefined && (typeof length !== "number" || length < 0)) {
            throw new Error(`Invalid length: ${length}`);
        }
        if (!argumentType || Object.keys(argumentType).length === 0) {
            throw new Error(`Missing or empty item argument type`);
        }
        this._length = length;
        this._argumentType = argumentType;
    }

    /**
     * Prompts the user for a fixed amount of times.
     * @returns {Promise<*[]>} The answers (async function).
     * @private
     */
    async _runFixed() {
        const elements = [];
        for(let index = 0; index < this._length; index++) {
            let suffix = "th";
            switch(index % 10) {
                case 1:
                    suffix = "st";
                    break;
                case 2:
                    suffix = "nd";
                    break;
                case 3:
                    suffix = "rd";
                    break;
            }
            console.log(`>>> Processing input / prompting for element ${index}${suffix} of ${this._length} elements`);
            const given_ = this._given ? this._given[index] : undefined;
            elements.push((await this._apply([{
                name: "element",
                description: "Element to add",
                message: `Element #${elements.length}:`,
                argumentType: this._argumentType
            }], {element: given_})).element);
        }
        return elements;
    }

    /**
     * Prompts the user to add elements while they want to.
     * @returns {Promise<*[]>} The answers (async function).
     * @private
     */
    async _runAsWanted() {
        const elements = [];
        while(true) {
            console.log(`Currently, you've added ${elements.length || "no"} elements`)
            let {confirm} = await this._apply([{
                name: "confirm",
                description: "Whether to add a new element or not",
                message: "Do you want to add a new element?",
                argumentType: "boolean"
            }, {}]);
            if (!confirm) break;
            elements.push((await this._apply([{
                name: "element",
                description: "Element to add",
                message: `Element #${elements.length}:`,
                argumentType: this._argumentType
            }], {})).element);
        }
        return elements;
    }

    /**
     * Prompts the user to add the elements, either a fixed
     * amount of times (as given or stated) or a dynamic one.
     * @returns {Promise<*[]>} The answers (async function).
     */
    async _run() {
        console.log(this.options.message);

        // Attempt 1. Use this._given if it looks like an array.
        // In this case, it will become a fixed input.
        // Otherwise, set it to undefined.
        if (this._given) {
            if (typeof this._given.length !== "number" || this._given.length < 0 ||
                (this._length !== undefined && this._length !== this._given.length)) {
                console.error(`Invalid given value: ${this._given}`);
                this._given = undefined;
            } else {
                this._length = this._given.length;
                return await this._runFixed();
            }
        }

        // Attempt 2. Invalid or missing this._given values.
        // In this case, if this._length is properly set,
        // make a fixed amount of prompts to fill it.
        // Otherwise, keep asking the user for new elements.
        if (this._length !== undefined) {
            return await this._runFixed();
        } else {
            return await this._runAsWanted();
        }
    }

    /**
     * Prompts the user to add the elements, either a fixed
     * amount of times (as given or stated) or a dynamic one.
     * @returns {Promise<*[]>} The answers (async function).
     */
    async run() {
        this.value = await this._run();
        this.submit();
        return this.value;
    }
}

module.exports = {ArrayPluginPrompt};