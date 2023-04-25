
import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';

import '../css/config.css';


function Home() {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);


	return (
		<div className="page-container">
			<hr />
			<p></p>
			<Table striped bordered variant="dark">
				<thead>
					<tr>
						<th>KST (UTC+9)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className='clock'>
							{currentTime.toLocaleTimeString()}
						</td>
					</tr>


				</tbody>
			</Table>

		</div>
	)
};

export default Home;