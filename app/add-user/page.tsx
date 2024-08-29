
import Orders from "@/components/Orders";
import TopNav from "@/components/TopNav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import jwt, { JwtPayload } from 'jsonwebtoken'
import AddUser from "@/components/AddUser";
import { getUserIdCook } from "@/actions/Db";

export default async function Home() {
	const user_cook = await getUserIdCook()
	if (!user_cook) { redirect('/login') }

	return (
		<main className="flex flex-col items-center justify-between">
			<TopNav />
			{user_cook.id &&
				<AddUser />
			}
		</main>
    );
}

