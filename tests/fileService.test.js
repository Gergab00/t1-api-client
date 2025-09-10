/**
 * @file tests/fileService.test.js
 * @description Pruebas unitarias para fileService (multipart y endpoint).
 */

const nock = require('nock');
const config = require('../src/config');
jest.mock('../src/utils/tokenManager', () => ({
  ensureValidAccessToken: jest.fn().mockResolvedValue('test-token'),
}));
jest.mock('../src/constants/const', () => ({
  FILE_UPLOAD_ENDPOINT: (bucket) => `/file/v1.1/${bucket}`,
}));
const { uploadFile } = require('../src/services/fileService');

describe('fileService', () => {
  afterEach(() => nock.cleanAll());

  it('sube archivo a bucket con multipart/form-data', async () => {
    const bucket = 'imagenes';
    const buf = Buffer.from('hello');
    const resp = { url: 'http://cdn/file.jpg' };
    nock(config.baseURL).post(`/file/v1.1/${bucket}`).reply(200, resp);
    const data = await uploadFile(bucket, buf, 'foto.jpg', 'image/jpeg');
    expect(data).toEqual(resp);
  });
});
