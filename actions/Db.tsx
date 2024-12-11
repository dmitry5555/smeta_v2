'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/components/Prisma'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const dbAddUser = async (name: string, email: string, password: string) => {
	if (email && password) {
		const user = await prisma.users.create({
			data: {
				name,
				email,
				password: await bcrypt.hash(password, 10),
				role: 'manager',
			},
		});
		return user;
	}
}

export const dbEditUser = async (id: number, name: string, email: string, password?: string) => {
	const dataToUpdate = {
	  ...(name ? { name } : {}), // если не пустое то обновляем	  
	  ...(email ? { email } : {}),
	  ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
	};
  
	const user = await prisma.users.update({
	  where: {
		id,
	  },
	  data: dataToUpdate,
	});
  
	return user;
}


export const dbGetUsers = async () => {
	const data = await prisma.users.findMany()
	return data
}

export const dbLogin = async (email: string, password: string) => {
	const user = await prisma.users.findFirst({
	  where: {
		email,
	  },
	});
	// dbAddUser('1@2.3', '123')
	if (user && await bcrypt.compare(password, user.password))
	{
		// console.log('Logged in')
		const jwt_secret = process.env.JWT_SECRET || ''
		const access_token = jwt.sign({ id: user?.id }, jwt_secret, {expiresIn: '15d'})
		cookies().set('access_token', access_token)
		// console.log('Logged in')
		redirect('/')
	}
}


export const dbLogout = async () => {
	cookies().delete('access_token')
}


export const getUserIdCook = async() => {
	const token = cookies().get('access_token')?.value || '';
	if (!token) {
	  return null
	}
	const jwt_secret = process.env.JWT_SECRET || '';
	try {
	  const user_cook = jwt.verify(token, jwt_secret) as JwtPayload;
	  return user_cook;
	} catch (error) {
	  console.error('Error verifying token:', error);
	  return null
	}
  }

export const dbGetProject = async(docId: number) => {
	const data = await prisma.doc.findUnique({
		where: { id: Number(docId) },
		include: { fields: true },
	})
	return data
}

export const dbGetProjects = async(user_id: number) => {
	const data = await prisma.doc.findMany({
		where: {
		  // userId: user_id,
		  show: true,
		},
		include: { 
			user: true,
		},
	  });
	return data
}


export const dbGetKoefs = async (docId: number) => {
	const data = await prisma.koef.findMany({
		where: {
			docId: Number(docId),
		//   show: true,
		},
	  });
	return data
}

export const dbUpdateProjectInfo = async (project_id: number, client: string, description: string, dog_num: string, location: string, name: string, phone1: string, editor_id: number) => {
	try{
		await prisma.doc.update({
			where: {
				id: project_id as number,
			},
			data: {
				client,
				description,
				dog_num,
				location,
				name,
				phone1,
				updatedAt: new Date(),
			},
		})
		return true
	} catch (error) {
		return false
	}
};


// export const dbUpdateProjectInfo = async (project: any, editor_id: any) => {
// 	try{
// 		await prisma.doc.update({
// 			where: {
// 				id: project.id,
// 			},
// 			data: {
// 				...project,
// 				updatedAt: new Date(),
// 				userId: Number(editor_id),
// 				fields: {
// 					set: project.fields,
// 				},
// 			},
// 			include: {
// 				fields: false,
// 			},
// 		});

// 		return true;
// 	} catch (error) {
// 		return false;
// 	}
// }


  export const dbUpdateKoefs = async (koefs: any[]) => {
	try {
		await prisma.$transaction(async (tx) => {
			const updatePromises = koefs.map(koef => {
				return tx.koef.update({
					where: { id: koef.id },
					data: {
						name: koef.name,
						value: koef.value
					}
				});
			});
			await Promise.all(updatePromises);
		});
		return true;
	} catch (error) {
		return false;
	}
  };

  export const dbUpdatePositions = async (docId: number, fields: any[]) => {
	try{
		await prisma.$transaction(async (tx) => {
		const updatePromises = fields.map(field => {
			if (field.new_pos) {
				// Создаем новую запись, если id == 0 и name не пустой
				if (field.name && field.name.trim() !== '') {
					return tx.field.create({
					data: {
						id: undefined,
						docId: docId,
						code: String(field.code),
						name: field.name,
						measure: field.measure,
						value: field.value,
						price: field.price,
						// Добавьте другие необходимые поля здесь
					}
					});
				} else {
					// Если name пустой, не создаем новую запись
					return Promise.resolve();
				}
				} else {
				if (field.name && field.name.trim() !== '') {
					// Обновляем существующую запись, если name не пустой
					return tx.field.update({
					where: { id: field.id },
					data: {
						// code: field.code,
						name: field.name,
						measure: field.measure,
						value: field.value,
						price: field.price,
						finalKoef: field.finalKoef,
						valueNoKoef: field.valueNoKoef,
						updatedAt: new Date()
						// Добавьте другие обновляемые поля здесь
					}
					});
				} else if (!field.secured) {
					// Удаляем запись, если это позиция не secured
					return tx.field.delete({
					where: { id: field.id }
					});
				}
				}
			});
		
			await Promise.all(updatePromises);
			// return await tx.field.findMany({ where: { docId } });
		});
		return true;
	} catch (error) {
		return false;
	}
  };


//   export const dbCloneDoc = async (docId: number) => {
  export const dbCloneDoc = async () => {
		// найти самый новый документ 
		const originalDoc = await prisma.doc.findFirst({
			where: { show: true },
			orderBy: { id: 'desc' }, // найти самый новый документ
			include: { 
				fields: { orderBy: { id: 'asc' } } , // сортировка перед копированием
				koefs: { orderBy: { id: 'asc' } } , 
			}
  		});

		if (!originalDoc) {
			throw new Error('Doc not found');
		}
	
		// Создать новый Doc без копирования id, createdAt, и updatedAt
		const newDoc = await prisma.doc.create({
			data: {
				...originalDoc,
				name: `${originalDoc.name} (копия)`,
				id: undefined, // Убедитесь, что id не копируется
				createdAt: undefined,
				updatedAt: undefined,
				fields: undefined, // Не копируем поля напрямую
				koefs: undefined, // Не копируем поля напрямую
			},
		});
	
		// Копировать каждый Field и связать с новым Doc
		for (const field of originalDoc.fields) {
			await prisma.field.create({
				data: {
					...field,
					id: undefined,
					docId: newDoc.id,
					createdAt: undefined,
					updatedAt: undefined,
				},
			});
		}

		// то же с коэф-ми
		for (const koef of originalDoc.koefs) {
			await prisma.koef.create({
				data: {
					...koef,
					id: undefined,
					docId: newDoc.id,
					createdAt: undefined,
					updatedAt: undefined,
				},
			});
		}

		// Ожидаем завершения всех операций создания Field
		// await Promise.all(fieldCreations);
		return newDoc;
  }
  
  // export const dbDeleteDoc = async (docId: number) => {
  export const dbDeleteDoc = async () => {
  
	// desc - сверху asc - снизу
	const latestDoc = await prisma.doc.findFirst({
		orderBy: {
			id: 'asc', 
		},
		include: {
			fields: true,
		},
	});
	  
	if (!latestDoc) {
	  throw new Error('Doc not found');
	}
  
	// Удалить все связанные поля
	await prisma.field.deleteMany({
	  where: { docId: latestDoc.id },
	});
	await prisma.koef.deleteMany({
		where: { docId: latestDoc.id },
	  });
  
	// Удалить сам документ
	const deletedDoc = await prisma.doc.delete({
	  where: { id: latestDoc.id },
	});
  
	return deletedDoc;
  }