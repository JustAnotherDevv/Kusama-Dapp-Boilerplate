import { useAccount } from "wagmi";
import { NavBar } from "./nav-bar";

export function Home() {
  const { address } = useAccount();

  return (
    <div>
      <NavBar />
      <div>{address ? address : null}</div>
      <div className="bg-red-600">TEST</div>
    </div>
  );
}

export default Home;
