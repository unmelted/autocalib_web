import React, { useState, useEffect } from 'react';
import axios from "axios";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import Modal from 'react-bootstrap/Modal';
import '../css/task_library.css';

export const ReviewGallery = ({ taskId, requestId, jobId }) => {
    const [show, setShow] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [images, setImages] = React.useState(null);

    let shouldCancel = false;

    const ModalWindow = () => {
        const call = async () => {
            const response = await axios.get(
                "https://google-photos-album-demo2.glitch.me/4eXXxxG3rYwQVf948"
            );
            if (!shouldCancel && response.data && response.data.length > 0) {
                setImages(
                    response.data.map(url => ({
                        original: `${url}=w960`,
                        thumbnail: `${url}=w100`
                    }))
                );
                // alert('modal call.. ', images)
                setLoaded(true)
                setShow(true)
            }
        };


        if (loaded === false) {
            call();
        }
        return (
            <>
                <Modal show={show}
                    onHide={() => setShow(false)}
                    id='modal-dialog'
                    size='xl'>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Custom Modal Styling
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ImageGallery items={images} showThumbnails={false} showIndex={true} slideDuration={50} slideInterval={500} />
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    return <ModalWindow></ModalWindow>
};

export default ReviewGallery;