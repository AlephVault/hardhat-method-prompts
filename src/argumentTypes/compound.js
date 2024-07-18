const {ArrayPluginPrompt: ArrayPluginPrompt_} = require("./arrays");
const {TuplePluginPrompt: TuplePluginPrompt_} = require("./tuples");

/**
 * Registers the array and tuple enquirer-plus types, which depend
 * on `hre.blueprints` to query sub-arguments.
 * @param hre The hardhat runtime environment.
 */
function registerCompoundTypes(hre) {
    class ArrayPluginPrompt extends ArrayPluginPrompt_ {
        constructor(options) {
            super({hre, ...options});
        }
    }

    class TuplePluginPrompt extends TuplePluginPrompt_ {
        constructor(options) {
            super({hre, ...options});
        }
    }

    // Enquirer-plus' array and tuple fields.
    hre.enquirerPlus.utils.registerPromptClass("plus:hardhat:array", () => ArrayPluginPrompt);
    hre.enquirerPlus.utils.registerPromptClass("plus:hardhat:tuple", () => TuplePluginPrompt);
}

module.exports = {registerCompoundTypes};