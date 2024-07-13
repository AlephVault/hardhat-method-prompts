async function givenOrValidInput(optionKey, given) {
    // Prompt with a given initial value.
    // TODO.
}

async function validateGivenOrDefault(optionKey, given, default_) {
    // Prompt non-interactively with a given initial value.
    // On error, go by default.
    // TODO.
}

async function processProvidedOrPrompt(optionKey, specType, given) {
    if (specType === "mixed") {
        const {action, "default": default_, value} = given || {};
        if (action === undefined) {
            return await givenOrValidInput(optionKey, given);
        } else {
            switch(action) {
                case "value":
                    return await givenOrValidInput(optionKey, value);
                case "default":
                    return await validateGivenOrDefault(optionKey, given, default_);
                default:
                    throw new Error(
                        `For transaction option ${optionKey} an invalid mixed value action was given: ${action}.` +
                        "The valid options are: default, prompt"
                    );
            }
        }
    } else {
        return await givenOrValidInput(optionKey, given);
    }
}

/**
 * Processes the tx options by taking the given ones and validating about
 * the given tx option presents, eventually becoming interactive to prompt
 * for the missing / invalid data.
 *
 * The options can become in a variety of formats, but they're always the
 * same: `gas`, `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas`, `account`,
 * `value` and `eip155`.
 *
 * From those, `eip155` should not typically be user-given (and, if given,
 * then always as a given flag and never as a prompted input), Also, using
 * prompted options and specifying nonInteractive in the same place will
 * result in errors. Finally, since `account` is given here, `from` will
 * not be supported (since it is redundant).
 *
 * This function leverages the power of hardhat-blueprints' arguments, and
 * they're given as follows:
 *
 * - `gas`, `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas` and `value`
 *   are given in terms of positive big integers (and, in particular, all
 *   those but gas can be expressed in denominations of ETH, like "ether",
 *   "gwei" or others alike).
 * - `account` is given in terms of an account: an index must be provided
 *   or selected, and it must be valid in the range of the instantiated
 *   accounts in the current settings for the chosen network.
 * - `eip155` is a boolean. It should NEVER be prompted but either:
 *   - False by default, provided by command line.
 *   - Explicitly provided (developer-given).
 *
 * Save for `eip155` (which is explicitly provided by a boolean value) and
 * `from` (which will not be supported), all the option specs are supported
 * in these formats:
 *
 * 1. Default value on absence.
 *
 * {
 *     // If the value is not provided by the user, use the specified
 *     // value as default. If a default value is not defined, then the
 *     // option will not be specified in the transaction, which results
 *     // in the adapter choosing the proper default value.
 *     type: "simple",
 *     onAbsent: "default",
 *     default: (someValue)
 * }
 *
 * 2. Prompt value on absence. The prompt type and message is already defined
 *    for each parameter respectively.
 *
 * {
 *     type: "simple",
 *     onAbsent: "prompt"
 * }
 *
 * 3. Default value on absence, but the provided value can be mixed: Either
 *    a value or {action: "value", value} object, a {action: "default"} object
 *    (which will cause the value to not be specified). If {value} is undefined
 *    or invalid, it will cause a prompt (since it's needed). If the specified
 *    value is not provided by the user, the value specified by default will
 *    be used. If the by-default value is not defined, then the option will
 *    not be specified in the transaction, which results in the adapter choosing
 *    the proper default value.
 *
 * {
 *     type: "mixed",
 *     onAbsent: "default",
 *     default: (someValue)
 * }
 *
 * 4. Prompt value on absence, but the provided value can be mixed: Either
 *    a value or {action: "value", value} object, a {action: "default"} object
 *    (which will cause the value to not be specified). If {value} is undefined
 *    or invalid, it will cause a prompt.
 *
 * {
 *     type: "mixed",
 *     onAbsent: "prompt"
 * }
 *
 * In the end, each of these specs will be given for all the options (save
 * for `eip155`, which always accepts a boolean, and `from`, which is not
 * supported) and then the `givenTxOptions` will be processed.
 *
 * @param hre The hardhat runtime environment.
 * @param txOptionsSpec The transactions options spec.
 * @param givenTxOptions The transactions actual options.
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @returns {Promise<*>} The processed options as an object (async function).
 */
async function processTxOptions(hre, txOptionsSpec, givenTxOptions, nonInteractive) {
    givenTxOptions ||= {};
    const result = {};
    if (givenTxOptions.eip155) result.eip155 = true;
    for (let optionKey in ["account", "value", "gas", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas"]) {
        const {type, onAbsent, "default": default_} = txOptionsSpec[optionKey] || {};
        const provided = givenTxOptions[optionKey];
        if (provided) {
            result[optionKey] = await processProvidedOrPrompt(
                optionKey, type, provided
            );
        } else if (onAbsent === "default") {
            if (default_ !== null && default_ !== undefined) {
                result[optionKey] = default_;
            }
            // Otherwise: the option will not be specified.
        } else if (onAbsent === "prompt") {
            result[optionKey] = await processProvidedOrPrompt(
                optionKey, type,
            );
        } else {
            throw new Error(
                `For transaction option ${optionKey} an invalid onAbsent setting was given: ${onAbsent}.` +
                "The valid options are: default, prompt"
            );
        }
    }
    return result;
}

module.exports = {
    processTxOptions
}