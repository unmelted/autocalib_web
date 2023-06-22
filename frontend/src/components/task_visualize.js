import React, { useState, useRef, useEffect, useContext, Component } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider, { Range } from 'rc-slider';
import Heatmap from 'heatmap.js';

import '../css/visualize.css';
import 'rc-slider/assets/index.css';

import { commonData } from '../App';

export const SlideRange = ({ min, max, start, end, range, onChange, start_time, end_time }) => {
    // const [range, setRange] = useState([start, end])
    // const [range, setRange] = useState(() => {
    //     const storedRange = JSON.parse(localStorage.getItem('slideRange'));
    //     if (storedRange && Array.isArray(storedRange) && storedRange.length === 2) {
    //         return storedRange;
    //     }
    //     return [start, end];
    // });
    console.log("slide range start..", range)

    const handleSliderChange = (newRange) => {
        // setRange(newRange);
        onChange(newRange)
    };

    const handleStartInputChange = (event) => {
        const newstartValue = parseInt(event.target.value);
        // setRange([newstartValue, range[1]]);
        onChange([newstartValue, range[1]])
    };

    const handleEndInputChange = (event) => {
        const newEndValue = parseInt(event.target.value);
        // setRange([range[0], newEndValue]);
        onChange([range[0], newEndValue])
    };

    // useEffect(() => {

    // }, [range]);

    return (
        <div>
            <Row>
                <Col><p className="slider-value1">Start Frame : {min} ({start_time})</p></Col>
                <Col><p className="slider-value2">End Frame : {max} ({end_time})</p></Col>
                <Slider range
                    min={min}
                    max={max}
                    onChange={handleSliderChange}
                    defaultValue={range}
                    allowCross={false}
                    value={range}
                    className="custom-slider"
                />
                <Row>
                    <Col>
                        <div className="input-container">
                            <label htmlFor="minInput">Start(Frame) :</label>
                            <input
                                type="number"
                                id="numInput1"
                                value={range[0]}
                                onChange={handleStartInputChange}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className="input-container">
                            <label htmlFor="maxInput">End(Frame) :</label>
                            <input
                                type="number"
                                id="numInput2"
                                value={range[1]}
                                onChange={handleEndInputChange}
                            />
                        </div>
                    </Col>
                </Row>
                <p>Frame Range : {range[0]} - {range[1]},  Time Range : {((range[1] - range[0]) / 30).toFixed(2)} sec.</p>
            </Row>
        </div>
    );
};

export const SlideSimple = ({ min, max, init, onChange, start_time, end_time }) => {
    const [value, setValue] = useState(init);

    const handleSliderChange = (val) => {
        setValue(val);
        onChange(val)
    };

    const handleStartInputChange = (event) => {
        const newValue = parseInt(event.target.value);
        setValue(newValue)
        onChange(newValue)
    };

    return (
        <div>
            <Row>
                <Col><p className="slider-value1">Start Frame : {min} ({start_time})</p></Col>
                <Col><p className="slider-value2">End Frame : {max} ({end_time})</p></Col>
                <Slider
                    min={min}
                    max={max}
                    onChange={handleSliderChange}
                    defaultValue={value}
                    allowCross={false}
                    value={value}
                    className="custom-slider"
                />
                <Row>
                    <Col>
                        <div className="input-container2">
                            <label htmlFor="minInput">Start Frame :</label>
                            <input
                                type="number"
                                id="numInput1"
                                value={value}
                                onChange={handleStartInputChange}
                            />
                        </div>
                    </Col>
                </Row>
                <p>Frame Pick : {value},  Time Pick : {(value / 30).toFixed(2)} sec.</p>
            </Row>
        </div>
    );
};

const HeatmapDraw = ({ data }) => {
    const heatmapRef = useRef(null);
    const width = 960;
    const height = 640;

    useEffect(() => {
        if (data.length === 0) return;

        const heatmapInstance = Heatmap.create({
            container: heatmapRef.current,
            radius: 30,
            maxOpacity: 0.8,
            minOpacity: 0,
            blur: 0.7
        });

        heatmapInstance.setData({
            max: Math.max(...data.map(point => point.value)),
            data: data.map(point => ({
                x: point.x * (width / 50),
                y: point.y * (height / 28),
                value: point.value,
            })),
        });

        return () => {
            heatmapInstance.setData({ data: [] });
        };
    }, [data]);

    return (

        <div
            style={{
                width: '100%',
                height: '640px',
                position: 'relative',
            }}
        >

            < div ref={heatmapRef}
                style={{
                    width: { width }, height: { height },
                }} />
            <div id='div-heatmap'
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
        </div >
    )
}

