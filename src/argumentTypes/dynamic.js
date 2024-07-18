/**
 * Registers the string and bytes dynamic types.
 * @param hre The hardhat runtime environment.
 */
function registerDynamicTypes(hre) {
    // The component to use for bytes is already defined in
    // the ./scalar.js file.
    hre.blueprints.registerBlueprintArgumentType("string", {
        type: "input"
    }, `An arbitrary text`);
    hre.blueprints.registerBlueprintArgumentType("bytes", {
        type: "plus:hardhat:given-or-valid-bytes-input"
    }, `An arbitrary bytes array`);
}

module.exports = {registerDynamicTypes};