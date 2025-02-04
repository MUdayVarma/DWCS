// SPDX-License-Identifier: MIT
// Solidity Smart Contract
pragma solidity ^0.8.0;

contract StoreWaterFlowData_0107 {
    struct SensorData {
        string deviceId;
        uint256 value;
        uint256 timestamp;
        string signature;
    }

    mapping(uint256 => SensorData) public data;
    uint256 public dataCount;

    function storeData (
        string memory deviceId,
        uint256 value,
        uint256 timestamp,
        string memory signature
    ) public {
        data[dataCount] = SensorData(deviceId, value, timestamp, signature);
        dataCount++;
    } 

}