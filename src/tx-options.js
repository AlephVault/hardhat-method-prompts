/**
 * Processes the tx options by taking the given ones and validating about
 * the given tx option presents, eventually becoming interactive to prompt
 * for the missing / invalid data.
 * @param hre The hardhat runtime environment.
 * @param optionsSpec The options spec.
 * @param givenOptions The actual options.
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @returns {Promise<*[]>} Nothing (async function).
 */
async function processTxOptions(hre, optionsSpec, givenOptions, nonInteractive) {
    // TODO
    return [];
}

module.exports = {
    processTxOptions
}