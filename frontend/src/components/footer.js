import React from 'react';
import { FaHeart } from 'react-icons/fa';

function Footer() {
	return (
		<footer>
			<small>
				&copy; {new Date().getFullYear()} made {' '}
				<FaHeart style={{ color: 'red' }} /> by -{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="/"
				>
					KELLY GRACE
				</a>
			</small> 4DReplay
		</footer>
	);
}

export default Footer;
