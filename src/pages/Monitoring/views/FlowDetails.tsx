import React from 'react';

import FlowInfo from '../components/FlowInfo';
import FlowTopology from '../components/FlowTopology';

const FlowDetails = function () {
    return (
        <>
            <FlowInfo />
            <div style={{ width: '100%', height: '700px' }}>
                <FlowTopology />
            </div>
        </>
    );
};

export default FlowDetails;
