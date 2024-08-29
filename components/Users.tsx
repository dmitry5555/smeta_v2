'use client'

import { dbGetUsers } from "@/actions/Db";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import ModalEditUser from "./ModalEditUser";


const Users = () => { 
	const [users, setUsers] = useState<any | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<any | null>(null);
	
	useEffect(() => {
		const fetchUsers = async () => {
		  	const data = await dbGetUsers()
		    setUsers(data)
		}
		fetchUsers()
	}, []);

	const handleEditClick = (user: any) => {
		setSelectedUser(user)
		isEditModalOpen ? setIsEditModalOpen(false) : setIsEditModalOpen(true)
	}

	return (
		<>
			{isEditModalOpen && selectedUser && <ModalEditUser user={selectedUser} onClose={() => setIsEditModalOpen(false)} />}
			<div className='flex flex-col max-w-screen-xl mx-auto w-full my-6'>
				{users && 
					users.map((user: any) => (
						<div className='flex flex-row max-w-screen-xl px-5 py-4 border-t-0 text-sm border-gray-200 border-b' key={user.id}>
							<div className='w-6/12  flex flex-col'>
									<p className='flex text-xl '>{user.name}</p>
								<div className='text-gray-500'>
								</div>
							</div>
							<div className='w-1/12 flex gap-4 ml-auto'>
								<div className='flex gap-4 ml-auto'>
									<Link className='ml-auto' href='' onClick={() => handleEditClick(user)}> <Cog6ToothIcon className='w-6' /> </Link>
								</div>
							</div>
						</div>
					))
				}
			</div>

		</>
	)

}

export default Users