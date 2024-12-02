import Tip from "./components/Tip";
import CreatorsDisplay from "./components/CreatorsDisplay";


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
