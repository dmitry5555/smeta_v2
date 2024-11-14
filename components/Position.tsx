/* eslint-disable react/display-name */
import { AdjustmentsHorizontalIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { memo, useEffect, useState } from "react";

const readOnlyIds = [
	'1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8', // Фундамент
	'2_1', '2_2', '2_4', // Стеновой комплект - монтаж + сборка + антисептирование
	'4_11', // Антисептирование стропил, контробрешетки, обрешетки
	// '6_3', '6_4', // Свесы кровли работы
	'7_1', '7_2', '7_3', // Свесы кровли - Материалы
	'9_1', '9_2', '9_3',  // Окраска фасада - Материалы

	'10_3',  // Терраса - монтаж доски пода
	'11_3',  // Доска пола лиственница
	// '12_2', '12_3', '12_4', '12_5', // Утепления кровли
	'13_1', '13_3', // окна - утеплитель 1 и 2
	// '14_5', // монтаж отливов
	// '15_7', // Двери Окна - Материалы  - отлив металлический

	'17_6', // УтеплительТехноблок Стандарт, 0,288 м3
	'17_8', // УтеплительТехноблок Стандарт, 
	'17_13', // фанера
	'19_3',  // Межэтажное перекрытия - УтеплительТехноблок Стандарт, 0,288 м3
	'19_5',  // Межэтажное перекрытия - УтеплительТехноблок Стандарт, 0,288 м3
	'19_9',  // фанера

	'21_3', // чердачное - Утеплитель Техноблок Стандарт, 0,288 мм
	'21_5', // чердачное - Утеплитель 2

	'28_3', // антресоль - Утеплитель 1
	'28_5', // антресоль - Утеплитель 2
	'28_9', // антресоль - фанера

	'23_2', // Межкомнатные перегородки утеплитель
]

const Position = memo(({ docKoefs, position, handlePosChange, uniqueId, toggleKoefsVisibility, isKoefsVisible }: any) => {

	const [measure, setMeasure] = useState( position.measure )
	const [price, setPrice] = useState( Number(position.price) )
	const [name, setName] = useState( position.name)
	const [value, setValue] = useState( Number(position.value) )
	const [total, setTotal] = useState( Number((position.value * position.price).toFixed(0)))

	const hasKoefs = docKoefs?.some((koef: any) => koef.koef_code === position.koef_code)

	const handleToggleDocKoefs = () => {
		toggleKoefsVisibility(position.id);
	};

	useEffect(() => {
		setMeasure(position.measure);
		setPrice(Number(position.price));
		setName(position.name);
		setValue(Number(position.value));
		setTotal(Number((position.value * position.price).toFixed(0)));
	}, [position]);

	const handleMeasureChange = (e: any) => {
		const newMeasure = e.target.value
		setMeasure(newMeasure)
		handlePosChange(position.id, position.fixed_id, newMeasure, name, value, price)
	};
	const handleValueChange = (e: any) => {
		let newValue = e.target.value
		if ( e.target.value !== '') {
			newValue = parseFloat(e.target.value)
		}
		// const newValue = parseFloat(e.target.value)
		// console.log('e value: ', typeof(e.target.value))
		// console.log('parsed value: ', typeof(parseFloat(e.target.value)) )
		// console.log('is empty: ', e.target.value == '' )
		// const newValue = e.target.value
		setValue(newValue)
		setTotal(Number((newValue * price).toFixed(0)))
		handlePosChange(position.id, position.fixed_id, measure, name, newValue, price)
	};
    const handlePriceChange = (e: any) => {
		let newPrice = e.target.value
		if ( e.target.value !== '') {
			newPrice = parseFloat(e.target.value)
		} 
		setPrice(newPrice)
		setTotal(Number((newPrice * value).toFixed(0)))
		handlePosChange(position.id, position.fixed_id, measure, name, value, newPrice)
	};
	const handleNameChange = (e: any) => {
		const newName = e.target.value
		setName(newName)
		handlePosChange(position.id, position.fixed_id, measure, newName, value, price)
	};

	return (
	<>
		{/* unique-id	присваивается при создании позиции (вкл порядок.) 
			fixed_id	берется из бд, задан вручную  */}
		<div className='flex flex-row w-full px-5 py-2 border border-t-0 text-sm -z-1' data-id={position.fixed_id} data-fixed-id={position.fixedId} data-unique-id={uniqueId}>
			<div className='w-7/12 my-auto flex-row flex'>
				<input onChange={handleNameChange} name='name' className='w-10/12 max-w-full py-2 px-3 rounded-lg  my-auto' type="text" defaultValue={position.name} />
				{hasKoefs && <AdjustmentsHorizontalIcon className="w-5 mr-6 opacity-100 ml-auto cursor-pointer" onClick={handleToggleDocKoefs} />}
			</div>
			<div className='w-1/12 my-auto mx-1'>
				<input onChange={handleMeasureChange} name='measure' className='w-20 max-w-full py-2 px-3 rounded-lg border my-auto' type="text" defaultValue={position.measure} />
			</div>
			<div className='w-1/12 my-auto'>
				<input onChange={handleValueChange} name='value' className={`${readOnlyIds.includes(position.fixed_id) ? 'bg-gray-100' : ''} no-num-arrows w-20 max-w-full py-2 px-3 rounded-lg border my-auto`} 
					type="number"
					onWheel={(e) => (e.target as HTMLInputElement).blur()}
					inputMode="decimal"
					readOnly={readOnlyIds.includes(uniqueId)}
					step="any"
					value={position.value}
					onKeyDown={(event) => {
						if (!/[0-9.]/.test(event.key) && 
							event.key !== 'Backspace' && 
							event.key !== 'Delete' && 
							event.key !== 'ArrowLeft' && 
							event.key !== 'ArrowRight' && 
							event.key !== 'Tab') {
							event.preventDefault();
						}
					}}
				/>
			</div>
			<div className='w-1/12 my-auto'>
				<input onChange={handlePriceChange} name='price' className='no-num-arrows w-20 max-w-full py-2 px-3 rounded-lg border my-auto'  
					type="number"
					onWheel={(e) => (e.target as HTMLInputElement).blur()}
					step="any"
					value={position.price}
					onKeyDown={(event) => {
						const isNumeric = /[0-9.]/.test(event.key);
						const isSpecialKey = 
							event.key === 'Backspace' || 
							event.key === 'Delete' || 
							event.key === 'ArrowLeft' || 
							event.key === 'ArrowRight' || 
							event.key === 'Tab' || 
							event.key === 'NumPadDecimal' || 
							event.key === 'Period';
					
						if (!isNumeric && !isSpecialKey) {
							event.preventDefault();
						}
					}}
				/>
			</div>
			<div className='w-1/12 my-auto flex-row flex'>
				<div>{total}</div>
				{/* <input name="total" value={total} /> */}
			</div>
			<div className='w-1/12 my-auto flex-row flex'>
				{position.secured && <LockClosedIcon className="w-5 ml-auto text-gray-300" />}
			</div>
		</div>

	</>
	)
})
export default Position

