import React from "react";
import { Link } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import '../css/sidebar.css';

function Sidenavbar() {
	const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } =
		useProSidebar();

	const toggle = () => {
		toggleSidebar();
		if (toggled) {
			console.log(true);
			collapseSidebar();
		} else {
			console.log(false);
			collapseSidebar();
		}
	};

	return (
		<div strype={{ height: '100%' }}>
			<Sidebar
				transitionDuration={800}
				width='300px'
				backgroundColor="rgb(30, 30, 30, 1)"
				rtl={false}
				style={{ height: "60vh" }}
				defaultCollapsed
			>
				<Menu
					menuItemStyles={{
						button: ({ level }) => {
							if (level === 0) {
								return {

									backgroundColor: "rgb(30, 30, 30, 1)",
									"&:hover": {
										backgroundColor: "red",
									},
									alignItems: 'left'
								}
							}
						}
					}}>
					<MenuItem active='true' onClick={() => {
						toggle();
					}}> {' '}</MenuItem>
					<MenuItem icon={<img src={(toggled === true) ? '' : '/asset/4d.png'} width={(toggled === true) ? '0px' : '40px'} />}
						onClick={() => {
							toggle();
						}} >
						{<img src='https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png' width="200px" />}
					</MenuItem>
					<MenuItem icon={<HomeOutlinedIcon />} component={<Link to="/" />}> HOME</MenuItem>
					<MenuItem icon={<img src='/asset/chess-board_w.png' width="20px" />} component={<Link to="/exodus" />}>
						CALIBRATION</MenuItem>
					<MenuItem icon={<img src='/asset/chart-network_w.png' width="20px" />}
						component={<Link to="/kairos" />}> MULTI-TRACKER </MenuItem>
					<MenuItem icon={<img src='/asset/help.png' width="20px" />}>HELP </MenuItem>
				</Menu>
			</Sidebar>
		</div >
	);
}

export default Sidenavbar;