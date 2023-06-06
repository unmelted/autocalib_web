import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const PopupMessage = ({ show, handleClose, title, content }) => {
    console.log("popup message is called", show)
    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="bg-dark" closeButton>
                    <Modal.Title> {title} </Modal.Title>
                </Modal.Header>

                <Modal.Body className="bg-secondary">
                    {content}
                </Modal.Body>

                <Modal.Footer className="bg-dark">
                    <Button variant="light" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PopupMessage;