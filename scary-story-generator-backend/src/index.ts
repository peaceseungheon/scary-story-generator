import express from 'express';
import path from 'path';
import generateRouter from './routes/generate';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(express.json({ limit: '1mb' }));

// static files (generated images)
const publicDir = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicDir));

app.use('/generate', generateRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, info: 'Scary Story Generator Backend' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Scary story backend listening on http://localhost:${PORT}`);
});
