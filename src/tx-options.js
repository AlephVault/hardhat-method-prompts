/**
 * Processes the tx options by taking the given ones and validating about
 * the given tx option presents, eventually becoming interactive to prompt
 * for the missing / invalid data.
 * @param hre The hardhat runtime environment.
 * @param txOptionsSpec The transactions options spec.
 * @param givenTxOptions The transactions actual options.
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @returns {Promise<*>} The processed options as an object (async function).
 */
async function processTxOptions(hre, txOptionsSpec, givenTxOptions, nonInteractive) {
    // TODO
    return {};
}

module.exports = {
    processTxOptions
}