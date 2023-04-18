import React, { useState, useContext } from 'react';
import axios from "axios";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import Modal from 'react-bootstrap/Modal';
import '../css/task_library.css';
import { configData } from '../App.js';


export const ReviewGallery = ({ taskId, requestId, changeHandle }) => {
    const { configure, changeConfigure } = useContext(configData)
    const [show, setShow] = useState(true)
    // setShow(true)
    const [firstcall, setFirstcall] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [images, setImages] = React.useState(null);
    let imagelist = []
    console.log("usecontext: ", configure)

    const call = async () => {
        let response = null

        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/getreview/${requestId}/${configure.labatory}`)
            console.log('finish await')

        } catch (err) {
            console.log(err)
            return;
        }

        if (response && response.data.status === 0) {
            for (const item of response.data.images) {
                const desc = item.split('/')[1].split('_')[0]
                let realfile = process.env.REACT_APP_SERVER_REVIEW_URL + item
                if (response.data.labatory === 'true') {
                    realfile = process.env.REACT_APP_SERVER_ANALYSIS_URL + item
                }
                imagelist.push({ original: realfile, originalTitle: desc, description: desc })

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
                    <ImageGallery items={images} showThumbnails={false} slideDuration={0} showIndex={true} slideInterval={350} disableSwipe={true} originalHeight={720} originalWidth={1280} />
                </Modal.Body>
            </Modal>
        </div>
    )
};

export default ReviewGallery;