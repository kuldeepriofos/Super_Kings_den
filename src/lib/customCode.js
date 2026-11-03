import fs from 'fs';
import path from 'path';
import React from 'react';
import connectToDatabase from './mongodb';
import CustomCode from '../models/CustomCode';

const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'customCode.json');

const DEFAULT_CONFIG = {
  isEnabled: true,
  headCode: '',
  headEnabled: true,
  bodyOpenCode: '',
  bodyOpenEnabled: true,
  bodyCloseCode: '',
  bodyCloseEnabled: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Reads custom code configuration.
 * Always reads from local JSON file for instant zero-latency SSR rendering on public pages.
 */
export function getCustomCodeData() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const content = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to read customCode.json:', err.message);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves custom code configuration to both MongoDB and local JSON file.
 */
export async function saveCustomCodeData(newData, username = 'admin') {
  const merged = {
    isEnabled: Boolean(newData.isEnabled !== undefined ? newData.isEnabled : true),
    headCode: typeof newData.headCode === 'string' ? newData.headCode : '',
    headEnabled: Boolean(newData.headEnabled !== undefined ? newData.headEnabled : true),
    bodyOpenCode: typeof newData.bodyOpenCode === 'string' ? newData.bodyOpenCode : '',
    bodyOpenEnabled: Boolean(newData.bodyOpenEnabled !== undefined ? newData.bodyOpenEnabled : true),
    bodyCloseCode: typeof newData.bodyCloseCode === 'string' ? newData.bodyCloseCode : '',
    bodyCloseEnabled: Boolean(newData.bodyCloseEnabled !== undefined ? newData.bodyCloseEnabled : true),
    updatedAt: new Date().toISOString(),
    updatedBy: username,
  };

  // 1. Write to local JSON file for SSR
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(merged, null, 2), 'utf8');
  } catch (fileErr) {
    console.warn('Failed to write customCode.json:', fileErr.message);
  }

  // 2. Persist in MongoDB
  try {
    await connectToDatabase();
    await CustomCode.findOneAndUpdate(
      { key: 'global' },
      { ...merged, key: 'global' },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.warn('MongoDB save warning in saveCustomCodeData:', dbErr.message);
  }

  return merged;
}

/**
 * Synchronizes MongoDB data into JSON on startup or query if available.
 */
export async function syncCustomCodeFromDB() {
  try {
    await connectToDatabase();
    const doc = await CustomCode.findOne({ key: 'global' }).lean();
    if (doc) {
      const data = {
        isEnabled: doc.isEnabled,
        headCode: doc.headCode || '',
        headEnabled: doc.headEnabled,
        bodyOpenCode: doc.bodyOpenCode || '',
        bodyOpenEnabled: doc.bodyOpenEnabled,
        bodyCloseCode: doc.bodyCloseCode || '',
        bodyCloseEnabled: doc.bodyCloseEnabled,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        updatedBy: doc.updatedBy || 'admin',
      };
      fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
      return data;
    }
  } catch (err) {
    // If DB fails, fallback to JSON seamlessly
  }
  return getCustomCodeData();
}

/**
 * Parses raw HTML string and returns safe React elements for <head>.
 * Supports <script>, <style>, <meta>, <link>, and <noscript>.
 */
export function parseHeadSnippet(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string' || !rawHtml.trim()) {
    return null;
  }

  const elements = [];
  const tagRegex = /<(script|style|meta|link|noscript)([^>]*)>(?:([\s\S]*?)<\/\1>)?/gi;
  let match;
  let keyIndex = 0;

  while ((match = tagRegex.exec(rawHtml)) !== null) {
    const tagName = match[1].toLowerCase();
    const rawAttrs = match[2] || '';
    const innerContent = match[3];

    const attrs = { key: `skd-head-${tagName}-${keyIndex++}` };
    const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1];
      const attrVal =
        attrMatch[2] !== undefined
          ? attrMatch[2]
          : attrMatch[3] !== undefined
          ? attrMatch[3]
          : attrMatch[4] !== undefined
          ? attrMatch[4]
          : true;

      const lowerName = attrName.toLowerCase();
      if (lowerName === 'class') {
        attrs.className = attrVal;
      } else if (lowerName === 'crossorigin') {
        attrs.crossOrigin = attrVal;
      } else if (lowerName === 'charset') {
        attrs.charSet = attrVal;
      } else if (lowerName === 'httpequiv' || lowerName === 'http-equiv') {
        attrs.httpEquiv = attrVal;
      } else {
        attrs[attrName] = attrVal;
      }
    }

    if (innerContent !== undefined && innerContent !== null && innerContent.trim()) {
      attrs.dangerouslySetInnerHTML = { __html: innerContent };
    }

    elements.push(React.createElement(tagName, attrs));
  }

  return elements.length > 0 ? elements : null;
}

/**
 * Head Code Injector Component for layout.jsx
 */
export function CustomHeadInjector({ snippet }) {
  if (!snippet) return null;
  const elements = parseHeadSnippet(snippet);
  if (!elements) return null;
  return <>{elements}</>;
}