export const TaskVisualize = ({ from, callback }) => {
    const { common, changeCommon } = useContext(commonData)
    const [taskid, setTaskid] = useState(common.trackerTaskId);
    const [kairosId, setKairosId] = useState(common.trackerKairosId);
    console.log("TaskVisualize  start.. ", taskid, kairosId)

    const [checked, setChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('0');
    const [loaded, setLoaded] = useState(false);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [points, setPoints] = useState([{ x: 10, y: 15, value: 0 }, { x: 20, y: 25, value: 0 }]);
    const [visualStart, setVisualStart] = useState(false);
    const [range, setRange] = useState([0, 0])
    // let range = []
    let targetFrame = 0;

    const getRange = async () => {
        let response = null;
        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_visualinfo/${kairosId}`);
        }
        catch (err) {
            console.log(err)
        }

        if (response && response.data) {
            console.log('get Ragne response', response.data.start_frame, response.data.end_frame, response.data.start_time, response.data.end_time);
            setMin(response.data.start_frame)
            setMax(response.data.end_frame)
            setStart(response.data.start_time)
            setEnd(response.data.end_time)
            setRange([response.data.start_frame, response.data.end_frame])
            setLoaded(true)
        }
    }

    const onRangeChange = (newRange) => {
        console.log("onRange is called .. ", newRange)
        setRange(newRange);
    }
    const onTargetFrameChange = (newTargetFrame) => {
        console.log("onTargetFrameChange is called .. ", newTargetFrame)
        targetFrame = newTargetFrame
    }

    const handleApplyVisualize = async () => {
        console.log("handleApplyVisualize start.. ", radioValue)
        let arr = []
        if (radioValue === '1') {
            console.log("range : ", range)
            let response = null;
            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_visualdata/${kairosId}/${radioValue}/${range[0]}/${range[1]}`);
            }
            catch (err) {
                console.log(err)
            }

            if (response && response.data) {
                console.log("response.data : ", response.data)
                arr = response.data.data;
                const points = [];

                for (let y = 0; y < arr.length; y++) {
                    const row = arr[y];
                    for (let x = 0; x < row.length; x++) {
                        const value = row[x];
                        if (value !== 0) {
                            points.push({ x, y, value });
                        }
                    }
                }
                console.log("points : ", points)
                setPoints(points)
                setVisualStart(true)
            }
        }
        else {
            console.log("target frame : ", targetFrame)
            let response = null;
            try {
                response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_visualdata/${kairosId}/${radioValue}/${targetFrame}`);
            }
            catch (err) {
                console.log(err)
            }

            if (response && response.data) {

            }
        }

    }

    if (loaded === false) {
        getRange()
    }

    const TaskVisualizeOpions = ({ type }) => {
        console.log("TaskVisualizeOpions  start.. ", type, range)

        if (type === '1') {
            return (
                <>
                    <div className="slider-container">
                        <SlideRange
                            min={min} max={max}
                            start={min + ((max - min) / 4)} end={min + ((max - min) * 3 / 4)}
                            range={range}
                            onChange={onRangeChange} start_time={start} end_time={end} />
                    </div>
                </>
            )
        }
        else if (type === '2') {
            return (
                <>
                    <div className="slider-container">
                        <SlideSimple min={min} max={max} init={(min + max) / 2} onChange={onTargetFrameChange} start_time={start} end_time={end} />
                    </div>
                </>
            )
        }
        else if (type === '3') {
            return (
                <>
                    <div className="slider-container">
                        <SlideSimple min={min} max={max} init={(min + max) / 2} onChange={onTargetFrameChange} start_time={start} end_time={end} />
                    </div>
                </>
            )
        }
        else {
            return (
                <>
                </>
            )
        }
    }

    const TaskVisualizePrepare = ({ tr_taskid, kairos_taskid }) => {

        const vis_mode = [
            { name: 'Heatmap', value: '1' },
            { name: '3D Position in Ground', value: '2' },
            { name: 'Raw-Multichannel', value: '3' },
        ];

        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <ButtonGroup>
                    {vis_mode.map((radio, idx) => (
                        <ToggleButton
                            key={idx}
                            id={`radio-${idx}`}
                            type="radio"
                            variant="primary"
                            name="radio"
                            value={radio.value}
                            checked={radioValue === radio.value}
                            onChange={(e) => setRadioValue(e.currentTarget.value)}
                            style={{ flex: 1, paddingLeft: '36px', paddingRight: '36px' }}
                            className="text-nowrap"
                        >
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>

            </div>
        )
    }

    useEffect(() => {

    }, [radioValue, loaded])


    return (
        <>
            <div>
                <TaskVisualizePrepare />
            </div>
            <div className="modebtn-wrapper" hidden={radioValue === '0' || loaded === false}>
                <TaskVisualizeOpions type={radioValue} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button id='applyBtn'
                    onClick={handleApplyVisualize}
                    hidden={radioValue === '0'} // || loaded === false}
                >Apply</Button>
            </div>
            {/* <div id="heatmapContainer" style={{ width: '100%', height: '400px', margin: '20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
            </div> */}
            <div className="heatmap-wrapper" hidden={visualStart === false}>
                <HeatmapDraw data={points} />
            </div>
        </>
    );
};

