import React, { useState, useEffect } from 'react';
import axios from "axios";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import Modal from 'react-bootstrap/Modal';
import '../css/task_library.css';

export const ReviewGallery = ({ taskId, requestId, changeHandle }) => {
    const [show, setShow] = useState(true)
    // setShow(true)
    const [firstcall, setFirstcall] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [images, setImages] = React.useState(null);
    let imagelist = []
    let shouldCancel = false

    const call = async () => {
        let response = null

        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getreview/${requestId}`)
            console.log('finish await')

        } catch (err) {
            console.log(err)
            return;
        }

        if (response && response.data.status === 0) {
            for (const item of response.data.images) {
                const realfile = process.env.REACT_APP_SERVER_REVIEW_URL + item
                imagelist.push({ original: realfile, })

            }
            setImages(imagelist)
            setLoaded(true)
        }
    };

    if (firstcall === false) {
        if (loaded === false) {
            call();
        }
        setFirstcall(true)

        // for (const one of images) {
        //     console.log('list check ..', one)
        // }

    }

    return (
        <div>
            <Modal show={loaded}
                onHide={() => {
                    setShow(false)
                    setLoaded(false)
                    changeHandle('modalclose', [])
                }}
                size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {taskId} Generated Output ..
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ImageGallery items={images} showThumbnails={false} showIndex={true} slideDuration={50} slideInterval={1000} originalHeight={720} originalWidth={1280} />
                </Modal.Body>
            </Modal>
        </div>
    )
};

export default ReviewGallery;