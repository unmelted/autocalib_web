
import axios from 'axios';

export const getTotalFileSize = (files) => {
    let size = 0;
    for (const file of files) {
        size += file.size;
    }

    return size;
}

export const getFileExt = (file) => {
    let ext = file.name.split('.');
    return (ext.length > 1 ? ext[1].toLowerCase() : '');
}

export const isValidImage = (file) => {
    const ext = getFileExt(file);

    return (file.type === "image/png" || file.type === "image/jpeg") && (ext === "png" || ext === "jpg" || ext === "jpeg");
}

export const isValidFile = (file) => {
    // const mimeType = file.type;
    const ext = getFileExt(file);

    return isValidImage(file) || ext === "pts" || ext === "txt" || ext === 'ds_store';
}
export const getGroupInfo = async function (taskId) {
    console.log("getGroup .. " + taskId)
    let response = null;
    try {
        response = await axios.get(process.env.REACT_APP_SERVER_URL + `/api/groupinfo/${taskId}`)
    } catch (err) {
        console.log("get groupinfo error")
    }

    if (response && response.data) {
        console.log("get group info ", response.data.group)
        return response.data.group;
    }
    return 0;
};
