// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.26;

/**
 * @title IVesting
 * @title Interface for interacting with Substrate vesting pallet
 * @dev This is still pretty much work in progress and just a starting point for a 
 * proper interface for the vesting module -> 
 * https://github.com/paritytech/polkadot-sdk/blob/8563437946543e50217e6cfe27348caa08752274/substrate/frame/vesting/README.md
 */
interface IVesting {
    /**
     * @dev Struct to encode the vesting schedule of an individual account
     * @param locked Locked amount at genesis
     * @param perBlock Amount that gets unlocked every block after `starting_block`
     * @param startingBlock Starting block for unlocking(vesting)
     */
    struct VestingInfo {
        uint256 locked;
        uint256 perBlock;
        uint256 startingBlock;
    }

    /**
     * @dev Emitted when a vesting schedule is created
     */
    event VestingCreated(address indexed account, uint32 scheduleIndex);

    /**
     * @dev Emitted when the vested amount is updated
     */
    event VestingUpdated(address indexed account, uint256 unvested);

    /**
     * @dev Emitted when an account becomes fully vested
     */
    event VestingCompleted(address indexed account);

    /**
     * @dev The account given is not vesting
     */
    error NotVesting();

    /**
     * @dev The account already has `MaxVestingSchedules` count of schedules and thus
	 * cannot add another one. Consider merging existing schedules in order to add another
     */
    error AtMaxVestingSchedules();

    /**
     * @dev Amount being transferred is too low to create a vesting schedule
     */
    error AmountLow();

    /**
     * @dev An index was out of bounds of the vesting schedules
     */
    error ScheduleIndexOutOfBounds();

    /**
     * @dev Failed to create a new schedule because some parameter was invalid
     */
    error InvalidScheduleParams();

    /**
     * @dev Unlock any vested funds of the sender account
     * @return success True if the operation was successful
     */
    function vest() external returns (bool success);

    /**
     * @dev Unlock any vested funds of a target account
     * @param target The account to unlock vested funds for
     * @return success True if the operation was successful
     */
    function vestOther(address target) external returns (bool success);

    /**
     * @dev Create a vested transfer
     * @param target The recipient of the vested funds
     * @param schedule The vesting schedule parameters
     * @return success True if the operation was successful
     */
    function vestedTransfer(
        address target, 
        VestingInfo calldata schedule
    ) external returns (bool success);

    /**
     * @dev Force a vested transfer (restricted to Root/Admin)
     * @param source The source account
     * @param target The recipient of the vested funds
     * @param schedule The vesting schedule parameters
     * @return success True if the operation was successful
     */
    function forceVestedTransfer(
        address source,
        address target,
        VestingInfo calldata schedule
    ) external returns (bool success);

    /**
     * @dev Merge two vesting schedules
     * @param schedule1Index Index of the first schedule
     * @param schedule2Index Index of the second schedule
     * @return success True if the operation was successful
     */
    function mergeSchedules(
        uint32 schedule1Index,
        uint32 schedule2Index
    ) external returns (bool success);

    /**
     * @dev Force remove a vesting schedule (restricted to Root/Admin)
     * @param target The account from which to remove the vesting schedule
     * @param scheduleIndex The index of the vesting schedule to remove
     * @return success True if the operation was successful
     */
    function forceRemoveVestingSchedule(
        address target,
        uint32 scheduleIndex
    ) external returns (bool success);

    /**
     * @dev Get the vesting balance of an account
     * @param account The account to check
     * @return balance The amount that is vested and cannot be transferred
     */
    function vestingBalance(address account) external view returns (uint256 balance);

    /**
     * @dev Get all vesting schedules for an account
     * @param account The account to check
     * @return schedules Array of vesting schedules
     */
    function getVestingSchedules(address account) external view returns (VestingInfo[] memory schedules);

    /**
     * @dev Check if an account can add a vesting schedule
     * @param account The account to check
     * @param locked The amount to be locked
     * @param perBlock The amount unlocked per block
     * @param startingBlock The starting block number
     * @return canAdd True if the account can add a vesting schedule
     */
    function canAddVestingSchedule(
        address account,
        uint256 locked,
        uint256 perBlock,
        uint256 startingBlock
    ) external view returns (bool canAdd);

    /**
     * @dev Get the maximum number of vesting schedules an account can have
     * @return max The maximum number of vesting schedules
     */
    function maxVestingSchedules() external view returns (uint32 max);

    /**
     * @dev Get the minimum amount required for a vested transfer
     * @return min The minimum amount
     */
    function minVestedTransfer() external view returns (uint256 min);
}