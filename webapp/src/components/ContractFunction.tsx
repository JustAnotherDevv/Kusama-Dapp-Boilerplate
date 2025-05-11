import { useState, useEffect } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

export function ContractFunction({ contractAddress, functionData, isView }) {
  const [expanded, setExpanded] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [txHash, setTxHash] = useState(null);

  const knownStateChangingFunctions = [];

  const isTrueViewFunction =
    (functionData.stateMutability === "view" ||
      functionData.stateMutability === "pure") &&
    !knownStateChangingFunctions.includes(functionData.name);

  const actualIsView = isView && isTrueViewFunction;

  const {
    data: writeData,
    isPending: isWritePending,
    writeContract,
    error: writeError,
  } = useWriteContract();

  const {
    data: txReceipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: Boolean(txHash),
  });

  const {
    data: readData,
    isLoading: isReadLoading,
    isSuccess: readSuccess,
    isError: isReadError,
    error: readError,
    refetch,
  } = actualIsView
    ? useReadContract({
        address: contractAddress,
        abi: [
          functionData,
          {
            inputs: [
              {
                internalType: "address",
                name: "account",
                type: "address",
              },
              {
                internalType: "bytes32",
                name: "neededRole",
                type: "bytes32",
              },
            ],
            name: "AccessControlUnauthorizedAccount",
            type: "error",
          },
        ],
        functionName: functionData.name,
        args: functionData.inputs.map((input) => getFormattedInput(input)),
        enabled: expanded && isInputsComplete(),
      })
    : {
        data: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: null,
        refetch: async () =>
          console.warn(
            `Cannot read state-changing function: ${functionData.name}`
          ),
      };

  useEffect(() => {
    if (isView && !isTrueViewFunction) {
      console.warn(
        `Function ${functionData.name} was passed as view but is being forced to write mode.`
      );
    }

    if (!isView && isTrueViewFunction) {
      console.warn(
        `Function ${functionData.name} was passed as non-view but is marked as ${functionData.stateMutability} in ABI.`
      );
    }
  }, [
    isView,
    functionData.name,
    functionData.stateMutability,
    isTrueViewFunction,
  ]);

  function isInputsComplete() {
    return functionData.inputs.every(
      (input) =>
        inputValues[input.name] !== undefined && inputValues[input.name] !== ""
    );
  }

  function getFormattedInput(input) {
    const value = inputValues[input.name];

    if (value === undefined || value === "") return undefined;

    if (input.type.includes("int")) {
      if (
        input.type === "uint256" &&
        input.name.toLowerCase().includes("ether")
      ) {
        return parseEther(value);
      }
      return BigInt(value);
    }
    if (input.type === "bool") {
      return value === "true";
    }
    return value;
  }

  const handleInputChange = (inputName, value) => {
    setInputValues((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const executeFunction = async () => {
    if (!actualIsView) {
      try {
        const functionArgs = functionData.inputs.map((input) =>
          getFormattedInput(input)
        );

        // for debugging errors from smart contracts
        const completeAbi = [
          functionData,
          {
            inputs: [
              {
                internalType: "address",
                name: "account",
                type: "address",
              },
              {
                internalType: "bytes32",
                name: "neededRole",
                type: "bytes32",
              },
            ],
            name: "AccessControlUnauthorizedAccount",
            type: "error",
          },
          {
            inputs: [],
            name: "AccessControlBadConfirmation",
            type: "error",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "spender",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "allowance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "needed",
                type: "uint256",
              },
            ],
            name: "ERC20InsufficientAllowance",
            type: "error",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "sender",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "balance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "needed",
                type: "uint256",
              },
            ],
            name: "ERC20InsufficientBalance",
            type: "error",
          },
        ];

        writeContract({
          address: contractAddress,
          abi: completeAbi,
          functionName: functionData.name,
          args: functionArgs,
        });
      } catch (err) {
        console.error("Contract execution error:", err);
      }
    } else {
      await refetch();
    }
  };

  if (writeData && !txHash) {
    setTxHash(writeData);
  }

  const renderInputFields = () => {
    return functionData.inputs.map((input, idx) => (
      <div key={idx} className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {input.name} ({input.type})
        </label>
        <input
          type={input.type.includes("int") ? "number" : "text"}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder={`Enter ${input.type}`}
          value={inputValues[input.name] || ""}
          onChange={(e) => handleInputChange(input.name, e.target.value)}
        />
      </div>
    ));
  };

  const renderOutputValue = (output, data) => {
    if (data === undefined) return "No data";

    if (typeof data === "bigint") {
      return data.toString();
    }

    if (typeof data === "boolean") {
      return data ? "true" : "false";
    }

    if (Array.isArray(data)) {
      return JSON.stringify(data);
    }

    if (typeof data === "object" && data !== null) {
      return JSON.stringify(data);
    }

    return String(data);
  };

  const renderOutputFields = () => {
    if (!actualIsView || !readSuccess || !readData) return null;

    if (functionData.outputs.length === 1 && !Array.isArray(readData)) {
      const output = functionData.outputs[0];
      return (
        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {output.name || output.type}
          </div>
          <div className="font-mono text-sm break-all">
            {renderOutputValue(output, readData)}
          </div>
        </div>
      );
    }

    return functionData.outputs.map((output, idx) => (
      <div
        key={idx}
        className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md"
      >
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {output.name || `Output ${idx} (${output.type})`}
        </div>
        <div className="font-mono text-sm break-all">
          {renderOutputValue(
            output,
            Array.isArray(readData) ? readData[idx] : readData
          )}
        </div>
      </div>
    ));
  };

  const renderTransactionStatus = () => {
    if (!txHash) return null;

    return (
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Transaction Status
        </div>
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          {isConfirming && (
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <div className="animate-pulse mr-2">⏳</div>
              <span>Confirming transaction...</span>
            </div>
          )}
          {isConfirmed && (
            <div className="text-green-600 dark:text-green-400">
              ✅ Transaction confirmed!
            </div>
          )}
          {confirmError && (
            <div className="text-red-600 dark:text-red-400">
              ❌ Transaction failed: {confirmError.message}
            </div>
          )}
          <div className="mt-2 font-mono text-xs break-all">
            Transaction Hash: {txHash}
          </div>
          {txReceipt && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Gas Used: {txReceipt.gasUsed.toString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Block Number: {txReceipt.blockNumber}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getErrorName = (errorSignature) => {
    const errorMap = {
      "0xe2517d3f": "AccessControlUnauthorizedAccount",
      "0x4ca88867": "AccessControlBadConfirmation",
      "0x7dc96260": "ERC20InsufficientBalance",
      "0x08c379a0": "Error",
      "0x01336cea": "ERC20InsufficientAllowance",
    };

    if (!errorSignature) return "Unknown Error";

    for (const [signature, name] of Object.entries(errorMap)) {
      if (errorSignature.includes(signature)) {
        return name;
      }
    }

    return "Unknown Error";
  };

  const formatSignature = () => {
    const inputs = functionData.inputs
      .map((i) => `${i.type} ${i.name}`)
      .join(", ");
    const outputs =
      functionData.outputs && functionData.outputs.length > 0
        ? ` → (${functionData.outputs.map((o) => o.type).join(", ")})`
        : "";
    return `${functionData.name}(${inputs})${outputs}`;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-2">
      <div
        className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        <div className="font-mono text-sm text-gray-800 dark:text-gray-200 flex items-center">
          {formatSignature()}
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded ${
              knownStateChangingFunctions.includes(functionData.name)
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : functionData.stateMutability === "view" ||
                  functionData.stateMutability === "pure"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : functionData.stateMutability === "payable"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {knownStateChangingFunctions.includes(functionData.name)
              ? "state-changing"
              : functionData.stateMutability}
          </span>
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded ${
              actualIsView
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {actualIsView ? "read" : "write"}
          </span>
        </div>
        <div className="text-gray-500">{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div
          className="p-3 border-t border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {functionData.inputs.length > 0 && renderInputFields()}

          <button
            className={`mt-3 px-4 py-2 rounded-md text-white ${
              isInputsComplete()
                ? actualIsView
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={
              !isInputsComplete() ||
              isWritePending ||
              isConfirming ||
              isReadLoading
            }
            onClick={executeFunction}
          >
            {actualIsView ? "Read" : "Execute"}
            {(isWritePending || isReadLoading) && "..."}
          </button>

          {isReadError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
              <div className="font-medium text-red-600 dark:text-red-400">
                Read Error
              </div>
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                {readError?.message}
              </div>
              {readError?.message?.includes("0xe2517d3f") && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  <strong>Access Control Error:</strong> You don't have
                  permission to read this function.
                </div>
              )}
            </div>
          )}

          {writeError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
              <div className="font-medium text-red-600 dark:text-red-400">
                Transaction Failed: {getErrorName(writeError?.message || "")}
              </div>
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                {writeError?.message}
              </div>
              {writeError?.message?.includes("0xe2517d3f") && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  <strong>Access Control Error:</strong> You don't have the
                  required permissions to call this function. For the{" "}
                  <code>mint</code> function, you need the MINTER_ROLE.
                </div>
              )}
              {writeError?.message?.includes("reverted") &&
                !writeError?.message?.includes("0xe2517d3f") && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    <strong>Transaction Reverted:</strong> The contract rejected
                    this transaction, possibly due to:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Missing permissions or role</li>
                      <li>Invalid function parameters</li>
                      <li>Contract condition check failed</li>
                      <li>Insufficient funds or allowance</li>
                    </ul>
                  </div>
                )}
            </div>
          )}

          {renderOutputFields()}
          {renderTransactionStatus()}
        </div>
      )}
    </div>
  );
}
