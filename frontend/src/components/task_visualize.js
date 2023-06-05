import React, { useState, useRef, useEffect, useContext, Component } from 'react';
// import { ResponsiveBar } from '@nivo/bar';
// import { ResponsiveHeatMap, ResponsiveHeatMapCanvas } from '@nivo/heatmap';
import Heatmap from 'heatmap.js';

export const TaskVisualize = () => {

    console.log("heatmap example start.. ")

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
        <div id="heatmapContainer" style={{ width: '100%', height: '400px', margin: '20px auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

        </div>
    );
};
