'use client'

import { dbLogin } from '@/actions/Db';
import Image from 'next/image';
import React, { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
//   const [isLogged, setIsLogged] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e:any) => {
    e.preventDefault();
    await dbLogin(email, password)
	setError('Ошибка входа')
}

return (
<>
	<div className='flex flex-col my-auto w-64'>
		<div className='flex flex-col my-auto mt-32 p-8 border rounded-md border-gray w-80'>
			<Image src="/logo.png" alt="Logo" width={90} height={100} className='mx-auto mb-6' />
			<form onSubmit={handleLogin} className='flex flex-col gap-2 text-sm'>
				<input className=' max-w-full py-2 px-3 rounded-lg border my-auto mb-2'
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
				required
				/>
				<input className=' max-w-full py-2 px-3 rounded-lg border my-auto mb-4'
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Пароль"
				required
				/>
				<button type="submit" className='text-white px-3 py-2 text-sm border border-transparent font-semibold bg-blue-600 rounded-lg disabled:opacity-40'>Войти</button>
			</form>
			<p className='text-gray-500 text-sm mx-auto mt-2'>{error}</p>
		</div>
	</div>
</>

);

};

export default Login