import TopNavBar from "./components/TopNavBar";
import Tip from "./components/Tip";
import CreatorsDisplay from "./components/CreatorsDisplay";
import ClaimPage from "./claim/page";


export default function Home() {
  return (
    <div className="">
      <div className="flex justify-between mx-32 items-center">
      <Tip/>
      <CreatorsDisplay/>
      </div>
    </div>
  );
}
