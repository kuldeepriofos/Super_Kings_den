import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminSession } from '../../../../lib/auth';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Regex to identify WordPress auto-generated responsive thumbnail resize variants (e.g. photo-300x180.png, image-768x461.jpg)
const RESIZE_REGEX = /-\d+x\d+\.(png|jpe?g|webp|avif|gif)$/i;

// In-memory cache for media listing with TTL to avoid scanning 1,500+ files on every keystroke
let mediaCache = null;
let cacheTime = 0;
const CACHE_TTL = 15000; // 15 seconds

function getMediaSortTimestamp(relPath, stats) {
  // Extract /uploads/YYYY/MM/ from the relative path
  const m = relPath.match(/uploads[\\/](\d{4})[\\/](\d{2})[\\/]/i);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const mtimeDate = new Date(stats.mtimeMs);
    const mtimeYear = mtimeDate.getFullYear();
    const mtimeMonth = mtimeDate.getMonth() + 1;

    // For newly uploaded images in current year/month, use exact real-time mtime
    if (mtimeYear === year && mtimeMonth === month) {
      return stats.mtimeMs;
    }

    // For legacy uploaded images, anchor to year/month folder date
    // so newer folders (e.g. 2026/10) always rank above older folders (e.g. 2024/07)
    const folderBase = new Date(Date.UTC(year, month - 1, 1)).getTime();
    const dayOffset = Math.abs(stats.mtimeMs % (28 * 86400000));
    return folderBase + dayOffset;
  }
  return stats.mtimeMs;
}

function getAllUploadFiles(dir, baseDir = UPLOADS_DIR) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllUploadFiles(fullPath, baseDir));
    } else if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(entry.name)) {
      // Exclude WordPress thumbnail resize variants so each unique image appears only ONCE
      if (RESIZE_REGEX.test(entry.name)) {
        continue;
      }

      try {
        const stats = fs.statSync(fullPath);
        const relPath = path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
        const sortTime = getMediaSortTimestamp(relPath, stats);

        results.push({
          url: `/${relPath}`,
          name: entry.name,
          size: stats.size,
          mtime: stats.mtimeMs,
          sortTime: sortTime,
          dateFormatted: new Date(sortTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        });
      } catch (e) {
        // ignore unreadable file
      }
    }
  }
  return results;
}

function getCachedMediaList(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && mediaCache && now - cacheTime < CACHE_TTL) {
    return mediaCache;
  }
  const files = getAllUploadFiles(UPLOADS_DIR);
  // Sort newest added/uploaded files first
  files.sort((a, b) => (b.sortTime || b.mtime) - (a.sortTime || a.mtime));
  mediaCache = files;
  cacheTime = now;
  return mediaCache;
}

export async function GET(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '36', 10)));
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    let allMedia = getCachedMediaList();

    if (search) {
      allMedia = allMedia.filter(
        (m) => m.name.toLowerCase().includes(search) || m.url.toLowerCase().includes(search)
      );
    }

    const total = allMedia.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = allMedia.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      media: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Media GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName).toLowerCase();

    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format. Allowed: ${allowedExts.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Generate folder based on current year/month
    const now = new Date();
    const yearStr = String(now.getFullYear());
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const targetDir = path.join(UPLOADS_DIR, yearStr, monthStr);
    fs.mkdirSync(targetDir, { recursive: true });

    // Clean filename
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'upload';

    let finalName = `${baseName}${ext}`;
    let diskPath = path.join(targetDir, finalName);

    // If file exists, append timestamp
    if (fs.existsSync(diskPath)) {
      finalName = `${baseName}-${Date.now().toString().slice(-4)}${ext}`;
      diskPath = path.join(targetDir, finalName);
    }

    // Save buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(diskPath, buffer);

    // Invalidate cache
    mediaCache = null;

    const publicUrl = `/uploads/${yearStr}/${monthStr}/${finalName}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      media: {
        url: publicUrl,
        name: finalName,
        size: buffer.length,
        dateFormatted: now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
    });
  } catch (err) {
    console.error('Media POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const fileUrl = body.url;

    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ success: false, error: 'Invalid file URL' }, { status: 400 });
    }

    const relPath = fileUrl.replace(/^\/uploads\//, '');
    const diskPath = path.join(UPLOADS_DIR, ...relPath.split('/'));

    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);

      // Also clean up any responsive resize variants for this image in the same directory
      try {
        const dir = path.dirname(diskPath);
        const ext = path.extname(diskPath);
        const baseName = path.basename(diskPath, ext);
        const variantRegex = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+x\\d+${ext.replace('.', '\\.')}$`, 'i');
        if (fs.existsSync(dir)) {
          const siblings = fs.readdirSync(dir);
          for (const s of siblings) {
            if (variantRegex.test(s)) {
              try {
                fs.unlinkSync(path.join(dir, s));
              } catch (e) {}
            }
          }
        }
      } catch (cleanupErr) {
        // ignore variant cleanup errors
      }

      mediaCache = null;
      return NextResponse.json({ success: true, message: 'File and variations deleted successfully' });
    } else {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
