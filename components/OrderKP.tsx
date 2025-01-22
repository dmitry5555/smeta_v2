/* eslint-disable react/display-name */
'use client'

import { dbGetKoefs, dbGetProject } from '@/actions/Db'
import { useCallback, useEffect, useState, memo } from 'react'

// import { Document, Packer, Paragraph, TextRun } from "docx";
// import { saveAs } from "file-saver";

const OrderKp = memo(({proj_id, user_id}: any) => { 

	const [positions, setPositions] = useState<any | null>(null)
	const [docKoefs, setDocKoefs] = useState<any | null>(null)
	const [sums, setSums] = useState<any | null>(null)
	const [projectInfo, setProjectInfo] = useState<any | null>(null)

	// const content = document.getElementById("content");

	// function generateDocFromDiv() {
	// 	// Получаем div по ID
	// 	const content = document.getElementById("content");
	  
	// 	if (!content) {
	// 	  console.error("Контент не найден");
	// 	  return;
	// 	}
	  
	// 	// Создаем новый документ
	// 	const doc = new Document({
	// 	  sections: [
	// 		{
	// 		  children: Array.from(content.children).map((child) => {
	// 			// Извлекаем текстовое содержимое каждого дочернего элемента
	// 			const text = child.innerText || child.textContent;
	// 			return new Paragraph({
	// 			  children: [
	// 				new TextRun({
	// 				  text: text,
	// 				  size: 24,
	// 				}),
	// 			  ],
	// 			});
	// 		  }),
	// 		},
	// 	  ],
	// 	});
	  
	// 	// Сохраняем документ как .docx
	// 	Packer.toBlob(doc).then((blob) => {
	// 	  saveAs(blob, "content.docx");
	// 	});
	// }
	  
	useEffect(() => {
		const fetchFields = async () => {
		  	const data = await dbGetProject(proj_id)
			const koefs = await dbGetKoefs(proj_id)
			setDocKoefs(koefs)
			// console.log(koefs)
		    setPositions(data?.fields)
			setProjectInfo(data)

		};
		fetchFields();
	}, [proj_id]);



	useEffect(() => {
		if(positions) {

			const positionSum = (id: number) => {
				const pos = positions.find((pos:any) => pos.id === id)
				return Math.round(pos.value * pos.price)
			}
			
			const sumAll = (positions: any) => {
				return Math.round(
					positions.reduce((sum: any, pos: any) => sum + pos.value * pos.price, 0)
				)
			}

			const updateSums = () => {

				// ДИНАМИЧЕСКИЙ ПОДСЧТЕТ ОТДЕЛЬНЫх ПОЗИЦИЙ В ПРАЙСЕ, В ТЧ КОЭФФИЦИЕНТОВ

				// ИТОГО - КОЭФФИЦИЕНТЫ 1 И 2 + ФИКС СУММА РАСХОДЫ 1 И 2 
				const koef1_data = docKoefs.find((koef: any) => koef.koef_code == 'koef1')
				const koef2_data = docKoefs.find((koef: any) => koef.koef_code == 'koef2')
				const rashReal1_data = docKoefs.find((koef: any) => koef.koef_code == 'rashReal1')
				const rashReal2_data = docKoefs.find((koef: any) => koef.koef_code == 'rashReal2')
				const koef1 = koef1_data.value
				const koef2 = koef2_data.value
				const rashReal1 = rashReal1_data.value
				const rashReal2 = rashReal2_data.value
		
				// ФУНДАМЕНТ
				const fund_pos = positions.filter((pos: any) => pos.code == 1)

				const sum1_1 = positionSum(fund_pos[0].id) + positionSum(fund_pos[1].id) + positionSum(fund_pos[2].id) + positionSum(fund_pos[4].id) + positionSum(fund_pos[5].id)   // Сумма работ фундамент
				const sum1_2 = positionSum(fund_pos[3].id) + positionSum(fund_pos[6].id) + positionSum(fund_pos[8].id)  // Материалы без чеков
				const sum1_3 = positionSum(fund_pos[7].id) + positionSum(fund_pos[9].id) // Сумма материалов с чеками
				const sum1_4 = sum1_2 + sum1_3 // Все Материалы без наценки
				const sum1_5 = sum1_1 + sum1_4 // Все затраты на фундамент
				const sum1_6 = Math.round(sum1_5 * 0.3) // Прибыль с фундамента
				const sum1_7 = sum1_5 + sum1_6 // Итого фундамент:
				
				const sum1_8 = sum1_7 - sum1_3 // Сумма налогообложения
				const sum1_9 = Math.round(sum1_8 * 0.15) // Налоги
				const sum1_10 = sum1_6 - sum1_9 // Чистая прибыль
				
				// СТЕН КОМПЛЕКТ, КРОВЛЯ
				const sum2_1 = sumAll(positions.filter((pos: any) => pos.code == 2)) // стеновой комплект
				const sum3_1 = sumAll(positions.filter((pos: any) => pos.code == 3)) // стеновой комплект материалы
				const sum4_1 = sumAll(positions.filter((pos: any) => pos.code == 4)) // кровля
				const sum5_1 = sumAll(positions.filter((pos: any) => pos.code == 5)) // кровля материалы
				const sum5_2 = Number(sum1_2) // плюс доска на леса !!!
				
				// ЧАСТЬ 1 РАСЧЕТ
				const korobka_itogo_rab = sum2_1 + sum4_1
				const korobka_itogo_mat_bn =  sum3_1 + sum5_1
				// const korobka_zp_tehno_bf = sum4_1 + sum3_1
				const korob_itogo_mat_sn = Math.round(korobka_itogo_mat_bn * koef1)
				const korob_raboty_rab = korobka_itogo_rab * 0.6
				const korob_prib_s_mat = Math.round(korobka_itogo_mat_bn * koef1) - korobka_itogo_mat_bn
				const korob_prib_s_rab = sum2_1 + sum4_1 - korob_raboty_rab
				const korobka_itogo_rab_bez_f = sum2_1 + sum4_1 + korob_itogo_mat_sn
				const korobka_itogo_rab_s_f = sum2_1 + sum4_1 + korob_itogo_mat_sn + sum1_7

				const korob_korob_nalog_bf =  korobka_itogo_rab + korob_itogo_mat_sn - korobka_itogo_mat_bn - rashReal1
				const korob_nalog =  Math.round(korob_korob_nalog_bf * 0.15)
				const korob_nalog_sf = (korob_nalog) + (sum1_9)

				const korob_zp_magager_sf = Math.round(korobka_itogo_rab_s_f * 0.01)
				const korob_zp_tehno_sf = Math.round(korobka_itogo_rab_s_f * 0.01)
				const korob_zp_magager_bf = Math.round(korobka_itogo_rab_bez_f * 0.01)
				const korob_zp_tehno_bf = Math.round(korobka_itogo_rab_bez_f * 0.01)

				const prib_bez_fund = Math.round(korobka_itogo_rab_bez_f - korobka_itogo_mat_bn - korob_raboty_rab - rashReal1 - korob_nalog  )
				const prib_s_fund = Math.round(korobka_itogo_rab_s_f - korobka_itogo_mat_bn - korob_raboty_rab - rashReal1 - korob_nalog_sf - sum1_1 - sum1_2 - sum1_3  )


				// ФАСАД
				/* 132? */ const sum6_1 = sumAll(positions.filter((pos: any) => pos.code == 6)) // Свесы кровли работы
				/*  */ const sum7_1 = sumAll(positions.filter((pos: any) => pos.code == 7)) // Свесы кровли - Материалы
				/* 145 */ const sum8_1 = sumAll(positions.filter((pos: any) => pos.code == 8)) // 8 Окраска фасада - работы
				/* 153 */ const sum9_1 = sumAll(positions.filter((pos: any) => pos.code == 9)) // 9 Окраска фасада - Материалы
				/* 159 */ const sum10_1 = sumAll(positions.filter((pos: any) => pos.code == 10)) // 10 Терраса - работы
				/* 167 */ const sum11_1 = sumAll(positions.filter((pos: any) => pos.code == 11)) // 11 Терраса - Материалы

				// ОКНА, УТ. КРОВЛИ
				/* 177 */ const sum12_1 = sumAll(positions.filter((pos: any) => pos.code == 12)) // 12 Утепления кровли - работы
				/* 190 */ const sum13_1 = sumAll(positions.filter((pos: any) => pos.code == 13)) // 13 Утепления кровли - Материалы
				/* 201 */ const sum14_1 = sumAll(positions.filter((pos: any) => pos.code == 14)) // 14 Двери Окна -  работы
				/* 220 */ const sum15_1 = sumAll(positions.filter((pos: any) => pos.code == 15)) // 15 Двери Окна - Материалы
				
				// ПЕРЕКРЫТИЯ
				/* 234 */ const sum16_1 = sumAll(positions.filter((pos: any) => pos.code == 16)) // 16 Полы 1 этаж - работы
				/* 252 */ const sum17_1 = sumAll(positions.filter((pos: any) => pos.code == 17)) // 17 Полы 1 этаж - Материалы
				/* 262 */ const sum18_1 = sumAll(positions.filter((pos: any) => pos.code == 18)) // 18 Межэтажное перекрытия - работы
				/* 276 */ const sum19_1 = sumAll(positions.filter((pos: any) => pos.code == 19)) // 19 Межэтажное перекрытия - Материалы
				/* 286 */ const sum20_1 = sumAll(positions.filter((pos: any) => pos.code == 20)) // 20 Чердачное перекрытия работы
				/* 300!+антр */ const sum21_1 = sumAll(positions.filter((pos: any) => pos.code == 21)) // 21 Чердачное перекрытия - Материалы
				/*  */ const sum27_1 = sumAll(positions.filter((pos: any) => pos.code == 27)) // 27 Перекрытия антресоль работы
				/*  */ const sum28_1 = sumAll(positions.filter((pos: any) => pos.code == 28)) // 28 Перекрытия антресоль - Материалы
				
				// МЕЖК.ПЕРЕКРЫТИЯ
				/* 311 */ const sum22_1 = sumAll(positions.filter((pos: any) => pos.code == 22)) // 22 Межкомнатные перегородки - работы
				/* 324 */ const sum23_1 = sumAll(positions.filter((pos: any) => pos.code == 23)) // 23 Межкомнатные перегородки - Материалы
				
				// ИНЖ КОММ
				const sum29_1 = sumAll(positions.filter((pos: any) => pos.code == 29)) // 29 Инженерные коммуникации

				// НАКЛАДНЫЕ
				const sum24_1 = sumAll(positions.filter((pos: any) => pos.code == 24)) // 24 Доставка материалов
				const sum25_1 = sumAll(positions.filter((pos: any) => pos.code == 25)) // 25 Проживание, питание
				const sum26_1 = sumAll(positions.filter((pos: any) => pos.code == 26)) // 26 СКИДКИ

				// ЧАСТЬ 2 РАСЧЕТ - koef2
				const fasad_itogo = sum6_1 + Math.round(sum7_1 * koef2) + sum8_1 + Math.round(sum9_1 * koef2) + sum10_1 + Math.round(sum11_1 * koef2)
				const okna_itogo =  sum12_1 + Math.round(sum13_1 * koef2) + sum14_1 + Math.round(sum15_1 * koef2)
				const perekr_itogo =  sum16_1 + Math.round(sum17_1 * koef2) + sum18_1 + Math.round(sum19_1 * koef2) + sum20_1 + Math.round(sum21_1 * koef2) + sum27_1 + Math.round(sum28_1 * koef2)
				const mkperekr_itogo = sum22_1 + Math.round(sum23_1 * koef2)
				const nakladnie_itogo = sum24_1 + sum25_1 - sum26_1

				// ЧАСТЬ 2 ИТОГО

				// 27_1 работы антресоль
				const itogo_rab_v_tk = sum27_1 + sum22_1 + sum20_1 + sum18_1 + sum16_1 + sum14_1 + sum12_1 + sum10_1 + sum8_1 + sum6_1
				// const itogo_rab_v_tk =  sum22_1 + sum20_1 + sum18_1 + sum16_1 + sum14_1 + sum12_1 + sum10_1 + sum8_1 + sum6_1

				// 29_1 инженерные коммуникации 28_1 материалы антресоль
				const itogo_mat_v_tk_bn = sum29_1 + sum28_1 + sum23_1 + sum21_1 + sum19_1 + sum17_1 + sum15_1 + sum13_1 + sum11_1 + sum9_1 + sum7_1
				// const itogo_mat_v_tk_bn = sum23_1 + sum21_1 + sum19_1 + sum17_1 + sum15_1 + sum13_1 + sum11_1 + sum9_1 + sum7_1
				const itogo_mat_sn = Math.round(itogo_mat_v_tk_bn * koef2)
				const mat_bez_chekov = nakladnie_itogo
				const raboty_rabotnikov =  Math.round(itogo_rab_v_tk * 0.6)
				const prib_s_mat = itogo_mat_sn - itogo_mat_v_tk_bn
				const prib_s_rab = itogo_rab_v_tk - raboty_rabotnikov

				const itogo_rab_i_mat_po_dog_vtk = itogo_rab_v_tk + itogo_mat_sn + mat_bez_chekov
				const itogo_rab_po_dog_vtk_pod_krish_bez_fund =  itogo_rab_i_mat_po_dog_vtk + korobka_itogo_rab_bez_f +  mat_bez_chekov
				const itogo_rab_po_dog_vtk_pod_krish_s_fund = itogo_rab_po_dog_vtk_pod_krish_bez_fund + sum1_7
				
				// const itogo_minus_sebest = itogo_rab_po_dog_vtk_pod_krish_s_fund - 
					const zp_v_tk_manager = Math.round(itogo_rab_i_mat_po_dog_vtk * 0.01)
					const zp_v_tk_tehnodzor = Math.round(itogo_rab_i_mat_po_dog_vtk * 0.01)
					const zp_v_tk_manager_bf = Math.round(itogo_rab_po_dog_vtk_pod_krish_bez_fund * 0.01)
					const zp_v_tk_tehnodzor_bf = Math.round(itogo_rab_po_dog_vtk_pod_krish_bez_fund * 0.01)
					const zp_v_tk_manager_sf = Math.round(itogo_rab_po_dog_vtk_pod_krish_s_fund * 0.01)
					const zp_v_tk_tehnodzor_sf = Math.round(itogo_rab_po_dog_vtk_pod_krish_s_fund * 0.01)

				// rashod_real
				const summa_nalogoobl = itogo_rab_i_mat_po_dog_vtk - itogo_mat_v_tk_bn - rashReal2
				const nalog = Math.round(summa_nalogoobl * 0.075)
				const pribil_v_tk = itogo_rab_i_mat_po_dog_vtk - nalog - rashReal2 - itogo_mat_v_tk_bn - raboty_rabotnikov - mat_bez_chekov - zp_v_tk_manager - zp_v_tk_tehnodzor
				const pribil_v_tk_pk_bf = Math.round(pribil_v_tk + prib_bez_fund - zp_v_tk_manager - zp_v_tk_tehnodzor)
				const pribil_v_tk_pk_sf = Math.round(pribil_v_tk + prib_s_fund - zp_v_tk_manager - zp_v_tk_tehnodzor)
				const sebest_v_tk_sf = Math.round(sum1_5 + korobka_itogo_rab + korob_raboty_rab + rashReal1 + korob_nalog_sf + itogo_mat_v_tk_bn + mat_bez_chekov + raboty_rabotnikov + rashReal2 + nalog + zp_v_tk_manager_sf + zp_v_tk_tehnodzor_sf)
				const itogo_rabot_minus_sebest = Math.round(itogo_rab_po_dog_vtk_pod_krish_s_fund - sebest_v_tk_sf)

				setSums({ sum1_1, sum1_2, sum1_3, sum1_4, sum1_5, sum1_6, sum1_7, sum1_8, sum1_9, sum1_10, sum2_1, sum3_1, sum4_1, sum5_1, sum5_2, 
					korobka_itogo_rab, korobka_itogo_mat_bn, korob_itogo_mat_sn, korob_raboty_rab, korob_prib_s_mat, korob_prib_s_rab, korobka_itogo_rab_bez_f, korobka_itogo_rab_s_f,
					korob_korob_nalog_bf, korob_nalog, korob_nalog_sf, korob_zp_magager_sf, korob_zp_tehno_sf, korob_zp_magager_bf, korob_zp_tehno_bf, prib_bez_fund, prib_s_fund,
					fasad_itogo, okna_itogo, perekr_itogo, mkperekr_itogo, nakladnie_itogo,
					sum6_1, sum7_1, sum8_1, sum9_1, sum10_1, sum11_1, sum12_1, sum13_1, sum14_1, sum15_1, sum16_1, sum17_1, sum18_1, sum19_1, sum20_1, sum21_1, sum22_1, sum23_1, sum24_1, sum25_1, sum26_1, sum27_1, sum28_1,
					itogo_rab_v_tk, itogo_mat_v_tk_bn, itogo_mat_sn, mat_bez_chekov, raboty_rabotnikov, prib_s_mat, prib_s_rab, itogo_rab_i_mat_po_dog_vtk, itogo_rab_po_dog_vtk_pod_krish_bez_fund, itogo_rab_po_dog_vtk_pod_krish_s_fund,
					pribil_v_tk, nalog,  zp_v_tk_manager, zp_v_tk_tehnodzor, summa_nalogoobl, pribil_v_tk_pk_bf, pribil_v_tk_pk_sf, sebest_v_tk_sf, itogo_rabot_minus_sebest, zp_v_tk_manager_bf, zp_v_tk_tehnodzor_bf,
					zp_v_tk_manager_sf, zp_v_tk_tehnodzor_sf, rashReal1, rashReal2, koef1, koef2, sum29_1
					
				 }); 
				 
				};
				
				updateSums();
				
			}
		}, [positions, docKoefs]);
		

	// generating unique id for new position
	const usedIds = new Set();
	function generateUniqueId(): number {
		let id;
		do {
			id = Math.floor(Math.random() * 10000) + 1;
		} while (usedIds.has(id));
		
		usedIds.add(id);
		return id;
	}
	
	// create new position for db
	const newPos = {
		id: generateUniqueId(),
		name: '--',
		price: 0,
		value: 0,
		measure: '--', 
		new_pos: true
	}
	
	const getTillComa = (str: string) => {
		return str.split(',').slice(0, 1);
	};
	const getTillParentheses = (str: string) => {
		return str.split('(').slice(0, 1);
	};
	const getInParentheses = (str: string) => {
		const match = str.match(/\(([^)]+)\)/);
		return match ? match[1] : '';
	}
	const removeFirstTwoWords = (str: string) => {
		return str.split(' ').slice(2).join(' ');
	}
	
	return (
		<>

			<div className='bg-white flex flex-col max-w-screen-md mx-auto w-full mb-6 py-8'>

				<div id='content' className='text-md leading-5 flex flex-col py-4 w-full px-4'>

					{/* Этап — Фундамент */}
					<div className='mx-auto py-4 font-bold text-center'>Приложение №1 к договору №{projectInfo && projectInfo.dog_num}
						<br/>Комплектация жилого дома с учетом материалов и работ</div>
					
					{sums && 0<sums.sum1_1 && <>
					<div className='font-bold'>Фундамент свайно-винтовой</div>
					<ul className='list-disc pl-4'>
						<li>Геодезические работы: разбивка осей, нивелировка</li>
					{/* {positions && 0 < positions[0].value && 
					<li key={position.id}>{positions[0].name}</li>} */}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '1_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name} - {position.value} {position.measure}</li>
						// <li key={position.id}>Винтовые сваи диаметром 114/108 мм толщина стенки 4,5 мм длина 3000 мм - {position.value} {position.measure}.</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '1_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name} - {position.value} {position.measure}</li>
						// <li key={position.id}>Оголовок 200х200 мм - {position.value} {position.measure}.</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '1_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>

					<p className='mt-4 -mx-4'><b>Примечание:</b> при  наличии уклона на стройплощадке стоимость фундамента увеличивается согласно Дополнительного соглашения.</p>
					</>}

					{/* Этап — Стеновой комплект */}
					{sums && 0<sums.sum2_1 && <>
					<div className='font-bold mt-4'>Стеновой комплект</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_20')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}



					{/* {positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>{position.name}</li>
					) : null;
					})()} */}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_12')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление перерубов - политерм, ПСУЛ лента</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_13')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Деревянные нагеля</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '2_4')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Пружинные узлы</li>
					) : null;
					})()}

					{/* {positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_13')
					return position && position.value > 0 ? (
						<li key={position.id_100}>Обработка антисептиком обвязочного бруса и лаг 1 этажа</li>
					) : null;
					})()} */}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '2_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_14')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_15')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_16')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '3_17')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Кровля */}
					{sums && 0<sums.sum4_1 && <>
					<div className='font-bold mt-4'>Кровля</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_15')
					return position && position.value > 0 ? (
						<li key={position.id + 100}>{position.name} с доборными элементами (коньки, карнизные планки, ветровые планки в цвет кровли)</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '4_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_6')
					const position2 = positions.find((pos:any) => pos.fixed_id === '5_7')
					return position && (position.value + position2.value > 0) ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_19')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_21')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}


					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_22')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_23')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}


					{/* Лобовые доски... */}
					{sums && 0<sums.sum6_1 && <>
					<div className='font-bold mt-4'>Лобовые доски, свесы кровли, подшив потолка террасы/крыльца (при наличии в проекте):</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '7_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{/* {positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '6_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Подшив потолка террасы/крыльца - доска сухая строганная 90х20 мм</li>
					) : null;
					})()} */}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '6_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '6_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '5_15')
					return position && position.value > 0 ? (
						<li key={position.id}>Цвет на выбор ______________</li>
					) : null;
					})()}

					{/* {positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '7_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()} */}
					</ul>
					</>}

					{/* Окраска фасада... */}
					{sums && 0<sums.sum8_1 && <>
					<div className='font-bold mt-4'>Окраска фасада:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '8_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '8_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}
					

					{/* Терраса и крыльцо... */}
					{sums && 0<sums.sum10_1 && <>
					<div className='font-bold mt-4'>Терраса и крыльцо:</div>
					<ul className='list-disc pl-4'>
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '11_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '11_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Окна, входная дверь... */}
					{sums && 0<sums.sum14_1 && <>
					<div className='font-bold mt-4'>Окна, входная дверь:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '14_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление - политерм, ПСУЛ лента</li>
					) : null;
					})()}		
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_17')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_10')
					return position && position.value > 0 ? (
						<li key={position.id+'2'}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '14_8')
					return position && position.value > 0 ? (
						<li key={position.id+'2'}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_13')
					return position && position.value > 0 ? (
						<li key={position.id}>{getInParentheses(position.name)}</li>
					) : null;
					})()}


					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '15_15')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Полы 1 этажа */}
					{sums && 0<sums.sum16_1 && <>
					<div className='font-bold mt-4 '>Полы 1 этажа:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '16_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_4')
					const position2 = positions.find((pos:any) => pos.fixed_id === '17_5')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '16_5')
					// const position2 = positions.find((pos:any) => pos.fixed_id === '17_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '16_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}
	
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_8')
					return position && position.value > 0 ? (
						<li key={position.id+100}>{getTillComa(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_9')
					const position2 = positions.find((pos:any) => pos.fixed_id === '17_10')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '16_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_13')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '17_14')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Утепление кровли */}
					{sums && 0<sums.sum12_1 && <>
					<div className='font-bold mt-4 '>Утепление кровли:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '12_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '12_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '13_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '13_4')
					const position2 = positions.find((pos:any) => pos.fixed_id === '13_5')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '13_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '12_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '13_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}


					{/* Межкомнатные перегородки */}
					{sums && 0<sums.sum22_1 && <>
					<div className='font-bold mt-4'>Межкомнатные перегородки:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}


					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_3')
					const position2 = positions.find((pos:any) => pos.fixed_id === '23_9')
					return position && position.value + position2.value > 0 ? (	
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '23_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Межэтажное перекрытие */}
					{sums && 0<sums.sum18_1 && <>
					<div className='font-bold mt-4 '>Межэтажное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '20_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '20_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '19_10')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Чердачное перекрытие */}
					{sums && 0<sums.sum20_1 && <>
					<div className='font-bold mt-4'>Чердачное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_6')
					// const position2 = positions.find((pos:any) => pos.fixed_id === '21_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '20_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '20_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '21_10')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Антресольное перекрытие */}
					{sums && 0<sums.sum27_1 && <>
					<div className='font-bold mt-4 '>Антресольное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '27_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillParentheses(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_2')
					const position2 = positions.find((pos:any) => pos.fixed_id === '28_6')
					return position && position.value + position2.value > 0 ? (	
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_7')
					return position && position.value > 0 ? (
						<li key={position.id+100}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '28_10')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Инженерные коммуникации */}
					{sums && 0<sums.sum29_1 && <>
					<div className='font-bold mt-4'>Инженерные коммуникации:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '29_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '29_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '29_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '29_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find((pos:any) => pos.fixed_id === '29_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					<div className='py-4 px-8 italic'>
						<div className='text-2xl py-4'>Стоимость этапов</div>
						<ul className='list-decimal pl-5 w-full'>
							{sums && 0<sums.sum1_1 && <li className='my-4'>Фундамент <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum1_7} руб.</span></li>}
							{sums && 0<sums.sum2_1 && <li className='my-4'>Стеновой комплект <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum2_1 + Math.round(sums.sum3_1 * sums.koef1)} руб.</span></li>}
							{sums && 0<sums.sum4_1 && <li className='my-4'>Кровля <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum4_1 + Math.round(sums.sum5_1 * sums.koef1)} руб.</span></li>}
							{sums && 0<sums.sum6_1 && <li className='my-4'>Лобовые доски, свесы кровли, потолок террасы <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum6_1 + Math.round(sums.sum7_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum8_1 && <li className='my-4'>Окраска фасада <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum8_1 + Math.round(sums.sum9_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum10_1 && <li className='my-4'>Терраса и крыльцо <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum10_1 + Math.round(sums.sum11_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum14_1 && <li className='my-4'>Окна, входная дверь <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum14_1 + Math.round(sums.sum15_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum16_1 && <li className='my-4'>Полы 1 этажа с утеплением <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum16_1 + Math.round(sums.sum17_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum12_1 && <li className='my-4'>Утепление кровли <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum12_1 + Math.round(sums.sum13_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum22_1 && <li className='my-4'>Межкомнатные перегородки <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum22_1 + Math.round(sums.sum23_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum18_1 && <li className='my-4'>Межэтажное перекрытие <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum18_1 + Math.round(sums.sum19_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum20_1 && <li className='my-4'>Чердачное перекрытие <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum20_1 + Math.round(sums.sum21_1 * sums.koef2)} руб.</span></li>}
							{sums && 0<sums.sum27_1 && <li className='my-4'>Антресольное перекрытие <span className='ml-auto float-right underline'>Итого по этапу: {sums.sum27_1 + Math.round(sums.sum28_1 * sums.koef2)} руб.</span></li>}		
							{sums && 0<sums.sum29_1 && <li className='my-4'>Инженерные коммуникации </li>}
							{positions && sums && (sums.sum24_1 + sums.sum25_1 - sums.sum26_1) > 0 &&
								<li className='my-4'>Накладные расходы <span className='ml-auto float-right underline'>Итого: {sums.sum24_1 + sums.sum25_1 - sums.sum26_1} руб.</span></li>
							}

						</ul>
					
						<ul className='list-disc pl-4 w-full'>
						{positions && (() => {
						const position = positions.find((pos:any) => pos.fixed_id === '29_1')
						// console.log(position)
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Септик  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find((pos:any) => pos.fixed_id === '29_2')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Разводка канализации  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find((pos:any) => pos.fixed_id === '29_3')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Разводка воды по дому  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find((pos:any) => pos.fixed_id === '29_4')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Отопление по дому + котельная  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find((pos:any) => pos.fixed_id === '29_5')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Теплый пол  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}
												
						</ul>

						{sums && <><p className='my-4 text-xl font-bold'><span className='ml-auto text-right float-right underline'>
							Итого: {
							sums.sum1_7
							+ sums.sum2_1 + Math.round(sums.sum3_1 * sums.koef1)
							+ sums.sum4_1 + Math.round(sums.sum5_1 * sums.koef1)
							+ sums.sum6_1 + Math.round(sums.sum7_1 * sums.koef2)
							+ sums.sum8_1 + Math.round(sums.sum9_1 * sums.koef2)
							+ sums.sum10_1 + Math.round(sums.sum11_1 * sums.koef2)
							+ sums.sum14_1 + Math.round(sums.sum15_1 * sums.koef2)
							+ sums.sum16_1 + Math.round(sums.sum17_1 * sums.koef2)
							+ sums.sum12_1 + Math.round(sums.sum13_1 * sums.koef2)
							+ sums.sum22_1 + Math.round(sums.sum23_1 * sums.koef2)
							+ sums.sum18_1 + Math.round(sums.sum19_1 * sums.koef2)
							+ sums.sum20_1 + Math.round(sums.sum21_1 * sums.koef2)
							+ sums.sum27_1 + Math.round(sums.sum28_1 * sums.koef2)
							+ Math.round(sums.sum29_1) + sums.nakladnie_itogo } руб.</span></p><br/></>}
						<p className='my-8 text-xl text-center'>{projectInfo && projectInfo.description}</p>
					</div>

					<div className='flex flex-row italic '>
						<div className='w-1/2'>Подрядчик:
							<br/><br/><br/>___________________/Ульянов С.В./
						</div>
						<div className='w-1/2'>Заказчик:
							<br/><br/><br/>___________________/{projectInfo && projectInfo.client}/
						</div>
					</div>
				</div>

			</div>

		</>
	)

})

export default OrderKp