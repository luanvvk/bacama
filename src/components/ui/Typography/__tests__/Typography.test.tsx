import { render, screen } from '@testing-library/react';

import { Heading, Text } from '../index';

describe('Heading', () => {
  it('renders the given heading level', () => {
    render(<Heading as="h1">Bakery</Heading>);

    expect(screen.getByRole('heading', { level: 1, name: 'Bakery' })).toBeInTheDocument();
  });

  it('defaults to an h2', () => {
    render(<Heading>Bakery</Heading>);

    expect(screen.getByRole('heading', { level: 2, name: 'Bakery' })).toBeInTheDocument();
  });
});

describe('Text', () => {
  it('renders as a paragraph by default', () => {
    render(<Text>Freshly baked daily.</Text>);

    const node = screen.getByText('Freshly baked daily.');
    expect(node.tagName).toBe('P');
  });

  it('renders as the given element', () => {
    render(<Text as="span">Freshly baked daily.</Text>);

    const node = screen.getByText('Freshly baked daily.');
    expect(node.tagName).toBe('SPAN');
  });
});
