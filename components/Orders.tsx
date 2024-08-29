'use client'

import { dbGetProjects } from '@/actions/Db'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Orders = ( {user_id}: any ) => { 
	const [projects, setProjects] = useState<any | null>(null)

	useEffect(() => {
		const fetchProjects = async () => {
			// gets ALL projects from ALL users
		  	const data = await dbGetProjects(user_id)
			console.log('user_id:', user_id)
			// console.log(data[])
		    setProjects(data)
		};
		fetchProjects()
	}, [user_id]);

	return (
		<>
			<div className='flex bg-white flex-row w-full py-6 px-5 mx-auto uppercase text-xs bg-gray-0 text-gray-600 max-w-screen-xl'>
				<div className='w-6/12 my-auto'>Название</div>
				<div className='w-2/12 pl-2 my-auto'>Номер договора</div>
				<div className='w-2/12 pl-3 my-auto'>Изменен</div>
				<div className='w-2/12 pl-1 flex justify-end'>PDF</div>
				{/* <div className='w-1/12 my-auto'>Цена</div>
				<div className='w-2/12 my-auto'>Сумма</div> */}
				{/* <div className='w-1/12 my-auto'>Чек</div> */}
				{/* <div className='w-1/12 my-auto opacity-20'>Коэф.</div> */}
			</div>
			<div className='flex flex-col max-w-screen-xl mx-auto w-full mb-6'>
				{projects && 
					[...projects].reverse().map((project: any) => (
						<div className='flex flex-row max-w-screen-xl px-5 py-4 border-t-0 text-sm border-gray-200 border-b' key={project.id}>
							<div className='w-6/12  flex flex-col'>
								<Link href={`/project/${project.id}`} className='flex text-xl hover:text-blue-600 '><p>{project.name}</p>
									<svg className="ml-2 my-auto flex-shrink-0 size-4 transition ease-in-out group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
								</Link>
								<div className='text-gray-500'>
								{/* Проект Глаголево из клеёного бруса в Ухте район УРМЗ ,площадь дома 135 м2 */}
								</div>
							</div>
							
							<div className='w-2/12 my-auto mx-1 text-gray-600 leading-6'>
							&nbsp;
								{project.dog_num}
							</div>

							<div className='w-2/12 my-auto mx-1 text-gray-600 leading-6'>
							
							{ project.updatedAt.toLocaleString('ru-RU', {
								hour: '2-digit',
								minute: '2-digit',
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
								})
							} ({project.user.name})
							</div>
							<div className='w-1/12 flex gap-4 ml-auto'>
								<div className='flex gap-4 ml-auto'>
									<Link className='ml-auto' href=''> <DocumentArrowDownIcon className=' w-6 text-gray-600' />  </Link>
								</div>
							</div>
						</div>
					))
				}

			</div>
		</>
	)

}

export default Orders