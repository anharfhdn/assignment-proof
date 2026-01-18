// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ProofOfWork} from "../src/ProofOfWork.sol";

contract DeployProofOfWork is Script {
    function run() external returns (ProofOfWork) {

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        string memory rpcUrl = vm.envString("RPC_URL");
        vm.createSelectFork(rpcUrl);

        vm.startBroadcast(deployerPrivateKey);

        ProofOfWork myContract = new ProofOfWork();

        vm.stopBroadcast();

        console.log("Contract deployed at:", address(myContract));

        return myContract;
    }
}