/**
 * Processes the arguments by taking the given ones and validating about
 * the given argument presents, eventually becoming interactive to prompt
 * for the missing / invalid data.
 * @param hre The hardhat runtime environment.
 * @param arguments The arguments spec.
 * @param givenArguments The actual arguments.
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @returns {Promise<*[]>} The processed arguments as an array (async function).
 */
async function processArguments(hre, arguments, givenArguments, nonInteractive) {
    const prompts = hre.blueprints.prepareArgumentPrompts(arguments, nonInteractive, givenArguments);
    const results = await new hre.enquirerPlus.Enquirer().prompt(prompts);
    return arguments.map(({name}) => {
        return results[name];
    });
}

module.exports = {
    processArguments
}