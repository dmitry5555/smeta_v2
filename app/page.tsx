import { getUserIdCook } from "@/actions/Db";
import Orders from "@/components/Orders"
import TopNav from "@/components/TopNav"
import { redirect } from "next/navigation";

export default async function Home() {
	const user_cook = await getUserIdCook()
	if (!user_cook) { redirect('/login') }
	// console.log('user_cook: ', user_cook)
	// returns: user_cook:  { id: 1, iat: 1724147167, exp: 1725443167 }
    return (
		<main className="flex flex-col items-center justify-between">
			<TopNav />
			{user_cook.id && <Orders user_id={user_cook.id} />}
		</main>
    );
}

