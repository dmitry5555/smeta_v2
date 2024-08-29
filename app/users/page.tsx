import { getUserIdCook } from "@/actions/Db";
import TopNav from "@/components/TopNav";
import Users from "@/components/Users";
import { redirect } from "next/navigation";

export default async function Home() {
	const user_cook = await getUserIdCook()
	if (!user_cook) { redirect('/login') }
		
	return (
		<main className="flex flex-col items-center justify-between">
			<TopNav	/>
			<Users />
		</main>
	);
}

