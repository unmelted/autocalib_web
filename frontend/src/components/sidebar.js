import React, { useState, useEffect } from "react";
import { Link, Outlet } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, SidebarFooter, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

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

	function changeBackground(e) {
		e.target.style.background = 'red';
		// e.target.background = "red";
	}
	function revertBackground(e) {
		e.target.style.background = "rgb(0, 0, 0, 1)";
		e.target.background = "rgb(0, 0, 0, 0)";

	}

	return (
		<>
			<Sidebar
				breakPoint="md"
				transitionDuration={800}
				backgroundColor="rgb(0, 0, 0, 1)"
				rtl={false}
				style={{ height: "80vh" }}
				defaultCollapsed
			>
				<Menu
					menuItemStyles={{
						button: ({ level, active }) => {
							// only apply styles on first level elements of the tree
							if (level === 0)
								return {
									// color: disabled ? '#f5d9ff' : '#d359ff',
									backgroundColor: active ? '#000000' : '#000000',
									background: active ? '#000000' : '#000000',
								};
						},
					}}
				>
					<MenuItem icon={<img src={(toggled == true) ? 'https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png' : '/asset/4d.png'} width={(toggled == true) ? '320px' : '40px'} onMouseLeave={revertBackground} />}
						onClick={() => {
							toggle();
						}}
						onMouseOver={changeBackground}
						onMouseLeave={revertBackground}
						style={{ alignItems: "left" }}>
					</MenuItem>
					<MenuItem icon={<HomeOutlinedIcon onMouseLeave={revertBackground} />}
						component={<Link to="/" />}
						onMouseOver={changeBackground}
						onMouseLeave={revertBackground}
					>HOME</MenuItem>
					<MenuItem icon={<img src='/asset/chess-board_w.png' width="20px" onMouseLeave={revertBackground} />}
						component={<Link to="/exodus" />}
						onMouseOver={changeBackground}
						onMouseLeave={revertBackground}> CALIBRATION</MenuItem>
					<MenuItem icon={<img src='/asset/chart-network_w.png' width="20px" onMouseLeave={revertBackground} />}
						component={<Link to="/kairos" />}
						onMouseOver={changeBackground}
						onMouseLeave={revertBackground}> MULTI-TRACKER </MenuItem>
					<MenuItem icon={<img src='/asset/help.png' width="20px" onMouseLeave={revertBackground} />}
						onMouseOver={changeBackground}
						onMouseLeave={revertBackground}>HELP </MenuItem>
				</Menu>
			</Sidebar>
		</>
	);
}

export default Sidenavbar;