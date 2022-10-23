import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";

export const ReviewGallery = () => {
    const [images, setImages] = React.useState(null);

    React.useEffect(() => {
        let shouldCancel = false;

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
            }
        };
        call();
        return () => (shouldCancel = true);
    }, []);

    return images ? <ImageGallery items={images} showThumbnails={false} slideDuration={50} slideInterval={500} showIndex={true} /> : null;
};

export default ReviewGallery;