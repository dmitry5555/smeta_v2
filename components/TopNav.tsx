'use client'

import Image from 'next/image'
import Link from 'next/link'
import { dbCloneDoc, dbDeleteDoc, dbLogout } from '@/actions/Db'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
import { useState } from 'react'

const TopNav = () => { 
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	
	const handleAddOrderClick = (e: any) => {
		e.preventDefault()
		setShowConfirmModal(true)
	  }

	const handleConfirm = async() => {
		setShowConfirmModal(false)
		await dbCloneDoc();
		// копия
		// await dbDeleteDoc();    
		// удаление
		window.location.href = `/`;
	}

	const handleCancel = () => {
		setShowConfirmModal(false)
	}


	const logout = async() => {
		const user_cook = await dbLogout()
		window.location.href = `/login`;
	}

	return (
		<>
			<div className='sticky top-0 z-100 w-full flex flex-col'>
				<div className='bg-gray-50 flex w-full px-6'>
					<div className='flex flex-row max-w-screen-2xl mx-auto w-full border-gray-200 pt-4 pb-3 '>
						<div className="flex my-auto gap-6">
							<Link className="text-md text-gray-800 hover:text-blue-600" href="/">Все заказы</Link>
							<Link onClick={handleAddOrderClick} className="text-md text-gray-800 hover:text-blue-600" href="/">Создать заказ</Link>
							{/* <Link className="text-md text-gray-800  hover:text-blue-600" href="/">Шаблоны</Link> */}
							<Link className="text-md text-gray-800  hover:text-blue-600" href="/users">Пользователи</Link>
							<Link className="text-md text-gray-800  hover:text-blue-600" href="/add-user" >Добавить пользователя</Link>
							<Link onClick={() => logout()} className="text-md text-gray-800  hover:text-blue-600" href="/add-user" >Выйти</Link>
						</div>
						<div className="flex my-auto ml-auto">
							<Link href=''>
								<Image src="/logo.png" alt="Logo" width={90} height={100} />
							</Link>
						</div>
					</div>
				</div>
				
				{/* Confirm modal */}
				{showConfirmModal && (
				<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75">
					<div className="bg-white p-6 rounded-md shadow-lg w-80 text-center">
					{/* <h2 className="text-lg font-bold mb-4">Подтверждение</h2> */}
					<p className="mb-4 ">Создать новый заказ?</p>
					<div className="flex justify-center gap-2">
						<button
							className="text-white px-4 py-2 text-sm border border-transparent  bg-blue-600 rounded-lg disabled:opacity-40"
							onClick={handleConfirm}
						>
						Да
						</button>
						<button
							className="text-gray-500 px-4 py-2 text-sm border rounded-lg disabled:opacity-40"
							onClick={handleCancel}
						>
						Нет
						</button>
					</div>
					</div>
				</div>
				)}

			</div>
		</>
	)

}

export default TopNav