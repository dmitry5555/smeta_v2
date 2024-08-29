import Orders from "@/components/Orders";
import TopNav from "@/components/TopNav";


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
		<TopNav	/>
		<Orders />
		{/* <TestForm /> */}
    </main>
  );
}