import { TablePagination } from '@mui/material';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import styled from 'styled-components';

const Styles = styled.div`
  .navbar { background-color: #000000; }
  a, .navbar-nav, .navbar-light .nav-link {
    color: #000000;
    &:hover { color: white; }
  }
  .navbar-brand {
    font-size: 1.4em;
    color: #FFFFFF;
    &:hover { color: white; }
  }
`;

const Topnavbar = () => (
	<>

		<Styles>
			<Navbar expand="lg">
				<Navbar.Brand href="/">
					<img
						src="https://4dreplay.com/4d/wp-content/uploads/2021/10/logo_white-2.png"
						alt="Logo"
						style={{ height: '70%', width: '240px', cursor: 'pointer', marginLeft: '25px', padding: '10px' }}
					/></Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
			</Navbar>
		</Styles>
	</>
)

export default Topnavbar;