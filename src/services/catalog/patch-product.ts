import type { UpdateProductInput } from './update-product';

export const patchProduct = async (id: string, changes: UpdateProductInput) => {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });

  return response.ok;
};
