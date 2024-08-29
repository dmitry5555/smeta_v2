import { useEffect, useState } from "react";

interface SumProps {
	name: string
	positions: Array<any>
	fields: any
}

const SumFromFieldsCodes = (codes: any, fields: any) => { 
	if(fields)
	{	
		let res = 0
		codes.forEach((code: String) => {
			const item = fields.find((field: any) => field.code === code)
			if (item) {
				res += item.value * item.price
			} else {
				console.log('Объект не найден: ' + code)
			}
		})
		return res
	}
}

const Sum = ({ name, positions, fields }: SumProps) => { 
	const [sum, setSum] = useState<any | null>(null)
	
	useEffect(() => {
		setSum(SumFromFieldsCodes(positions, fields))
    }, [positions, fields])
    
	return (
		<div className='flex flex-row w-full px-5 py-5 border border-t-0 text-sm gap-6' >
			<div className='w-9/12 my-auto text-right font-bold'>{name}:</div>
			<div className='w-3/12 my-auto' id=''>{sum}</div>
		</div>
	)
}
export default Sum

