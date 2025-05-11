import { useState } from "react";
import { useAccount } from "wagmi";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clipboard,
  Check,
  AlertTriangle,
} from "lucide-react";
import { ContractFunction } from "./ContractFunction";

import contractsData from "./../contracts-data.json";

export function Contracts() {
  const { address } = useAccount();
  const [expandedContract, setExpandedContract] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  const handleContractClick = (contractIndex) => {
    if (expandedContract === contractIndex) {
      setExpandedContract(null);
    } else {
      setExpandedContract(contractIndex);
    }
  };

  const groupFunctionsByType = (abi) => {
    if (!abi || !Array.isArray(abi)) return { view: [], nonView: [] };

    const view = [];
    const nonView = [];

    // should be empty for now to work with different contracts
    const knownStateChangingFunctions = [];

    abi.forEach((item) => {
      if (item.type === "function") {
        if (knownStateChangingFunctions.includes(item.name)) {
          nonView.push(item);
        } else if (
          item.stateMutability === "view" ||
          item.stateMutability === "pure"
        ) {
          view.push(item);
        } else {
          nonView.push(item);
        }
      }
    });

    console.log(
      "View functions:",
      view.map((f) => f.name)
    );
    console.log(
      "Non-view functions:",
      nonView.map((f) => f.name)
    );

    return { view, nonView };
  };

  // hardcoded to westend asset hub for now
  const getBlockExplorerUrl = (address) => {
    return `https://assethub-westend.subscan.io/account/${address}`;
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedAddress(index);
        setTimeout(() => setCopiedAddress(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {address && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connected Account
            </h2>
            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {address}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Deployed Contracts
            </h2>
          </div>

          {contractsData && contractsData.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {contractsData.map((contract, index) => (
                <li
                  key={index}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleContractClick(index)}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center">
                      <div className="flex items-center space-x-2">
                        {expandedContract === index ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {contract.name}
                        </span>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center">
                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400 truncate">
                          {contract.address.slice(0, 6)}...
                          {contract.address.slice(-4)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(contract.address, index);
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Copy address to clipboard"
                        >
                          {copiedAddress === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clipboard className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={getBlockExplorerUrl(contract.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View on block explorer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    {expandedContract === index && (
                      <div
                        className="mt-4 pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!contract.abi || contract.abi.length === 0 ? (
                          <div className="py-4 text-gray-500 dark:text-gray-400">
                            No ABI available for this contract.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {!address && (
                              <div className="py-4 flex items-center text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                <span>
                                  Connect your wallet to interact with contract
                                  functions
                                </span>
                              </div>
                            )}

                            {address &&
                              groupFunctionsByType(contract.abi).view.length >
                                0 && (
                                <div className="mb-6">
                                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    View Functions
                                  </h3>
                                  <div className="space-y-2">
                                    {groupFunctionsByType(
                                      contract.abi
                                    ).view.map((func, funcIndex) => (
                                      <ContractFunction
                                        key={funcIndex}
                                        contractAddress={contract.address}
                                        functionData={func}
                                        isView={true}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                            {address &&
                              groupFunctionsByType(contract.abi).nonView
                                .length > 0 && (
                                <div className="mb-6">
                                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    State-Changing Functions
                                  </h3>
                                  <div className="space-y-2">
                                    {groupFunctionsByType(
                                      contract.abi
                                    ).nonView.map((func, funcIndex) => (
                                      <ContractFunction
                                        key={funcIndex}
                                        contractAddress={contract.address}
                                        functionData={func}
                                        isView={false}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Display events if available */}
                            {contract.abi.some(
                              (item) => item.type === "event"
                            ) && (
                              <div>
                                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Events
                                </h3>
                                <ul className="space-y-1">
                                  {contract.abi
                                    .filter((item) => item.type === "event")
                                    .map((event, eventIndex) => (
                                      <li
                                        key={eventIndex}
                                        className="font-mono text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-700 rounded"
                                      >
                                        {`event ${event.name}(${event.inputs
                                          .map(
                                            (input) =>
                                              `${
                                                input.indexed ? "indexed " : ""
                                              }${input.type} ${input.name}`
                                          )
                                          .join(", ")})`}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4">
                          <a
                            href={getBlockExplorerUrl(contract.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <span>View full contract on Block Explorer</span>
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No deployed contracts found. Run the prepare-contracts.js script
              to generate the contracts data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contracts;
