import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Helper to generate unique slugs
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function POST(request: NextRequest) {
  const db: any = process.env.DB;
  const assets: any = (process.env as any).ASSETS; // Assuming R2 binding

  if (!db || typeof db === 'string') {
    return NextResponse.json({ error: "Database binding not found" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const modelSlug = formData.get('modelId') as string;
    const type = formData.get('type') as string;
    const tagsJson = formData.get('tags') as string;
    const video = formData.get('video') as File;
    const thumbnail = formData.get('thumbnail') as File;

    if (!title || !modelSlug || !video) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Resolve Creator ID
    const model = await db.prepare("SELECT id FROM models WHERE slug = ?").bind(modelSlug).first();
    if (!model) {
      return NextResponse.json({ error: "Selected creator does not exist" }, { status: 404 });
    }

    const videoId = crypto.randomUUID();
    const baseSlug = slugify(title);
    const finalSlug = `${baseSlug}-${videoId.slice(0, 8)}`;

    // 2. Upload to R2 (Mocking R2 logic as it depends on binding setup)
    // In real production code: await assets.put(`videos/${videoId}.mp4`, await video.arrayBuffer());
    // For this environment, we'll store the public URLs (assuming R2 has a public domain)
    const videoUrl = `/cdn/videos/${videoId}.mp4`;
    const thumbnailUrl = thumbnail ? `/cdn/thumbs/${videoId}.jpg` : 'https://picsum.photos/1280/720';

    // 3. Insert into D1
    await db.prepare(`
      INSERT INTO videos (id, title, slug, description, type, model_id, duration, thumbnail, hover_preview_url, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      videoId,
      title,
      finalSlug,
      description || '',
      type,
      model.id,
      420, // Duration should be extracted from video metadata in production
      thumbnailUrl,
      videoUrl,
      1
    ).run();

    // 4. Update Model Video Count
    await db.prepare("UPDATE models SET videos_count = videos_count + 1 WHERE id = ?").bind(model.id).run();

    // 5. Handle Tags
    if (tagsJson) {
      const selectedTags = JSON.parse(tagsJson);
      for (const tagId of selectedTags) {
        await db.prepare("INSERT INTO video_tags (video_id, tag_id) VALUES (?, ?)").bind(videoId, tagId).run();
      }
    }

    return NextResponse.json({ 
      success: true, 
      slug: finalSlug,
      videoId 
    }, { status: 201 });

  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}