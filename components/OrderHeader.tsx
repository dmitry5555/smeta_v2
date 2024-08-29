'use client'

import { useState } from "react";
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import Link from "next/link";


// const OrderHeader = (setFormChanged: any) => {

const OrderHeader = () => {
	const [isProjectInfoOpen, setProjectInfoOpen] = useState(true)
	const [formChanged, setFormChanged] = useState(false)

	const toggleProjectInfo = () => {
		setProjectInfoOpen(!isProjectInfoOpen);
	}
	const handleInputChange = () => {
		setFormChanged(true);
	}

	return (

		<div className='bg-white sticky top-0'>
			<div className='flex flex-row px-5 py-4 mt-5 border border-b-0 bg-white rounded-t-xl '>
				<div className=''>
					<div className='flex flex-row gap-2'>
						<Link href='/' className='my-auto'>
							<svg className="my-auto size-5 rotate-180 " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 18 6-6-6-6"></path></svg>
						</Link>
						<h2 className='text-xl font-bold'>Проект Кенигсберг 2.0 из клеёного бруса</h2>
					</div>
					<div className='text-gray-500'>Кенигсберг 2.0 из клеёного бруса в Ухте район УРМЗ, площадь дома 135 м2</div>
				</div>
				<div className='ml-auto my-auto flex gap-2'>
					<div onClick={toggleProjectInfo} className=' px-3 py-2 text-lg border rounded-lg border-gray-200 hover:bg-gray-100 cursor-pointer'>
						<Cog6ToothIcon className='w-5' />
					</div>
					<button className='text-white px-3 py-2 text-sm border border-transparent font-semibold bg-blue-600 rounded-lg disabled:opacity-40' disabled={!formChanged}>Сохранить</button>
				</div>
			</div>
			
			<div id='project-info' className={`border border-b-0 flex flex-col px-6 pt-6 pb-8 text-sm gap-4 transition-all duration-500 ease-in-out ${isProjectInfoOpen ? 'hidden' : ''}`}>
				<div className='flex gap-8'>
					<div className='flex w-full flex-col'>
						<span>Название</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='Проект Кенигсберг 2.0 из клеёного бруса' />
					</div>
					<div className='flex w-full flex-col'>
						<span>Чертёж, эскиз, проект</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='1' />
					</div>
					<div className='flex w-full flex-col'>
						<span>Место</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='Нарьян-Мар,улица Мира' />
					</div>
				</div>
				<div className='flex gap-8'>
					<div className='flex w-full flex-col'>
						<span>Имя клиента</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='Иванов И.И.' />
					</div>
					<div className='flex w-full flex-col'>
						<span>Телефон</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='79101112222' />
					</div>
					<div className='flex w-full flex-col'>
						<span>Телефон (2)</span>
						<input onChange={handleInputChange} className=' mt-2 w-full max-w-full py-2 px-3 rounded-lg border my-auto' type="text" placeholder='79101112223' />
					</div>
				</div>
			</div>

			<div className='flex flex-row w-full px-5 py-2 border uppercase text-xs font-semibold bg-gray-50 text-black'>
				<div className='w-6/12 my-auto'>Наименование</div>
				<div className='w-1/12 my-auto mx-1'>Ед.изм</div>
				<div className='w-1/12 my-auto'>Кол-во</div>
				<div className='w-1/12 my-auto'>Цена</div>
				<div className='w-2/12 my-auto'>Сумма</div>
				<div className='w-1/12 my-auto'>Чек</div>
			</div>
		</div>

	)
	}

export default OrderHeader