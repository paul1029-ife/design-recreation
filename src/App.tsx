import InviteCard from "./components/InviteCard";
import Navbar from "./components/Navbar";
function App() {
  return (
    <div className="items-center w-full justify-center">
      <Navbar />
      <div className="flex flex-col gap-20 min-h-screen items-center justify-center w-full">
        <InviteCard />
      </div>
    </div>
  );
}

export default App;
