import React, { useState, useRef, useEffect, useContext, Component } from 'react';
import axios from 'axios';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider, { Range } from 'rc-slider';
import Heatmap from 'heatmap.js';

import '../css/visualize.css';
import 'rc-slider/assets/index.css';

import { commonData } from '../App';

export const SlideRange = ({ min, max, start, end }) => {
    const [range, setRange] = useState([start, end]);

    const handleSliderChange = (newRange) => {
        setRange(newRange);
    };

    const handleStartInputChange = (event) => {
        const newstartValue = parseInt(event.target.value);
        setRange([newstartValue, range[1]]);
    };

    const handleEndInputChange = (event) => {
        const newEndValue = parseInt(event.target.value);
        setRange([range[0], newEndValue]);
    };

    useEffect(() => {
        const sliderHandle = document.querySelector('.custom-slider .rc-slider-handle');
        if (sliderHandle) {

            const minPosition = range[0]
            const maxPosition = range[1]
            sliderHandle.style.left = `${minPosition}%`;
            sliderHandle.style.width = `${maxPosition - minPosition}%`;
        }
    }, [range, min, max]);

    return (
        <div>
            <Row>
                <Col><p className="slider-value1">{min}</p></Col>
                <Col><p className="slider-value2">{max}</p></Col>
                <Slider range
                    min={min}
                    max={max}
                    onChange={handleSliderChange}
                    defaultValue={range}
                    allowCross={false}
                    className="custom-slider"
                />
                <Row>
                    <Col>
                        <div className="input-container">
                            <label htmlFor="minInput">Start Frame :</label>
                            <input
                                type="number"
                                id="numInput"
                                value={range[0]}
                                onChange={handleStartInputChange}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className="input-container">
                            <label htmlFor="maxInput">End Frame :</label>
                            <input
                                type="number"
                                id="numInput"
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

export const SlideSimple = ({ min, max, init }) => {
    const [value, setValue] = useState(init);

    const handleSliderChange = (val) => {
        setValue(val);
    };

    return (
        <div>
            <Row>
                <Col><p className="slider-value1">{min}</p></Col>
                <Col><p className="slider-value2">{max}</p></Col>
                <Slider
                    min={min}
                    max={max}
                    onChange={handleSliderChange}
                    defaultValue={value}
                    allowCross={false}
                    className="custom-slider"
                />
                <p>Frame Range : {min} - {max},  Time Pick : {((value - { min }) / 30).toFixed(2)} sec.</p>
            </Row>
        </div>
    );
};


export const TaskVisualize = ({ from, callback }) => {
    console.log("TaskVisualize  start.. ")
    const { common, changeCommon } = useContext(commonData)
    const [taskid, setTaskid] = useState(common.trackerTaskId);

    const [checked, setChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('0');
    const [loaded, setLoaded] = useState(false);

    const getRange = async () => {
        let response = null;
        try {
            response = await axios.get(process.env.REACT_APP_SERVER_URL + `/control/get_visualinfo/${taskid}`);
        }
        catch (err) {
            console.log(err)
        }

        if (response && response.data.task_array) {
            console.log('gettasks response', response.data.task_array);


        }
    }

    const TaskVisualizeOpions = ({ type }) => {
        if (type === '1') {
            return (
                <>
                    <div className="slider-container">
                        <SlideRange min={1000} max={108000} start={3000} end={7500} />
                    </div>

                </>
            )
        }
        else if (type === '2') {
            return (
                <>
                    <div className="slider-container">
                        <SlideRange min={1000} max={108000} start={3000} end={7500} />
                    </div>

                </>
            )

        }
        else if (type === '3') {
            return (
                <>
                    <div className="slider-container">
                        <SlideRange min={1000} max={108000} start={3000} end={7500} />
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
                            style={{ flex: 1 }}
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
        const generateRandomData = () => {
            const points = [];
            let max = 0;
            const width = 840;
            const height = 400;
            let len = 300;

            while (len--) {
                const val = Math.floor(Math.random() * 100);
                // now also with custom radius
                const radius = Math.floor(Math.random() * 70);

                max = Math.max(max, val);
                const point = {
                    x: Math.floor(Math.random() * width),
                    y: Math.floor(Math.random() * height),
                    value: val,
                    // radius configuration on point basis
                    radius: radius
                };
                points.push(point);
            }

            // heatmap data format
            const data = {
                max: max,
                data: points
            };

            return data;
        };

        const heatmapInstance = Heatmap.create({
            container: document.getElementById('heatmapContainer'),
            radius: 30,
            maxOpacity: 0.7,
            blur: 0.9,
            // gradient: {
            //     '0.4': 'blue',
            //     '0.65': 'lime',
            //     '0.95': 'red'
            // },
            data: generateRandomData()
        });

        const interval = setInterval(() => {
            const data = generateRandomData();
            heatmapInstance.setData(data);
        }, 2000);


        // Cleanup the heatmap instance when the component unmounts
        return () => {
            heatmapInstance.setData({ data: [] }); // Clear heatmap data
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <div>
                <TaskVisualizePrepare />
            </div>
            <div className="modebtn-wrapper" hidden={radioValue === '0'}>
                <TaskVisualizeOpions type={radioValue} />
            </div>
            <div id="heatmapContainer" style={{ width: '100%', height: '400px', margin: '20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                hidden={loaded === false}>
            </div>
        </>
    );
};

