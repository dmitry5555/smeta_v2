'use client'

import Image from 'next/image'
import Link from 'next/link'
import { dbLogout } from '@/actions/Db'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
import { useState } from 'react'

const TopNav = () => { 

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
							{/* <Link onClick={handleAddOrderClick} className="text-md text-gray-800 hover:text-blue-600" href="/">Создать заказ</Link> */}
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

			</div>
		</>
	)

}

export default TopNav