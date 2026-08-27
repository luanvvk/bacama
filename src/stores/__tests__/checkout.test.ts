import { act } from '@testing-library/react';

import { useCheckoutStore } from '../checkout';

const SHIPPING = {
  fullName: 'Lê Thị Ngọc',
  phone: '0905 123 456',
  email: 'ngoc@example.com',
  address: '27 Ngô Quyền, Hải Châu, Đà Nẵng',
  province: 'Đà Nẵng',
  deliveryOption: 'ghn',
};

const PLACE_ORDER_INPUT = {
  items: [{ id: 'dalat-washed-250-g-phin', name: 'Đà Lạt Washed', priceVnd: 280000, quantity: 1 }],
  subtotalVnd: 280000,
  totalVnd: 280000,
  paymentMethod: 'zalopay' as const,
  shipping: SHIPPING,
};

afterEach(() => {
  useCheckoutStore.setState({ order: null });
});

describe('useCheckoutStore', () => {
  it('has no order until one is placed', () => {
    expect(useCheckoutStore.getState().order).toBeNull();
  });

  it('places an order with a generated order ref', () => {
    act(() => useCheckoutStore.getState().placeOrder(PLACE_ORDER_INPUT));

    const { order } = useCheckoutStore.getState();
    expect(order).toMatchObject(PLACE_ORDER_INPUT);
    expect(order?.orderRef).toMatch(/^BCM-\d{4}$/);
  });

  it('clears the order', () => {
    act(() => {
      useCheckoutStore.getState().placeOrder(PLACE_ORDER_INPUT);
      useCheckoutStore.getState().clear();
    });

    expect(useCheckoutStore.getState().order).toBeNull();
  });
});
