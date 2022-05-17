import React, { FC } from 'react';

import { Site } from '@pages/Sites/services/services.interfaces';

interface TopologySiteDetailsProps {
    site?: Site;
}

const TopologySiteDetails: FC<TopologySiteDetailsProps> = function ({ site }) {
    const node = site;

    return (
        <>
            <div>{node?.siteName}</div>
            <div>
                <b>protocol: </b>
                tcp
            </div>
            <div>
                <b>bytes sent:</b>
                <p>230 MB total</p>
                <p>81 MB public1</p>
                <p>17 MB public2</p>
            </div>
            <div>
                <b>bytes received:</b>
                <p>4 MB total</p>
                <p>2 MB public1</p>
                <p>2 MB public2</p>
            </div>
        </>
    );
};

export default TopologySiteDetails;
