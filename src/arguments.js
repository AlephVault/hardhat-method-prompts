/**
 * Processes the arguments by taking the given ones and validating about
 * the given argument presents, eventually becoming interactive to prompt
 * for the missing / invalid data.
 * @param hre The hardhat runtime environment.
 * @param argumentsSpec The arguments spec.
 * @param givenArguments The actual arguments.
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @returns {Promise<*[]>} The processed arguments as an array (async function).
 */
async function processArguments(hre, argumentsSpec, givenArguments, nonInteractive) {
    // TODO
    return [];
}

module.exports = {
    processArguments
}