// import { config } from "./config";
// import { useAccounts, useLazyLoadQuery } from "@reactive-dot/react";

// export function MyComponent() {
//   const accounts = useAccounts();
//   const [timestamp, totalIssuance] = useLazyLoadQuery((builder) =>
//     builder.storage("Timestamp", "Now").storage("Balances", "TotalIssuance")
//   );

//   return (
//     <div>
//       <ul>
//         {accounts.map((account, index) => (
//           <li key={index}>
//             <div>Address: {account.address}</div>
//             {account.name && <div>Name: {account.name}</div>}
//           </li>
//         ))}
//       </ul>
//       <section>
//         <div>
//           Latest block timestamp: {new Date(Number(timestamp)).toLocaleString()}
//         </div>
//         <div>Total issuance: {totalIssuance.toString()}</div>
//       </section>
//     </div>
//   );
// }
