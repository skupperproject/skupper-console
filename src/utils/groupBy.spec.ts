import { groupBy } from './groupBy';

describe('groupBy groupBy', () => {
  it('Should group an array in a grouped key-value object based on the input grouper function', () => {
    const mockText = [
      {
        title: 'title 1',
        description: 'description 1',
        items: {
          first: 'item 1',
          second: 'item 2',
        },
      },
      {
        title: 'title 2',
        description: 'description 2',
        items: {
          first: 'item 3',
          second: 'item 4',
        },
      },
    ];

    const mockTextExpected = {
      'description 1': [mockText[0]],
      'description 2': [mockText[1]],
    };

    expect(groupBy(mockText, (item: Record<string, any>) => item.description)).toStrictEqual(
      mockTextExpected,
    );
  });
});
