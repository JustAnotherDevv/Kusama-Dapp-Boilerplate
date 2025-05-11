// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.26;

import "./../interfaces/iVesting.sol";

contract VestingManager {
    IVesting public immutable vestingPrecompile;
    address public token;
    address public owner;
    mapping(address => bool) public managers;
    
    event ManagerAdded(address manager);
    event ManagerRemoved(address manager);
    event VestingScheduleCreated(address beneficiary, uint256 amount, uint256 duration);
    event BatchVestingCreated(uint256 beneficiaries);
    
    error OnlyOwner();
    error OnlyManager();
    error VestingFailed();
    error InvalidBeneficiary();
    error InvalidAmount();
    error ArrayLengthMismatch();

    constructor(address _vestingPrecompile, address _token) {
        vestingPrecompile = IVesting(_vestingPrecompile);
        token = _token;
        owner = msg.sender;
        managers[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyManager() {
        if (!managers[msg.sender]) revert OnlyManager();
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
    
    function addManager(address manager) external onlyOwner {
        managers[manager] = true;
        emit ManagerAdded(manager);
    }
    
    function removeManager(address manager) external onlyOwner {
        delete managers[manager];
        emit ManagerRemoved(manager);
    }
    
    function createVestingSchedule(
        address beneficiary, 
        uint256 totalAmount, 
        uint256 durationInBlocks, 
        uint256 startBlock
    ) external onlyManager {
        if (beneficiary == address(0)) revert InvalidBeneficiary();
        if (totalAmount == 0) revert InvalidAmount();
        
        uint256 perBlock = totalAmount / durationInBlocks;
        if (perBlock == 0) perBlock = 1;
        
        IVesting.VestingInfo memory schedule = IVesting.VestingInfo({
            locked: totalAmount,
            perBlock: perBlock,
            startingBlock: startBlock
        });
        
        bool canAdd = vestingPrecompile.canAddVestingSchedule(
            beneficiary,
            totalAmount,
            perBlock,
            startBlock
        );
        
        if (!canAdd) revert VestingFailed();
        
        bool success = vestingPrecompile.vestedTransfer(beneficiary, schedule);
        if (!success) revert VestingFailed();
        
        emit VestingScheduleCreated(beneficiary, totalAmount, durationInBlocks);
    }
    
    function batchCreateVestingSchedules(
        address[] calldata beneficiaries,
        uint256[] calldata amounts,
        uint256 durationInBlocks,
        uint256 startBlock
    ) external onlyManager {
        if (beneficiaries.length != amounts.length) revert ArrayLengthMismatch();
        
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            // No incorrect addresses
            if (beneficiaries[i] == address(0)) continue; 
            
            uint256 perBlock = amounts[i] / durationInBlocks;
            if (perBlock == 0) perBlock = 1;
            
            IVesting.VestingInfo memory schedule = IVesting.VestingInfo({
                locked: amounts[i],
                perBlock: perBlock,
                startingBlock: startBlock
            });
            
            vestingPrecompile.vestedTransfer(beneficiaries[i], schedule);
        }
        
        emit BatchVestingCreated(beneficiaries.length);
    }
    
    function vestForBeneficiary(address beneficiary) external {
        bool success = vestingPrecompile.vestOther(beneficiary);
        if (!success) revert VestingFailed();
    }
    
    function batchVest(address[] calldata beneficiaries) external {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            vestingPrecompile.vestOther(beneficiaries[i]);
        }
    }
    
    function getVestingInfo(address beneficiary) external view returns (
        IVesting.VestingInfo[] memory schedules,
        uint256 unvestedAmount
    ) {
        schedules = vestingPrecompile.getVestingSchedules(beneficiary);
        unvestedAmount = vestingPrecompile.vestingBalance(beneficiary);
    }
}