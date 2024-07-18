/**
 * Registers the int8 ... int256, uint8 ... uint256 and bytes1 ... bytes32
 * scalar types (other types like address, smart-address and boolean are
 * already set).
 * @param hre The hardhat runtime environment.
 */
function registerScalarTypes(hre) {
    const GivenOrValidInput = hre.enquirerPlus.Enquirer.GivenOrValidInput;

    /**
     * An input validating and returning a BigInt ranged value.
     */
    class GivenOrValidEVMIntInput extends GivenOrValidInput {
        constructor({min, max, ...options}) {
            super({
                ...options, validate: (v) => {
                    if (/^((-?\d+)|(0x[a-fA-F0-9]+))$/.test(v)) {
                        let value = BigInt(v);
                        return value <= max && value >= min;
                    } else {
                        return false;
                    }
                },
                makeInvalidInputMessage: (v) => `Invalid number: ${v}`,
                onInvalidGiven: (v) => console.error(`Invalid given number: ${v}`)
            });
        }

        async result(v) {
            return BigInt(v);
        }
    }

    /**
     * An input validating and returning a bytes array.
     */
    class GivenOrValidEVMBytesInput extends GivenOrValidInput {
        constructor({length, ...options}) {
            let rx = /^0x([a-fA-F0-9]{2})+$/;
            if (length !== undefined) {
                if (typeof length !== "number" || length < 0) {
                    throw new Error("Invalid bytes array length");
                } else {
                    rx = new RegExp("^0x[a-fA-F0-9]{" + (2 * length) + "}$");
                }
            }
            super({
                ...options, validate: rx,
                makeInvalidInputMessage: (v) => `Invalid bytes array: ${v}`,
                onInvalidGiven: (v) => console.error(`Invalid bytes array: ${v}`)
            });
        }
    }

    hre.enquirerPlus.utils.registerPromptClass("plus:hardhat:given-or-valid-int-input", () => GivenOrValidEVMIntInput);
    hre.enquirerPlus.utils.registerPromptClass("plus:hardhat:given-or-valid-bytes-input", () => GivenOrValidEVMBytesInput);

    for(let index = 1; index <= 32; index++) {
        const bits = 8 * index;
        const uintName = `uint${bits}`;
        const intName = `int${bits}`;
        const bytesName = `bytes${index}`;
        const maxUInt = (1n << BigInt(bits)) - 1;
        const maxInt = (1n << BigInt(bits - 1)) - 1;
        const minInt = -(1n << BigInt(bits - 1));

        hre.blueprints.registerBlueprintArgumentType(uintName, {
            type: "plus:hardhat:given-or-valid-int-input",
            min: 0n, max: maxUInt
        }, `An unsigned integer of ${bits} bits`);

        hre.blueprints.registerBlueprintArgumentType(intName, {
            type: "plus:hardhat:given-or-valid-int-input",
            min: minInt, max: maxInt
        }, `A signed integer of ${bits} bits`);

        hre.blueprints.registerBlueprintArgumentType(bytesName, {
            type: "plus:hardhat:given-or-valid-bytes-input", length: index
        }, `A packed bytes array of length ${index}`)
    }
}