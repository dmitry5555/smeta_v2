
const Koef = ({ handleKoefChange, koef, pos_id }: any) => {

	return (
		<>
			<div key={koef.id} className='flex flex-row w-full px-2 py-2 border border-t-0 text-sm -z-1 bg-gray-50'>
				<div className='w-6/12 my-auto flex-row flex'>
					<input onChange={(e) => handleKoefChange(koef.id, pos_id, koef.koef_code, e.target.value as string)} 
						name='name' 
						className='bg-gray-50 w-4/5 max-w-full py-2 px-6 rounded-lg my-auto'
						type="text" 
						defaultValue={koef.name} />
				</div>
				<div className='w-2/12 my-auto mr-0'>
					<input onChange={(e) => handleKoefChange(koef.id, pos_id, koef.koef_code, parseFloat(e.target.value) as number)}
						name='value' 
						className='no-num-arrows w-20 max-w-full py-2 px-3 rounded-lg border my-auto'
						type="number"
						step="any"
						value={koef.value}
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
			</div>
			
		</>
	)

}

export default Koef
