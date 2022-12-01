
import React, { useState, useRef, useEffect, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import '../css/config.css';

import { configData } from '../App.js'

function Config() {
	const { configure, changeConfigure } = useContext(configData)
	const [scale, setScale] = useState(configure.scale)
	const [pair, setPair] = useState(configure.pair)
	const [prep, setPrep] = useState(configure.preprocess)

	const handleChange_scale = e => {
		console.log('scale handleChange is called ', e.target)
		setScale(e.target.id)
		changeConfigure({ scale: e.target.id })
	}

	const handleChange_pair = e => {
		setPair(e.target.id)
		changeConfigure({ pair: e.target.id })
	}
	const handleChange_prep = e => {
		setPrep(e.target.id)
		changeConfigure({ preprocess: e.target.id })
	}

	return (
		<>
			<div className='config-div'>
				<Table id='config-body' striped bordered variant="dark">
					<thead>
						<tr>
							<th className='th-item'>Item</th>
							<th className='th-option'>Option</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='th-item'>
								Reconstruction Scale
							</td>
							<td className='th-option'>
								<Form.Check
									inline
									label="Full Scale"
									type={'radio'}
									id={`full`}
									onChange={handleChange_scale}
									checked={scale === 'full'}
								/>{' '}
								<Form.Check
									inline
									label="Half Scale"
									type={'radio'}
									id={`half`}
									onChange={handleChange_scale}
									checked={scale === 'half'}
								/>
							</td>
						</tr>
						<tr>
							<td className='th-item'>
								Base Pair
							</td>
							<td className='th-option'>
								<Form.Check
									inline
									label="Initial Candidate"
									type={'radio'}
									id={`colmap`}
									onChange={handleChange_pair}
									checked={pair === 'colmap'}
								/>{' '}
								<Form.Check
									inline
									label="Isometric"
									type={'radio'}
									id={`isometric`}
									onChange={handleChange_pair}
									checked={pair === 'isometric'}
								/>
							</td>
						</tr>
						<tr>
							<td className='th-item'>
								Image Preprocess
							</td>
							<td className='th-option'>
								<Form.Check
									inline
									label="On"
									type={'radio'}
									id={`On`}
									onChange={handleChange_prep}
									checked={prep === 'On'}
								/>{' '}
								<Form.Check
									inline
									label="Off"
									type={'radio'}
									id={`Off`}
									onChange={handleChange_prep}
									checked={prep === 'Off'}
								/>
							</td>
						</tr>

					</tbody>
				</Table>
			</div>
		</>
	)
};

export default Config;