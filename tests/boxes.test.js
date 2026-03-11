const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Reset in-memory store before each test to ensure isolation
beforeEach(() => {
  db.boxes.clear();
});

// ─── POST /api/boxes ──────────────────────────────────────────────────────────

describe('POST /api/boxes', () => {
  const validPayload = { width: 10.5, height: 5.0, depth: 8.0, colour: 'red' };

  it('creates a box and returns 201 with all fields', async () => {
    const res = await request(app).post('/api/boxes').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      width: 10.5,
      height: 5.0,
      depth: 8.0,
      colour: 'red',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it('returns 400 when width is missing', async () => {
    const { width, ...payload } = validPayload;
    const res = await request(app).post('/api/boxes').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'width' }),
      ])
    );
  });

  it('returns 400 when height is missing', async () => {
    const { height, ...payload } = validPayload;
    const res = await request(app).post('/api/boxes').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'height' })])
    );
  });

  it('returns 400 when depth is missing', async () => {
    const { depth, ...payload } = validPayload;
    const res = await request(app).post('/api/boxes').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'depth' })])
    );
  });

  it('returns 400 when colour is missing', async () => {
    const { colour, ...payload } = validPayload;
    const res = await request(app).post('/api/boxes').send(payload);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'colour' })])
    );
  });

  it('returns 400 when width is zero', async () => {
    const res = await request(app).post('/api/boxes').send({ ...validPayload, width: 0 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'width' })])
    );
  });

  it('returns 400 when height is negative', async () => {
    const res = await request(app).post('/api/boxes').send({ ...validPayload, height: -1 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'height' })])
    );
  });

  it('returns 400 when depth is non-numeric string', async () => {
    const res = await request(app).post('/api/boxes').send({ ...validPayload, depth: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'depth' })])
    );
  });

  it('returns 400 when colour is an empty string', async () => {
    const res = await request(app).post('/api/boxes').send({ ...validPayload, colour: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'colour' })])
    );
  });
});

// ─── GET /api/boxes ───────────────────────────────────────────────────────────

describe('GET /api/boxes', () => {
  it('returns 200 with an empty array when no boxes exist', async () => {
    const res = await request(app).get('/api/boxes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 200 with all stored boxes', async () => {
    await request(app).post('/api/boxes').send({ width: 1, height: 2, depth: 3, colour: 'blue' });
    await request(app).post('/api/boxes').send({ width: 4, height: 5, depth: 6, colour: 'green' });

    const res = await request(app).get('/api/boxes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// ─── GET /api/boxes/:id ───────────────────────────────────────────────────────

describe('GET /api/boxes/:id', () => {
  it('returns 200 with the correct box', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 10, height: 20, depth: 30, colour: 'white' });

    const res = await request(app).get(`/api/boxes/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.body.id, colour: 'white' });
  });

  it('returns all expected fields', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 5, height: 5, depth: 5, colour: 'black' });

    const res = await request(app).get(`/api/boxes/${created.body.id}`);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('width');
    expect(res.body).toHaveProperty('height');
    expect(res.body).toHaveProperty('depth');
    expect(res.body).toHaveProperty('colour');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('returns 404 when the box does not exist', async () => {
    const res = await request(app).get('/api/boxes/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Box not found');
  });
});

// ─── PUT /api/boxes/:id ───────────────────────────────────────────────────────

describe('PUT /api/boxes/:id', () => {
  it('returns 200 with updated fields', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 10, height: 10, depth: 10, colour: 'red' });

    const res = await request(app)
      .put(`/api/boxes/${created.body.id}`)
      .send({ colour: 'blue' });

    expect(res.status).toBe(200);
    expect(res.body.colour).toBe('blue');
    expect(res.body.width).toBe(10);
  });

  it('updates the updatedAt timestamp', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 1, height: 1, depth: 1, colour: 'red' });

    // Small delay to ensure timestamp differs
    await new Promise((r) => setTimeout(r, 10));

    const res = await request(app)
      .put(`/api/boxes/${created.body.id}`)
      .send({ width: 99 });

    expect(res.body.updatedAt).not.toBe(created.body.updatedAt);
  });

  it('can update all fields at once', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 1, height: 1, depth: 1, colour: 'red' });

    const res = await request(app)
      .put(`/api/boxes/${created.body.id}`)
      .send({ width: 12, height: 6, depth: 9, colour: 'blue' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ width: 12, height: 6, depth: 9, colour: 'blue' });
  });

  it('returns 404 when box does not exist', async () => {
    const res = await request(app)
      .put('/api/boxes/non-existent-id')
      .send({ colour: 'green' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Box not found');
  });

  it('returns 400 when update value is invalid (zero width)', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 1, height: 1, depth: 1, colour: 'red' });

    const res = await request(app)
      .put(`/api/boxes/${created.body.id}`)
      .send({ width: 0 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'width' })])
    );
  });

  it('returns 400 when colour is empty string', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 1, height: 1, depth: 1, colour: 'red' });

    const res = await request(app)
      .put(`/api/boxes/${created.body.id}`)
      .send({ colour: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'colour' })])
    );
  });
});

// ─── DELETE /api/boxes/:id ────────────────────────────────────────────────────

describe('DELETE /api/boxes/:id', () => {
  it('returns 204 on successful deletion', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 5, height: 5, depth: 5, colour: 'yellow' });

    const res = await request(app).delete(`/api/boxes/${created.body.id}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('removes the box from the store', async () => {
    const created = await request(app)
      .post('/api/boxes')
      .send({ width: 5, height: 5, depth: 5, colour: 'yellow' });

    await request(app).delete(`/api/boxes/${created.body.id}`);

    const res = await request(app).get(`/api/boxes/${created.body.id}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 when box does not exist', async () => {
    const res = await request(app).delete('/api/boxes/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Box not found');
  });
});

// ─── Validation unit tests ────────────────────────────────────────────────────

describe('Validation module', () => {
  const { validateBoxInput } = require('../src/validation');

  it('returns valid for a complete valid payload', () => {
    const result = validateBoxInput({ width: 1, height: 2, depth: 3, colour: 'red' }, true);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for all missing required fields', () => {
    const result = validateBoxInput({}, true);
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(['width', 'height', 'depth', 'colour'])
    );
  });

  it('accepts partial payload when requireAll is false', () => {
    const result = validateBoxInput({ colour: 'blue' }, false);
    expect(result.valid).toBe(true);
  });

  it('rejects negative depth even when requireAll is false', () => {
    const result = validateBoxInput({ depth: -5 }, false);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('depth');
  });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  it('returns 404 for an unregistered route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });
});
