import express from 'express';
import fs from 'fs';
import path from 'path';
import { generateStoryWithGemini, generateImageWithGemini } from '../services/geminiClient';

const router = express.Router();

// body: { keywords: string[] }
router.post('/', async (req, res) => {
  try {
    const { keywords } = req.body ?? {};

    console.log('Received keywords:', keywords);

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'keywords must be a non-empty array of strings' });
    }

    const sanitizedKeywords: string[] = keywords
      .map((k: any) => (typeof k === 'string' ? k.trim() : ''))
      .filter((k) => k.length > 0)
      .slice(0, 10); // limit

    if (sanitizedKeywords.length === 0) {
      return res.status(400).json({ error: 'no valid keywords provided' });
    }

    // Build story prompt
    const storyPrompt = `다음 키워드들을 사용해 한국어로 무서운 단편 소설을 작성해 주세요. 글자수는 약 600~900자 내외로, 분위기는 음산하고 긴장감 있게, 키워드들을 자연스럽게 포함하세요. 키워드: ${sanitizedKeywords.join(', ')}`;

    const story = await generateStoryWithGemini(storyPrompt);

    // Image prompt: use first keyword + mood hints
    const imagePrompt = `${sanitizedKeywords[0]}을(를) 중심으로 한 무서운 분위기의 대표 이미지, 어두운 색감, cinematic lighting, high detail`;

    const imageResult = await generateImageWithGemini(imagePrompt);

    // ensure public/images exists
    const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');
    await fs.promises.mkdir(imagesDir, { recursive: true });

    let imageUrl: string | null = null;

    if (imageResult.type === 'url' && imageResult.url) {
      imageUrl = imageResult.url;
    } else if (imageResult.type === 'base64' && imageResult.base64) {
      // save to file
      const buffer = Buffer.from(imageResult.base64, 'base64');
      const fileName = `scary-${Date.now()}.png`;
      const filePath = path.join(imagesDir, fileName);
      await fs.promises.writeFile(filePath, buffer);
      // expose under /public/images
      imageUrl = `/public/images/${fileName}`;
    }

    return res.json({ story, imageUrl });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('generate error', err);
    return res.status(500).json({ error: err?.message || 'internal error' });
  }
});

export default router;
