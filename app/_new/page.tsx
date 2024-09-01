import { dbCloneDoc, dbDeleteDoc, dbGetProject, getUserIdCook } from "@/actions/Db";
import { redirect } from "next/navigation";

export default async function Home() {

	const user_cook = await getUserIdCook()
	if (!user_cook) { redirect('/login') }

	const cloneDoc = async () => {
		const data = await dbCloneDoc()
		// console.log(data)
		// setPositions(data?.fields)
		// setProjectInfo(data)
	}
	cloneDoc()

	return (
		<main className="flex flex-col items-center justify-between">
			{/* <Order /> */}
		</main>
	)

}