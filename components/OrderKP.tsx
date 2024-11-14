/* eslint-disable react/display-name */
'use client'

import Link from 'next/link'
import { dbGetKoefs, dbGetProject, dbUpdateKoefs, dbUpdatePositions, dbUpdateProjectInfo } from '@/actions/Db'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState, memo } from 'react'
import Position from './Position'
import Koef from './Koef'
// import { Document, Packer, Paragraph, TextRun } from "docx";
// import { saveAs } from "file-saver";

const OrderKp = memo(({proj_id, user_id}: any) => { 
	const [visibleKoefs, setVisibleKoefs] = useState<{ [key: string]: boolean }>({});
	const [formChanged, setFormChanged] = useState(false)
	const [isProjectInfoOpen, setProjectInfoOpen] = useState(true)
	const [projectInfo, setProjectInfo] = useState<any | null>(null)
	const [positions, setPositions] = useState<any | null>(null)
	const [docKoefs, setDocKoefs] = useState<any | null>(null)
	const [sums, setSums] = useState<any | null>(null)
	
	const content = document.getElementById("content");

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
	  
			

		
	const toggleKoefsVisibility = useCallback((positionId: string) => {
		setVisibleKoefs((prevState) => ({
		  ...prevState,
		  [positionId]: !prevState[positionId],
		}));
	}, [])
	
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

	const saveProject = async () => {
		try {
			setFormChanged(false)
			const updateProject = await dbUpdateProjectInfo(projectInfo, user_id);
			const updatePositions = await dbUpdatePositions(projectInfo.id, positions);
			const updateKoefs = await dbUpdateKoefs(docKoefs);
			console.log('Project updated successfully:', updateProject);
			console.log('Positions updated successfully:', updatePositions);
			console.log('Koefs updated successfully:', updateKoefs);
			window.location.href = `/project/${projectInfo.id}`;
		} catch (error) {
		  console.error('Error updating project:', error);
		}
	  };

	const toggleProjectInfo = () => {
	  	setProjectInfoOpen(!isProjectInfoOpen);
	}

	const handleInputChange = useCallback(() => {
        setFormChanged(true);
    }, []);
	
	// по названию поля меняем значение - или инфа о договоре или коэф-ты
	const handleOrderChange = useCallback((name: string) => (e: any) => {
        let newValue = e.target.value;
        setProjectInfo((projectInfo: any) => ({ ...projectInfo, [name]: newValue }));
        handleInputChange();
    }, [handleInputChange])
	
	const handlePosCreate = useCallback((id: number, name: string, price: number, value: number, measure: string, code: number, new_pos: boolean) => {
        setPositions((positions: any[]) => {
            const index = positions.findIndex((pos: any) => pos.id === id);
            if (index === -1 && new_pos) {
                return [...positions, { id, name, price, value, measure, code, new_pos }];
            }
        });
        handleInputChange();
    }, [handleInputChange])

	// при смене позиции обновляем ее в базе
	// также ищем все связанные позиции (и перемножаем их индивидуальный фин. коэф-т)
	const handlePosChange = (id: number, fixed_id: string, measure: string, name: string, value: number, price: number) => {
		// если позиция влияет на другие - задаем связи
		let upd_pos: string[] = []
		// если меняем Х то пересчитывается и ...
		// if (fixed_id == '1_1') { upd_pos = ['1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8'] } // фундамент
		// else if (fixed_id == '3_1') { upd_pos = ['2_1'] } // монтаж обв бруса
		// else if (fixed_id == '2_3') { upd_pos = ['2_3','2_4'] } // сборка бруса
		
		setPositions((positions: any[]) => {
			return positions.map((pos: any) => {
				// обновляем саму позицию
				if (pos.id === id) {
					return { ...pos, measure, name, value, price }
				}

				// перебираем все другие позиции 
				// фундамент
				if (fixed_id === '1_1' && ['1_2', '1_3', '1_4', '1_5', '1_6', '1_7', '1_8'].includes(pos.fixed_id) ) {
					return { ...pos, value: value }
				}

				// кл брус - 1 позиция
				if ((fixed_id === '3_1') && ['2_1'].includes(pos.fixed_id) ) {
					return { ...pos, value: value }
				}

				// обвяз брус - 3 позиции, сумма
				if ((fixed_id === '3_3') && ['2_2'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_4')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_5')
					return { ...pos, value: value + pos2.value + pos3.value }
				}
				if ((fixed_id === '3_4') && ['2_2'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_3')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_5')
					return { ...pos, value: value + pos2.value + pos3.value }
				}
				if ((fixed_id === '3_5') && ['2_2'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_3')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_4')
					return { ...pos, value: value + pos2.value + pos3.value }
				}

				// обвяз брус + лаги - в антисептирование, сумма
				if ((fixed_id === '3_1') && ['2_4'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_14')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_15')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '3_16')
					return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				}
				if ((fixed_id === '3_14') && ['2_4'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_1')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_15')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '3_16')
					return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				}
				if ((fixed_id === '3_15') && ['2_4'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_1')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_14')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '3_16')
					return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				}
				if ((fixed_id === '3_16') && ['2_4'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '3_1')
					const pos3 = positions.find((pos: any) => pos.fixed_id === '3_14')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '3_15')
					return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				}
				
				// кровля стропилы + контробрешетки + обрешетки   -  в антисеп
				// if ((fixed_id === '5_1') && ['4_11'].includes(pos.fixed_id) ) {
				// 	const pos2 = positions.find((pos: any) => pos.fixed_id === '5_2')
				// 	const pos3 = positions.find((pos: any) => pos.fixed_id === '5_3')
				// 	const pos4 = positions.find((pos: any) => pos.fixed_id === '5_4')
				// 	return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				// }
				// if ((fixed_id === '5_2') && ['4_11'].includes(pos.fixed_id) ) {
				// 	// сумма двух позиций
				// 	const pos2 = positions.find((pos: any) => pos.fixed_id === '5_1')
				// 	const pos3 = positions.find((pos: any) => pos.fixed_id === '5_3')
				// 	const pos4 = positions.find((pos: any) => pos.fixed_id === '5_4')
				// 	return { ...pos, value: value + pos2.value + pos3.value + pos4.value }
				// }
				if ((fixed_id === '5_3') && ['4_11'].includes(pos.fixed_id) ) {
					// сумма двух позиций
					// const pos2 = positions.find((pos: any) => pos.fixed_id === '5_1')
					// const pos3 = positions.find((pos: any) => pos.fixed_id === '5_2')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '5_4')
					return { ...pos, value: value + pos4.value }
				}
				if ((fixed_id === '5_4') && ['4_11'].includes(pos.fixed_id) ) {
					// сумма двух позиций
					// const pos2 = positions.find((pos: any) => pos.fixed_id === '5_1')
					// const pos3 = positions.find((pos: any) => pos.fixed_id === '5_2')
					const pos4 = positions.find((pos: any) => pos.fixed_id === '5_3')
					return { ...pos, value: value + pos4.value }
				}

				// фасад Подшив свесов кровли , копия в шлифовку
				// if ((fixed_id === '6_1') && ['6_3'].includes(pos.fixed_id) ) {
				// 	return { ...pos, value: value }
				// }
				// Монтаж лобовых досок , копия в шлифовку
				// if ((fixed_id === '6_2') && ['6_4'].includes(pos.fixed_id) ) {
				// 	return { ...pos, value: value }
				// }
				
				// КОЭФФИЦИЕНТЫ
				// сохранить temp_val
				// сохранить value * finalKoef
				
				// фасад - расх материалы ( сумма шлифовок )
				if ((fixed_id === '6_3') && ['7_3'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_4')
					return { ...pos, value: (value + pos2.value) }
				}
				// фасад - расх материалы ( сумма шлифовок )
				if ((fixed_id === '6_4') && ['7_3'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_3')
					return { ...pos, value:(value + pos2.value) }
				}
	
				// коэффициенты k7_1_doska
				// доска - сумма шлифовок x 0.02 x 1.2
				if ((fixed_id === '6_3') && ['7_1'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_4')
					// console.log('6_3[d] pos.finalKoef: ', pos.finalKoef)
					return { ...pos, valueNoKoef: (value + pos2.value), value: Math.ceil((value + pos2.value) * pos.finalKoef) }
				} 
				if ((fixed_id === '6_4') && ['7_1'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_3')
					// console.log('6_4[d] pos.finalKoef: ', pos.finalKoef)
					return { ...pos, valueNoKoef:(value + pos2.value), value: Math.ceil((value + pos2.value) * pos.finalKoef) }
				}

				// окраска фасада k7_2_okraska свесы кровли
				if ((fixed_id === '6_3') && ['7_2'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_4')
					// console.log('6_3[k] pos.finalKoef: ', pos.finalKoef)
					return { ...pos, valueNoKoef: (value + pos2.value), value: Math.ceil ((value + pos2.value) * pos.finalKoef )}
					// return { ...pos, valueNoKoef: (value + pos2.value), value: Math.round((value + pos2.value) * pos.finalKoef * 100) / 100  }
				}
				if ((fixed_id === '6_4') && ['7_2'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '6_3')
					// console.log('6_4[k] pos.finalKoef: ', pos.finalKoef)
					return { ...pos, valueNoKoef: (value + pos2.value), value: Math.ceil ((value + pos2.value) * pos.finalKoef )}
					// return { ...pos, valueNoKoef: (value + pos2.value), value: Math.round((value + pos2.value) * pos.finalKoef * 100) / 100  }
				}

				// 9_1 окраска фасада - краска на фасад
				if ((fixed_id === '8_1') && ['9_1'].includes(pos.fixed_id) ) {
					// return { ...pos, value: value }
					return { ...pos, valueNoKoef: (value), value: Math.ceil(value * pos.finalKoef) }
					// return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }

				}
				// 9_2 окраска фасада - краска на перерубы 
				if ((fixed_id === '8_2') && ['9_2'].includes(pos.fixed_id) ) {
					return { ...pos, valueNoKoef: (value), value: Math.ceil(value * pos.finalKoef ) }
					// return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }
				}
				// 9_3 расходники на окраску - сумма шлифовок
				if ((fixed_id === '8_1') && ['9_3'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '8_2')
					return { ...pos, value: (value + pos2.value) }
				}
				if ((fixed_id === '8_2') && ['9_3'].includes(pos.fixed_id) ) {
					const pos2 = positions.find((pos: any) => pos.fixed_id === '8_1')
					return { ...pos, value: (value + pos2.value) }
				}
				// 10_3 терраса - копия монтаж обрешетки на монтаж доски пола
				if ((fixed_id === '10_2') && ['10_3'].includes(pos.fixed_id) ) {
					return { ...pos, value: value }
				}
				if ((fixed_id === '10_2') && ['11_3'].includes(pos.fixed_id) ) {
					return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }
				}  
				// утепление кровли 13_1 - 100  
				if ((fixed_id === '12_1') && ['13_1'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k13_1_krov_utep100' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }
				}
				// утепление кровли 13_2 - 50  
				if ((fixed_id === '12_3') && ['13_3'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k13_3_krov_utep50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }
				}
				// монтаж отливов - копия 
				// if ((fixed_id === '15_7') && ['14_5'].includes(pos.fixed_id) ) {
				// 	return { ...pos, value: value }
				// }
				// ПОЛЫ 1 ЭТ
				// утепление полы 16_1 - 100  
				if ((fixed_id === '16_5') && ['17_6'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k17_6_poli_utepl100' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }
				}
				// утепление 16_7 - 50 
				if ((fixed_id === '16_7') && ['17_8'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k17_8_poli_utepl50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }				}
				// полы 1 этаж - фанера
				if ((fixed_id === '16_9') && ['17_13'].includes(pos.fixed_id) ) {
					return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef) }
					// return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }
				}
				// МЕЖЕТАЖКНОЕ
				// утепление  - 100  
				if ((fixed_id === '18_3') && ['19_3'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k19_3_mezh_utep100' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }	
				}
				// утепление  - 50 
				if ((fixed_id === '18_5') && ['19_5'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k19_5_mezh_utep50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }				}
				// фанера
				if ((fixed_id === '18_7') && ['19_9'].includes(pos.fixed_id) ) {
					return { ...pos, valueNoKoef: (value ), value: Math.ceil(value * pos.finalKoef) }
					// return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }
				}
				// ЧЕРДАЧНОЕ
				// утепление  - 100  
				if ((fixed_id === '20_3') && ['21_3'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k21_3_cherd_utep100' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }	
				}
				// утепление  - 50 
				if ((fixed_id === '20_5') && ['21_5'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k21_5_cherd_utep50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }	
				}
				// АНТРЕСОЛЬ
				// утепление  - 100  
				if ((fixed_id === '27_3') && ['28_3'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k28_3_antres_utep100' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }				}
				// утепление  - 50 
				if ((fixed_id === '27_7') && ['28_5'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k28_5_antres_utep50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }				}
				// фанера
				if ((fixed_id === '27_6') && ['28_9'].includes(pos.fixed_id) ) {
					return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef) }
					// return { ...pos, valueNoKoef: (value ), value: Math.round(value * pos.finalKoef * 100) / 100 }
				}
				//  МЕЖК ПЕРЕГОРОДКИ - уткплитель
				if ((fixed_id === '22_2') && ['23_2'].includes(pos.fixed_id) ) {
					const balancer = docKoefs.find((koef: any) => koef.koef_code == 'k28_5_antres_utep50' && koef.is_balancer)
					return { ...pos, valueNoKoef: (value), value: Math.round( Math.ceil(value * pos.finalKoef / balancer.value ) * balancer.value * 100) / 100 }				}
				
				return pos
			})
		});
		handleInputChange();
	}

	const handleKoefNameChange = (id: number, pos_id: number, koef_code: string, is_balancer: boolean, value: string) => {
		let updatedKoefs: any[] = [];
		
		setDocKoefs((koefs: any[]) => {
			updatedKoefs = koefs.map((koef: any) => {
				if (koef.id === id) {
					return { ...koef, name: value };
				}
				return koef;
			});

			return updatedKoefs;
		});

		handleInputChange();
	};

	const handleKoefChange = (id: number, pos_id: number, koef_code: string, is_balancer: boolean, value: any) => {
		let updatedKoefs: any[] = [];

		let newValue = value
		if ( value !== '') {
			newValue = parseFloat(value)
		} 
		
		setDocKoefs((koefs: any[]) => {
			updatedKoefs = koefs.map((koef: any) => {
				if (koef.id === id) {
					return { ...koef, value: newValue };
				}
				return koef;
			});

			let hasBalancer = false
			const newKoef: number = updatedKoefs
			.filter((koef: any) => koef.koef_code === koef_code)
			.reduce((finalKoef: number, koef: any) => {
				if (koef.is_balancer) {
					hasBalancer = true
					return finalKoef;
					// return Math.round(finalKoef * 1 * 100) / 100;
				}
				if (koef.is_divider) {
					if (koef.value == 0 || koef.value == '') return 0;
					return finalKoef / koef.value;
					// return Math.round(finalKoef / koef.value * 100) / 100;

				}
				return finalKoef * koef.value;
				// return Math.round(finalKoef * koef.value * 100) / 100;
			}, 1)

			setPositions((positions: any[]) => {
				return positions.map((pos: any) => {
					if (pos.id === pos_id) {
						// рассчитываем измененную позицию, в которой меняли кэфы
						let balancerVal = 1
						if (hasBalancer) {
							if (is_balancer) {
								// берем значение тек.инпута - он и есть балансер
								balancerVal = newValue
							} else {
								// ищем балансер в группе кэфов
								let balancer = docKoefs.find((koef: any) => koef.koef_code == koef_code && koef.is_balancer)
								balancerVal = balancer.value
							}
							return { ...pos, value: Math.round( Math.ceil(pos.valueNoKoef * newKoef / balancerVal) * balancerVal * 100) / 100, finalKoef: newKoef }
						} else if (pos.koef_code == 'k17_13_fanera' || 'k19_9_fanera' || 'k28_9_antres_fanera') {
							return { ...pos, value: Math.ceil(pos.valueNoKoef * newKoef), finalKoef: newKoef }
						} else if (pos.koef_code == 'k7_2_okraska' || 'k9_1_orkaska_fasad' || 'k9_2_orkaska_perer') {
							return { ...pos, value: Math.ceil(pos.valueNoKoef * newKoef), finalKoef: newKoef }
							// 7_2 9_1 9_2 k7_2_okraska  k9_1_orkaska_fasad   k9_2_orkaska_perer
						} 

						return { ...pos, value: Math.round(pos.valueNoKoef * newKoef * 100) / 100, finalKoef: newKoef }
					}
					return pos;
				})
			})
			// console.log('finalKoef', newKoef)
			// console.log('valueNoKoef', valueNoKoef)

			return updatedKoefs;
		});

		handleInputChange();
	};


	// для коэф. ФИКС расход, фикс К1, К2  = используются в рассчетах ИТОГО
	const handleKoefChangeByName = (name: string, value: any) => {
		if (value !== '')
			value = parseFloat(value)
		let updatedKoefs: any[] = [];
		setDocKoefs((koefs: any[]) => {
			updatedKoefs = koefs.map((koef: any) => {
				if (koef.name === name) {
					return { ...koef, value };
				}
				return koef;
			});
			return updatedKoefs;
		});		
		handleInputChange();
	}

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
				const korobka_zp_tehno_bf = sum4_1 + sum3_1
				const korob_itogo_mat_sn = Math.round(korobka_zp_tehno_bf * koef1)
				const korob_raboty_rab = korobka_itogo_rab * 0.6
				const korob_prib_s_mat = Math.round(korobka_zp_tehno_bf * koef1) - korobka_zp_tehno_bf
				const korob_prib_s_rab = sum2_1 + sum4_1 - korob_raboty_rab
				const korobka_itogo_rab_bez_f = sum2_1 + sum4_1 + korob_itogo_mat_sn
				const korobka_itogo_rab_s_f = sum2_1 + sum4_1 + korob_itogo_mat_sn + sum1_7

				const korob_korob_nalog_bf =  (sum2_1) + (sum4_1) + (korob_itogo_mat_sn) - (korobka_zp_tehno_bf) - (rashReal1)
				const korob_nalog =  Math.round(korob_korob_nalog_bf * 0.075)
				const korob_nalog_sf = (korob_nalog) + (sum1_9)

				const korob_zp_magager_sf = Math.round(korobka_itogo_rab_s_f * 0.01)
				const korob_zp_tehno_sf = Math.round(korobka_itogo_rab_s_f * 0.01)
				const korob_zp_magager_bf = Math.round(korobka_itogo_rab_bez_f * 0.01)
				const korob_zp_tehno_bf = Math.round(korobka_itogo_rab_bez_f * 0.01)

				const prib_bez_fund = korobka_itogo_rab_bez_f - korob_nalog - rashReal1 - korob_raboty_rab - korobka_zp_tehno_bf - korob_zp_magager_bf - korob_zp_tehno_bf
				const prib_s_fund = korobka_itogo_rab_s_f - korob_nalog_sf - rashReal1 - korob_raboty_rab - korobka_zp_tehno_bf - sum1_5 - korob_zp_magager_sf - korob_zp_tehno_sf

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
				const itogo_rab_v_tk =  sum22_1 + sum20_1 + sum18_1 + sum16_1 + sum14_1 + sum12_1 + sum10_1 + sum8_1 + sum6_1
				const itogo_mat_v_tk_bn = sum23_1 + sum21_1 + sum19_1 + sum17_1 + sum15_1 + sum13_1 + sum11_1 + sum9_1 + sum7_1
				const itogo_mat_sn = Math.round(itogo_mat_v_tk_bn * koef2)
				const mat_bez_chekov = nakladnie_itogo
				const raboty_rabotnikov =  Math.round(itogo_rab_v_tk * 0.6)
				const prib_s_mat = itogo_mat_sn - itogo_mat_v_tk_bn
				const prib_s_rab = itogo_rab_v_tk - raboty_rabotnikov

				const itogo_rab_i_mat_po_dog_vtk = itogo_rab_v_tk + itogo_mat_sn
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
				const pribil_v_tk_pk_bf = pribil_v_tk + prib_bez_fund - zp_v_tk_manager - zp_v_tk_tehnodzor
				const pribil_v_tk_pk_sf = pribil_v_tk + prib_s_fund - zp_v_tk_manager - zp_v_tk_tehnodzor
				const sebest_v_tk_sf = sum1_5 + korobka_itogo_rab + korob_raboty_rab + rashReal1 + korob_nalog_sf + itogo_mat_v_tk_bn + mat_bez_chekov + raboty_rabotnikov + rashReal2 + nalog + zp_v_tk_manager_sf + zp_v_tk_tehnodzor_sf
				const itogo_rabot_minus_sebest = itogo_rab_po_dog_vtk_pod_krish_s_fund - sebest_v_tk_sf

				setSums({ sum1_1, sum1_2, sum1_3, sum1_4, sum1_5, sum1_6, sum1_7, sum1_8, sum1_9, sum1_10, sum2_1, sum3_1, sum4_1, sum5_1, sum5_2, 
					korobka_itogo_rab, korobka_zp_tehno_bf, korob_itogo_mat_sn, korob_raboty_rab, korob_prib_s_mat, korob_prib_s_rab, korobka_itogo_rab_bez_f, korobka_itogo_rab_s_f,
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
	
	const createPosition = (code: number) => {
		handlePosCreate(newPos.id, newPos.name, newPos.price, newPos.value, newPos.measure, code, newPos.new_pos)
	}
	const getFirstTwoWords = (str: string) => {
		return str.split(' ').slice(0, 2).join(' ');
	};

	const getTillComa = (str: string) => {
		return str.split(',').slice(0, 1);
	};

	const removeFirstTwoWords = (str: string) => {
		return str.split(' ').slice(2).join(' ');
	}
	
	return (
		<>

			<div className='bg-white flex flex-col max-w-screen-md mx-auto w-full mb-6 py-8'>

				{/* <button onClick={generateDocFromDiv}>Сохранить как DOCX</button> */}
				<div id='content' className='text-md leading-5 flex flex-col py-4 w-full px-4'>

					{/* Этап — Фундамент */}
					<div className='mx-auto py-4 font-bold'>Комплектация дома.</div>
					
					{sums && 0<sums.sum1_1 && <>
					<div className='font-bold'>Фундамент свайно-винтовой</div>
					<ul className='list-disc pl-4'>
						<li>Геодезические работы: разбивка осей, нивелировка</li>
					{/* {positions && 0 < positions[0].value && 
					<li key={position.id}>{positions[0].name}</li>} */}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '1_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Винтовые сваи диаметром 114/108 мм толщина стенки 4,5 мм длина 3000 мм - {position.value} {position.measure}.</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '1_5')
					return position && position.value > 0 ? (
						<li key={position.id}>Оголовок - {position.value} {position.measure}.</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '1_8')
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
					const position = positions.find(pos => pos.fixed_id === '3_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Сечение бруса внешних стен {removeFirstTwoWords(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Сечение бруса внешних стен {removeFirstTwoWords(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_12')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление перерубов - политерм, ПСУЛ лента</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_13')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Деревянные нагеля</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '2_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Пружинные узлы</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_13')
					return position && position.value > 0 ? (
						<li key={position.id_100}>Обработка антисептиком обвязочного бруса и лаг 1 этажа</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_14')
					const position2 = positions.find(pos => pos.fixed_id === '3_15')
					const position3 = positions.find(pos => pos.fixed_id === '3_16')
					return position && position.value + position2.value + position3.value > 0 ? (
						<li key={position.id}>Лаги 1 этажа – доска сухая строганная, сечением 195/95х45 мм, +/- 3мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Антисептик-консервант невымываемый NEOMID 430</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '3_17')
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
					const position = positions.find(pos => pos.fixed_id === '5_15')
					return position && position.value > 0 ? (
						<li key={position.id + 100}>{position.name} с доборными элементами (коньки, карнизные планки, ветровые планки в цвет кровли)</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '4_11')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_5')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_6')
					const position2 = positions.find(pos => pos.fixed_id === '5_7')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Гидро-ветрозащитная паропроницаемая мембрана Изоспан АМ</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_8')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_19')
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
					const position = positions.find(pos => pos.fixed_id === '6_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Лобовые доски, подшив свесов кровли - доска сухая строганная 90х20 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '6_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Подшив потолка террасы/крыльца - доска сухая строганная 90х20 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '5_15')
					return position && position.value > 0 ? (
						<li key={position.id}>Цвет на выбор ______________</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '7_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Окраска фасада... */}
					{sums && 0<sums.sum8_1 && <>
					<div className='font-bold mt-4'>Окраска фасада:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '8_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Шлифовка на 2 слоя стен, столбов, перерубов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '8_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Окраска на 2 слоя стен, столбов, перерубов</li>
					) : null;
					})()}
					</ul>
					</>}
					

					{/* Терраса и крыльцо... */}
					{sums && 0<sums.sum10_1 && <>
					<div className='font-bold mt-4'>Терраса и крыльцо:</div>
					<ul className='list-disc pl-4'>
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '11_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '11_4')
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
					const position = positions.find(pos => pos.fixed_id === '14_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Обсадные коробки из клееной доски 180х40 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление - политерм, ПСУЛ лента</li>
					) : null;
					})()}		
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_7')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_17')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '15_10')
					return position && position.value > 0 ? (
						<li key={position.id+'2'}>Наличники деревянные к окнам и дверям по фасаду</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '14_8')
					return position && position.value > 0 ? (
						<li key={position.id+'2'}>Шлифовка, окраска на 2 слоя наличников</li>
					) : null;
					})()}
						<li>Цвет окраски на выбор _______________</li>
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '13_9')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Полы 1 этажа */}
					{sums && 0<sums.sum16_1 && <>
					<div className='font-bold mt-4'>Полы 1 этажа:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '16_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Черновой пол естественной влажности</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '16_2')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_3')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_4')
					const position2 = positions.find(pos => pos.fixed_id === '17_5')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Ветро-влагозащитная мембрана Изоспан АМ, проклейка швов</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_6')
					const position2 = positions.find(pos => pos.fixed_id === '17_8')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Утепление полов 200 мм</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_8')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление полов вперехлест 50мм</li>
					) : null;
					})()}
	
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_6')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Утеплитель Техноблок Стандарт или его аналоги</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_9')
					const position2 = positions.find(pos => pos.fixed_id === '17_10')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В, с проклейкой швов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '16_6')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_13')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '17_14')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Утепление кровли */}
					{sums && 0<sums.sum12_1 && <>
					<div className='font-bold mt-4'>Утепление кровли:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '12_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление кровли 200 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '12_3')
					return position && position.value > 0 ? (
						<li key={position.id}>Перекрестное утепление 50 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '13_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{getTillComa(position.name)}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '13_4')
					const position2 = positions.find(pos => pos.fixed_id === '13_5')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В, с проклейкой швов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '13_8')
					return position && position.value > 0 ? (
						<li key={position.id}>Монтаж обрешетки, доска сухая строганная 90х20 мм, шаг 400-650мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '13_9')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}


					{/* Межкомнатные перегородки */}
					{sums && 0<sums.sum22_1 && <>
					<div className='font-bold mt-4'>Межкомнатные перегородки:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '22_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Каркас межкомнатных перегородок – доска сухая строганная 145х45 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '22_1')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Каркас межкомнатных перегородок – доска сухая строганная 95х45 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '22_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Утеплитель Техноблок Стандарт или его аналоги 100 мм + 50 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '22_3')
					return position && position.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В, проклейка швов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '23_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Доска сухая строганная 90х20 мм, шаг 400-650 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '23_8')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}


					{/* Межэтажное перекрытие */}
					{sums && 0<sums.sum18_1 && <>
					<div className='font-bold mt-4'>Межэтажное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '19_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '18_3')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление 200 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '18_5')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление вперехлест 50 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '19_6')
					return position && position.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В с проклейкой швов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '19_3')
					const position2 = positions.find(pos => pos.fixed_id === '19_5')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Утеплитель Техноблок Стандарт или его аналоги</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '19_9')
					return position && position.value > 0 ? (
						<li key={position.id}>Фанера 20 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '19_10')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Чердачное перекрытие */}
					{sums && 0<sums.sum20_1 && <>
					<div className='font-bold mt-4'>Чердачное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '21_1')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '21_6')
					const position2 = positions.find(pos => pos.fixed_id === '21_7')
					return position && position.value + position2.value > 0 ? (
						<li key={position.id}>Гидро-ветрозащитная паропроницаемая мембрана Изоспан АМ, проклейка швов</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '20_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Утепление перекрытия 200 мм</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '20_5')
					return position && position.value > 0 ? (
						<li key={position.id}>Перекрестное утепление 50 мм</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '20_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Утеплитель Техноблок Стандарт или его аналоги</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '20_4')
					return position && position.value > 0 ? (
						<li key={position.id}>{position.name}</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '21_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В, с проклейкой швов</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '21_10')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Антресольное перекрытие */}
					{sums && 0<sums.sum27_1 && <>
					<div className='font-bold mt-4'>Антресольное перекрытие:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '27_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Обрешетка - доска сухая строганная 90х20 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '27_3')
					return position && position.value > 0 ? (
						<li key={position.id}>Утепление 200 мм</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '27_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Пароизоляционная пленка Изоспан В, проклейка швов</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '27_3')
					return position && position.value > 0 ? (
						<li key={position.id+100}>Утеплитель Техноблок Стандарт или его аналоги</li>
					) : null;
					})()}

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '27_6')
					return position && position.value > 0 ? (
						<li key={position.id}>Фанера 20 мм</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '28_9')
					return position && position.value > 0 ? (
						<li key={position.id}>Метизы, крепежи</li>
					) : null;
					})()}
					</ul>
					</>}

					{/* Инженерные коммуникации */}
					{sums && 0<sums.sum29_1 && <>
					<div className='font-bold mt-4'>Инженерные коммуникации:</div>
					<ul className='list-disc pl-4'>

					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '29_1')
					return position && position.value > 0 ? (
						<li key={position.id}>Установка септика</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '29_2')
					return position && position.value > 0 ? (
						<li key={position.id}>Разводка канализации</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '29_3')
					return position && position.value > 0 ? (
						<li key={position.id}>Разводка воды по дому</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '29_4')
					return position && position.value > 0 ? (
						<li key={position.id}>Разводка отопления по дому</li>
					) : null;
					})()}
					
					{positions && (() => {
					const position = positions.find(pos => pos.fixed_id === '29_5')
					return position && position.value > 0 ? (
						<li key={position.id}>Теплый пол</li>
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
						</ul>
					
						<ul className='list-disc pl-4 w-full'>
						{positions && (() => {
						const position = positions.find(pos => pos.fixed_id === '29_1')
						// console.log(position)
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Септик  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find(pos => pos.fixed_id === '29_2')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Разводка канализации  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find(pos => pos.fixed_id === '29_3')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Разводка воды по дому  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find(pos => pos.fixed_id === '29_4')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Отопление по дому + котельная  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}

						{positions && (() => {
						const position = positions.find(pos => pos.fixed_id === '29_5')
						return position && position.value > 0 ? (
							<li key={position.id+200} className='my-4'>Теплый пол  <span className='ml-auto float-right underline'>Итого по этапу: {position.price * position.value} руб.</span></li>
						) : null;
						})()}
						</ul>
						
						{sums && <><p className='my-4 text-xl font-bold'><span className='ml-auto text-right float-right underline'>Итого: {sums.sum1_7
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
							+ sums.sum29_1} руб.</span></p><br/></>}
						<p className='my-8 text-xl text-center'>Доставка строительных материалов и разгрузка на участке  не включена в стоимость.<br/> Ориентировочная стоимость: 170 000 руб.</p>
					</div>

				</div>

			</div>

		</>
	)

})

export default OrderKp