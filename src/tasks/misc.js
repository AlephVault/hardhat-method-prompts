const {extendEnvironment} = require("hardhat/config");

extendEnvironment((hre) => {
    new hre.methodPrompts.CustomPrompt(
        function([value]) {
            return hre.common.keccak256(value);
        }, {
            onError: (e) => {
                console.error("There was an error while computing the keccak256 hash");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Result:", tx);
            }
        }, [{
            name: "text",
            description: "The text to hash",
            message: "What's the text to hash?",
            argumentType: "string"
        }], {}
    ).asTask("keccak256", "Computes a keccak256 hash over a text", {onlyExplicitTxOptions: true});
});