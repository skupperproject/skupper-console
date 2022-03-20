import React from 'react';

import { render, RenderResult } from '@testing-library/react';

import Loading from '..';
import { TEXT_CONTENT } from '../Loading.constant';

describe('Loading tests suite', () => {
  let documentBody: RenderResult;

  beforeEach(() => {
    documentBody = render(<Loading />);
  });
  it(`Should find the text ${TEXT_CONTENT} in the component`, () => {
    expect(documentBody.getByText(TEXT_CONTENT)).toBeInTheDocument();
  });
});
