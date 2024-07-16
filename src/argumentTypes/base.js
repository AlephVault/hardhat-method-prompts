const {Prompt, Input} = require("enquirer");

/**
 * This is a prompt that actually interacts with
 * the `hre.blueprints` (hardhat-blueprints) library.
 */
class BaseBlueprintPrompt extends Prompt {
    constructor({hre, nonInteractive, given, ...options}) {
        super(options);
        this._hre = hre;
        this._given = given;
        this._nonInteractive = nonInteractive
    }

    /**
     * Prompts some blueprint arguments with their given values.
     * @param blueprintArgs The arguments to prepare and prompt.
     * @param given_ The given values.
     * @returns {Promise<*>} The result (async function).
     */
    async _apply(blueprintArgs, given_) {
        return await new this._hre.enquirerPlus.Enquirer().prompt(this._hre.blueprints.prepareArgumentPrompts(
            blueprintArgs, this._nonInteractive, given_
        ));
    }

    async render() {
        // This one does not need any implementation on its own.
    }

    async run() {
        throw new Error("This prompt must be implemented in terms of _apply() calls");
    }
}

module.exports = {BaseBlueprintPrompt};