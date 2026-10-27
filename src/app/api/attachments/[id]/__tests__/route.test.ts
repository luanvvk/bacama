/** @jest-environment node */
import { NextRequest } from 'next/server';

import { GET } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { getAttachmentDownload } from '@/services/courses/get-attachment-download';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/services/courses/get-attachment-download', () => ({
  getAttachmentDownload: jest.fn(),
}));

const getCurrentUser = jest.fn();
const download = jest.mocked(getAttachmentDownload);

const get = () =>
  GET(new NextRequest('http://localhost/api/attachments/a1'), {
    params: Promise.resolve({ id: 'a1' }),
  });

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
});

afterEach(() => jest.resetAllMocks());

describe('GET /api/attachments/[id]', () => {
  it('redirects an enrolled user to the file', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    download.mockResolvedValue({ status: 'ok', url: 'https://files.example/a.pdf' });

    const response = await get();

    expect(download).toHaveBeenCalledWith('a1', 'user-1');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://files.example/a.pdf');
  });

  it('passes a null user for guests and returns 401 when sign-in is needed', async () => {
    getCurrentUser.mockResolvedValue(null);
    download.mockResolvedValue({ status: 'unauthenticated' });

    const response = await get();

    expect(download).toHaveBeenCalledWith('a1', null);
    expect(response.status).toBe(401);
  });

  it('returns 403 for a non-enrolled user', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-2' });
    download.mockResolvedValue({ status: 'forbidden' });

    expect((await get()).status).toBe(403);
  });

  it('returns 404 for an unknown attachment or a non-http url', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
    download.mockResolvedValueOnce({ status: 'not_found' });
    download.mockResolvedValueOnce({ status: 'ok', url: 'javascript:alert(1)' });

    expect((await get()).status).toBe(404);
    expect((await get()).status).toBe(404);
  });
});
