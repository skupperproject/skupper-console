import React from 'react';

import { Brand, PageHeader, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import Logo from '@assets/skupper.svg';

const SKUPPER_TEXT_LOGO = 'Skupper';

const styles = {
    logoImg: {
        height: '2.6em',
        width: '2.6em',
    },
};

const Header = function () {
    return (
        <PageHeader
            className="sk-header"
            logo={
                <>
                    <Brand src={Logo} alt="skupper logo" className={css(styles.logoImg)} />
                    <TextContent>
                        <Text
                            component={TextVariants.h4}
                            className="pf-u-pl-md pf-u-font-weight-bold"
                        >
                            {SKUPPER_TEXT_LOGO}
                        </Text>
                    </TextContent>
                </>
            }
            showNavToggle
        />
    );
};

export default Header;
