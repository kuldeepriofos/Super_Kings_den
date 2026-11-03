'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Edit2,
  Check,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Eye,
  Undo,
  Redo,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Pilcrow,
  Wand2,
  Plus,
  Trash2,
  CheckCircle2,
  Rows,
  Columns,
  X,
  FileSpreadsheet,
  Sliders,
  Type,
} from 'lucide-react';

/**
 * Escapes raw strings for safe HTML attributes/content.
 */
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Detects whether plain text is a Tab-Separated Values (TSV) table (copied from Excel or Google Sheets).
 */
export function isTsvTable(text) {
  if (!text || typeof text !== 'string') return false;
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return false;

  // Check tab count on the first few rows
  const tabCounts = lines.slice(0, 5).map((l) => (l.match(/\t/g) || []).length);
  const firstTabs = tabCounts[0];
  if (firstTabs < 1) return false; // At least 2 columns

  // Consistent tab counts indicates structured tabular data
  return tabCounts.every((count) => count === firstTabs);
}

/**
 * Converts a Tab-Separated Values string (Excel / Google Sheets) into a clean,
 * responsive Super Kings Den WordPress-compatible HTML table.
 */
export function tsvToHtmlTable(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';

  const headerCells = lines[0].split('\t').map((c) => c.trim());
  const bodyRows = lines.slice(1).map((l) => l.split('\t').map((c) => c.trim()));

  let html = '<figure class="wp-block-table my-6">\n';
  html += '  <table class="has-fixed-layout w-full">\n';
  html += '    <thead>\n      <tr>\n';
  headerCells.forEach((cell) => {
    html += `        <th>${escapeHtml(cell)}</th>\n`;
  });
  html += '      </tr>\n    </thead>\n';

  html += '    <tbody>\n';
  bodyRows.forEach((row) => {
    html += '      <tr>\n';
    row.forEach((cell) => {
      html += `        <td>${escapeHtml(cell)}</td>\n`;
    });
    html += '      </tr>\n';
  });
  html += '    </tbody>\n  </table>\n</figure>\n<p class="wp-block-paragraph"><br></p>';
  return html;
}

/**
 * Strips all Microsoft Word junk, Google Docs wrappers, third-party CSS classes,
 * inline font/color/background styles, and transforms raw tables into responsive
 * Gutenberg tables with gold header styling and mobile-scrolling figure wrappers.
 */
export function cleanPastedHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  if (typeof window === 'undefined') return rawHtml;

  try {
    let clean = rawHtml;

    // 1. Remove Word conditional comments <!--[if ...]>...<![endif]-->
    clean = clean.replace(/<!--[\s\S]*?-->/gi, '');

    // 2. Remove Word xml tags, style tags, meta, link, o:p, w: tags
    clean = clean.replace(/<xml[\s\S]*?<\/xml>/gi, '');
    clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
    clean = clean.replace(/<meta[^>]*>/gi, '');
    clean = clean.replace(/<link[^>]*>/gi, '');
    clean = clean.replace(/<\/?o:[^>]*>/gi, '');
    clean = clean.replace(/<\/?w:[^>]*>/gi, '');
    clean = clean.replace(/<\/?m:[^>]*>/gi, '');

    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    const body = doc.body;

    // 3. Google Docs unwrapping: remove <b id="docs-internal-guid-..." style="font-weight:normal">
    body.querySelectorAll('b[id^="docs-internal-guid"]').forEach((b) => {
      const parent = b.parentNode;
      if (parent) {
        while (b.firstChild) {
          parent.insertBefore(b.firstChild, b);
        }
        parent.removeChild(b);
      }
    });

    // 4. Remove dangerous or non-content elements
    body
      .querySelectorAll('script, style, iframe, form, button, svg, noscript, input, select, textarea')
      .forEach((el) => {
        el.remove();
      });

    // 5. Clean ALL elements: remove inline font, background, fixed width, and color styles
    const allElements = body.querySelectorAll('*');
    allElements.forEach((el) => {
      const tag = el.tagName.toLowerCase();

      // Remove tracking and non-standard attributes
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (
          name.startsWith('data-') ||
          name.startsWith('aria-') ||
          name.startsWith('mso-') ||
          name === 'role' ||
          name === 'tabindex' ||
          name === 'cellspacing' ||
          name === 'cellpadding' ||
          name === 'border' ||
          name === 'bgcolor' ||
          name === 'align' ||
          name === 'valign'
        ) {
          el.removeAttribute(attr.name);
        }
      });

      // Clean classes: strip Mso classes and foreign framework classes
      if (el.className && typeof el.className === 'string') {
        const keepClasses = [];
        const parts = el.className.split(/\s+/);
        parts.forEach((cls) => {
          if (
            cls.startsWith('wp-block-') ||
            cls.startsWith('has-') ||
            cls.startsWith('wp-element-') ||
            cls === 'size-large' ||
            cls === 'size-medium' ||
            cls === 'size-full' ||
            cls === 'size-thumbnail' ||
            cls === 'aligncenter' ||
            cls === 'alignleft' ||
            cls === 'alignright' ||
            cls === 'alignwide' ||
            cls === 'alignnone' ||
            cls === 'is-resized' ||
            cls === 'w-full'
          ) {
            keepClasses.push(cls);
          }
        });
        if (keepClasses.length > 0) {
          el.className = keepClasses.join(' ');
        } else {
          el.removeAttribute('class');
        }
      }

      // Clean inline style attribute
      if (el.hasAttribute('style')) {
        const style = el.getAttribute('style') || '';
        // For tables, rows, cells: completely strip inline styles so site CSS controls colors & borders
        if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'].includes(tag)) {
          el.removeAttribute('style');
        } else if (tag === 'figure') {
          // For figure (images), preserve width (e.g. width: 50%, width: 25%)
          const widthMatch = style.match(/(?:^|;)\s*width:\s*([0-9.]+(%|px|rem))/i);
          if (widthMatch) {
            el.setAttribute('style', `width: ${widthMatch[1]};`);
          } else {
            el.removeAttribute('style');
          }
        } else {
          // For text, remove intrusive colors, backgrounds, fonts, sizes, and fixed dimensions
          const cleanedStyle = style
            .replace(
              /(^|;)\s*(color|background|background-color|font-family|font-size|line-height|width|height|max-width|min-width|margin|padding|white-space)[^;]*/gi,
              ''
            )
            .replace(/^;+|;+$/g, '')
            .trim();
          if (cleanedStyle) {
            el.setAttribute('style', cleanedStyle);
          } else {
            el.removeAttribute('style');
          }
        }
      }
    });

    // 6. Detect Google Docs pseudo-headings: <p><strong>Title</strong></p> -> <h2>
    body.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      const firstChild = p.firstElementChild;
      if (
        firstChild &&
        p.children.length === 1 &&
        (firstChild.tagName === 'STRONG' || firstChild.tagName === 'B') &&
        text.length >= 3 &&
        text.length <= 75 &&
        !text.endsWith('.') &&
        !text.endsWith(':')
      ) {
        const h2 = doc.createElement('h2');
        h2.className = 'wp-block-heading';
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) h2.id = `h-${slug}`;
        h2.textContent = text;
        if (p.parentNode) {
          p.parentNode.replaceChild(h2, p);
        }
      }
    });

    // 7. Unwrap redundant empty spans
    body.querySelectorAll('span').forEach((span) => {
      if (span.attributes.length === 0) {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      }
    });

    // 8. Process and sanitize TABLES (from Cricinfo, Wikipedia, Cricbuzz, IPLT20, etc.)
    body.querySelectorAll('table').forEach((table) => {
      table.removeAttribute('width');
      table.removeAttribute('height');
      table.removeAttribute('border');
      table.removeAttribute('cellspacing');
      table.removeAttribute('cellpadding');
      table.removeAttribute('style');
      table.className = 'has-fixed-layout w-full';

      // Unwrap any foreign wrapper divs around table (e.g. ds-overflow-x-auto, cb-col)
      let currentParent = table.parentElement;
      while (
        currentParent &&
        currentParent !== body &&
        currentParent.tagName.toLowerCase() === 'div' &&
        currentParent.children.length === 1
      ) {
        const grandparent = currentParent.parentElement;
        if (grandparent) {
          grandparent.insertBefore(table, currentParent);
          grandparent.removeChild(currentParent);
          currentParent = grandparent;
        } else {
          break;
        }
      }

      // Ensure proper <thead> and <tbody>
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length > 0) {
        let thead = table.querySelector('thead');
        let tbody = table.querySelector('tbody');

        if (!thead) {
          const firstRow = rows[0];
          thead = doc.createElement('thead');
          table.insertBefore(thead, table.firstChild);
          thead.appendChild(firstRow);

          // Convert all cells in first row to <th>
          const cells = Array.from(firstRow.children);
          cells.forEach((cell) => {
            if (cell.tagName.toLowerCase() === 'td') {
              const th = doc.createElement('th');
              while (cell.firstChild) th.appendChild(cell.firstChild);
              firstRow.replaceChild(th, cell);
            }
          });
        }

        if (!tbody) {
          tbody = doc.createElement('tbody');
          table.appendChild(tbody);
          rows.slice(1).forEach((r) => tbody.appendChild(r));
        }
      }

      // Clean every cell: remove inline styles and nested useless paragraphs
      table.querySelectorAll('th, td').forEach((cell) => {
        cell.removeAttribute('style');
        cell.removeAttribute('width');
        cell.removeAttribute('height');
        cell.removeAttribute('bgcolor');
        cell.removeAttribute('color');
        cell.removeAttribute('align');
        cell.removeAttribute('valign');

        // Clean paragraphs inside cells: <p>Data</p> -> Data
        cell.querySelectorAll('p').forEach((p) => {
          const parent = p.parentNode;
          if (parent) {
            while (p.firstChild) parent.insertBefore(p.firstChild, p);
            parent.removeChild(p);
          }
        });
      });

      // Wrap in figure.wp-block-table
      const parent = table.parentElement;
      if (!parent || parent.tagName.toLowerCase() !== 'figure') {
        const figure = doc.createElement('figure');
        figure.className = 'wp-block-table my-6';
        if (table.parentNode) {
          table.parentNode.insertBefore(figure, table);
          figure.appendChild(table);
        }
      } else {
        parent.className = 'wp-block-table my-6';
      }
    });

    // 9. Process HEADINGS
    body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      h.classList.add('wp-block-heading');
      if (!h.id) {
        const text = h.textContent.trim();
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (slug) h.id = `h-${slug}`;
      }
    });

    // 10. Process PARAGRAPHS
    body.querySelectorAll('p').forEach((p) => {
      if (!p.closest('table') && !p.closest('ul') && !p.closest('ol')) {
        p.classList.add('wp-block-paragraph');
      }
      if (p.textContent.trim() === '' && !p.querySelector('img') && !p.querySelector('iframe')) {
        p.remove();
      }
    });

    // 11. Process LISTS
    body.querySelectorAll('ul, ol').forEach((list) => {
      list.classList.add('wp-block-list');
    });

    // 12. Process BLOCKQUOTES
    body.querySelectorAll('blockquote').forEach((bq) => {
      bq.classList.add('wp-block-quote');
    });

    // 13. Process IMAGES
    body.querySelectorAll('figure.wp-block-image').forEach((figure) => {
      let align = 'aligncenter';
      if (figure.classList.contains('alignleft')) align = 'alignleft';
      else if (figure.classList.contains('alignright')) align = 'alignright';
      else if (figure.classList.contains('alignwide')) align = 'alignwide';
      else if (figure.classList.contains('alignnone')) align = 'alignnone';

      const isResized = figure.classList.contains('is-resized') || Boolean(figure.getAttribute('style')?.includes('width'));
      figure.className = `wp-block-image size-large ${align}${isResized ? ' is-resized' : ''}`;

      const img = figure.querySelector('img');
      if (img) {
        img.removeAttribute('style');
        img.removeAttribute('width');
        img.removeAttribute('height');
      }

      const caption = figure.querySelector('figcaption');
      if (caption) {
        caption.className = 'wp-element-caption';
      }
    });

    body.querySelectorAll('img').forEach((img) => {
      const parent = img.parentElement;
      if (!parent || parent.tagName.toLowerCase() !== 'figure') {
        const figure = doc.createElement('figure');
        figure.className = 'wp-block-image size-large aligncenter';
        if (img.parentNode) {
          img.parentNode.insertBefore(figure, img);
          figure.appendChild(img);
        }
      }
    });

    return body.innerHTML;
  } catch (err) {
    console.warn('cleanPastedHtml error:', err);
    return rawHtml;
  }
}

/**
 * Normalizes HTML to strictly match the WordPress Gutenberg class allotment.
 */
export function normalizeWordPressHtml(html) {
  return cleanPastedHtml(html);
}

const RichTextEditor = forwardRef(function RichTextEditor(
  {
    value = '',
    onChange,
    onOpenMedia,
    placeholder = 'Write your article here...',
  },
  ref
) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'code' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [currentBlockTag, setCurrentBlockTag] = useState('p');
  const [isInsideTable, setIsInsideTable] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Image Figure & Controls State
  const [selectedFigure, setSelectedFigure] = useState(null);
  const [selectedFigureProps, setSelectedFigureProps] = useState(null);

  // WordPress Classic Editor Link Manager State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({
    url: '',
    text: '',
    openInNewTab: false,
    isExisting: false,
  });
  const [activeLinkNode, setActiveLinkNode] = useState(null);
  const [linkPopover, setLinkPopover] = useState(null); // { url, text, openInNewTab, top, left }

  // Custom Image Alt Modal State (replaces native prompt)
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [altFormText, setAltFormText] = useState('');

  const editorRef = useRef(null);
  const isTypingRef = useRef(false);
  const savedSelectionRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Sync value from parent into contentEditable div
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (!isTypingRef.current && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      isTypingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isTypingRef.current = false;
      }, 300);
    }
  }, [onChange]);

  // Image Selection Helpers
  const selectFigure = useCallback((figure) => {
    if (!figure || !editorRef.current) return;

    // Deselect any previously active image
    editorRef.current.querySelectorAll('figure.wp-block-image[data-selected="true"]').forEach((f) => {
      f.removeAttribute('data-selected');
    });

    figure.setAttribute('data-selected', 'true');

    // Read current alignment
    let align = 'aligncenter';
    if (figure.classList.contains('alignleft')) align = 'alignleft';
    else if (figure.classList.contains('alignright')) align = 'alignright';
    else if (figure.classList.contains('alignwide')) align = 'alignwide';

    // Read current width percentage
    let widthPct = 100;
    const styleWidth = figure.style.width || '';
    const match = styleWidth.match(/([0-9.]+)%/);
    if (match) {
      widthPct = Math.round(parseFloat(match[1]));
    } else if (align === 'alignleft' || align === 'alignright') {
      widthPct = 50;
    }

    const img = figure.querySelector('img');
    const alt = img ? img.getAttribute('alt') || '' : '';

    setSelectedFigure(figure);
    setSelectedFigureProps({ align, widthPct, alt });
  }, []);

  const deselectFigure = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.querySelectorAll('figure.wp-block-image[data-selected="true"]').forEach((f) => {
        f.removeAttribute('data-selected');
      });
    }
    setSelectedFigure(null);
    setSelectedFigureProps(null);
  }, []);

  const handleEditorClick = useCallback(
    (e) => {
      const target = e.target;
      const figure =
        target.closest('figure.wp-block-image') ||
        (target.tagName?.toLowerCase() === 'img' ? target.closest('figure') : null);
      if (figure && editorRef.current && editorRef.current.contains(figure)) {
        selectFigure(figure);
      } else {
        if (selectedFigure) {
          deselectFigure();
        }
      }

      // Check if clicked element is an anchor link
      const link = target.closest('a');
      if (link && editorRef.current && editorRef.current.contains(link)) {
        e.preventDefault();
        setActiveLinkNode(link);

        const linkRect = link.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        const top = Math.max(0, linkRect.bottom - editorRect.top + 8);
        const left = Math.max(8, Math.min(linkRect.left - editorRect.left, (editorRect.width || 400) - 280));

        setLinkPopover({
          url: link.getAttribute('href') || '',
          text: link.textContent || '',
          openInNewTab: link.getAttribute('target') === '_blank',
          top,
          left,
        });
      } else {
        setLinkPopover(null);
      }
    },
    [selectedFigure, selectFigure, deselectFigure]
  );

  // Track selection inside editorRef & detect if cursor is in a table
  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();

        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement;

        // Check if inside table
        const inTable = Boolean(node && (node.closest('td') || node.closest('th') || node.closest('table')));
        setIsInsideTable(inTable);

        // Detect current enclosing block tag
        const blockTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'];
        let curr = node;
        while (curr && curr !== editorRef.current) {
          const tag = (curr.tagName || '').toLowerCase();
          if (blockTags.includes(tag)) {
            setCurrentBlockTag(tag);
            return;
          }
          curr = curr.parentElement;
        }
        setCurrentBlockTag('p');
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (savedSelectionRef.current && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  // When blur occurs or mode changes, ensure full WordPress class normalization
  const handleBlur = useCallback(() => {
    if (editorRef.current && onChange) {
      const rawHtml = editorRef.current.innerHTML;
      const normalized = cleanPastedHtml(rawHtml);
      if (normalized !== rawHtml) {
        editorRef.current.innerHTML = normalized;
      }
      onChange(normalized);
    }
  }, [onChange]);

  const exec = (command, val = null) => {
    if (mode !== 'visual') return;
    restoreSelection();
    document.execCommand(command, false, val);
    handleInput();
    saveSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  /**
   * Inserts an Image at the exact cursor/selection location.
   * Splits text cleanly or replaces empty paragraph.
   */
  const insertImage = useCallback(
    (media) => {
      if (!media) return;
      const url = typeof media === 'string' ? media : media.url;
      const name = typeof media === 'string' ? '' : media.name || media.title || '';

      if (!url) return;

      if (mode !== 'visual' || !editorRef.current) {
        const imgHtml = `\n<figure class="wp-block-image size-large aligncenter"><img src="${url}" alt="${escapeHtml(name)}" /><figcaption class="wp-element-caption"></figcaption></figure>\n<p class="wp-block-paragraph"><br></p>\n`;
        if (onChange) onChange(value ? `${value}\n${imgHtml}` : imgHtml);
        return;
      }

      editorRef.current.focus();

      // 1. Try restoring saved caret range
      let range = null;
      const sel = window.getSelection();
      if (savedSelectionRef.current) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRef.current);
          range = savedSelectionRef.current;
        } catch (err) {
          console.warn('Could not restore savedSelectionRange:', err);
        }
      }

      if (!range && sel && sel.rangeCount > 0) {
        const candidateRange = sel.getRangeAt(0);
        if (editorRef.current.contains(candidateRange.commonAncestorContainer)) {
          range = candidateRange;
        }
      }

      // 2. Build the Gutenberg Figure Block
      const figure = document.createElement('figure');
      figure.className = 'wp-block-image size-large aligncenter';
      figure.style.width = '100%';

      const img = document.createElement('img');
      img.src = url;
      img.alt = name;
      figure.appendChild(img);

      const figcaption = document.createElement('figcaption');
      figcaption.className = 'wp-element-caption';
      figcaption.setAttribute('contenteditable', 'true');
      figcaption.setAttribute('data-placeholder', 'Write a caption (optional)...');
      figure.appendChild(figcaption);

      const trailingP = document.createElement('p');
      trailingP.className = 'wp-block-paragraph';
      trailingP.innerHTML = '<br>';

      // 3. Insert at cursor / selection
      if (range && editorRef.current.contains(range.commonAncestorContainer)) {
        let blockNode = range.commonAncestorContainer;
        if (blockNode.nodeType === 3) blockNode = blockNode.parentElement;

        // Ascend to top-level block inside editorRef
        while (blockNode && blockNode.parentElement && blockNode.parentElement !== editorRef.current) {
          if (
            ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'FIGURE', 'UL', 'OL', 'TABLE'].includes(
              blockNode.tagName
            )
          ) {
            break;
          }
          blockNode = blockNode.parentElement;
        }

        if (blockNode && blockNode.tagName.toLowerCase() === 'p') {
          if (blockNode.textContent.trim() === '') {
            // Empty paragraph: replace cleanly!
            blockNode.parentNode.replaceChild(figure, blockNode);
            figure.parentNode.insertBefore(trailingP, figure.nextSibling);
          } else {
            // Paragraph has text: split cleanly at cursor!
            const postRange = document.createRange();
            postRange.setStart(range.endContainer, range.endOffset);
            postRange.setEndAfter(blockNode.lastChild || blockNode);
            const afterFragment = postRange.extractContents();

            const nextP = document.createElement('p');
            nextP.className = 'wp-block-paragraph';
            if (afterFragment.childNodes.length > 0 && afterFragment.textContent.trim() !== '') {
              nextP.appendChild(afterFragment);
            } else {
              nextP.innerHTML = '<br>';
            }

            blockNode.parentNode.insertBefore(figure, blockNode.nextSibling);
            blockNode.parentNode.insertBefore(nextP, figure.nextSibling);

            // Focus nextP
            const newRange = document.createRange();
            newRange.setStart(nextP, 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();

            handleInput();
            selectFigure(figure);
            showToast('Image inserted at cursor location!');
            return;
          }
        } else if (blockNode && blockNode !== editorRef.current) {
          // Other block: insert right after it
          blockNode.parentNode.insertBefore(figure, blockNode.nextSibling);
          blockNode.parentNode.insertBefore(trailingP, figure.nextSibling);
        } else {
          // Inline selection insertion
          range.deleteContents();
          range.insertNode(trailingP);
          range.insertNode(figure);
        }
      } else {
        // No active selection inside editor: append to bottom
        editorRef.current.appendChild(figure);
        editorRef.current.appendChild(trailingP);
      }

      // Place caret in trailing paragraph
      const newRange = document.createRange();
      newRange.setStart(trailingP, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRef.current = newRange.cloneRange();

      handleInput();
      selectFigure(figure);
      showToast('Image inserted at cursor location!');
    },
    [mode, onChange, value, handleInput, selectFigure, showToast]
  );

  // Alignment and Resize Handlers
  const handleSetAlignment = (newAlign) => {
    if (!selectedFigure) return;
    selectedFigure.classList.remove('alignleft', 'aligncenter', 'alignright', 'alignwide', 'alignnone');
    selectedFigure.classList.add(newAlign);

    let newWidth = selectedFigureProps?.widthPct || 100;
    // When switching to left or right float and width is 100%, set default to 50% for proper float
    if ((newAlign === 'alignleft' || newAlign === 'alignright') && newWidth >= 100) {
      newWidth = 50;
      selectedFigure.style.width = '50%';
      selectedFigure.classList.add('is-resized');
    } else if (newAlign === 'alignwide') {
      newWidth = 100;
      selectedFigure.style.width = '100%';
      selectedFigure.classList.remove('is-resized');
    }

    handleInput();
    setSelectedFigureProps((prev) => ({
      ...prev,
      align: newAlign,
      widthPct: newWidth,
    }));

    const label =
      newAlign === 'alignleft'
        ? 'Float Left (text wraps)'
        : newAlign === 'alignright'
        ? 'Float Right (text wraps)'
        : newAlign === 'alignwide'
        ? 'Full Width'
        : 'Center';
    showToast(`Image aligned: ${label}`);
  };

  const handleSetWidth = (pct) => {
    if (!selectedFigure) return;
    const cleanPct = Math.min(100, Math.max(20, pct));
    selectedFigure.style.width = `${cleanPct}%`;
    if (cleanPct < 100) {
      selectedFigure.classList.add('is-resized');
    } else {
      selectedFigure.classList.remove('is-resized');
    }
    handleInput();
    setSelectedFigureProps((prev) => ({
      ...prev,
      widthPct: cleanPct,
    }));
  };

  const handleDeleteImage = () => {
    if (!selectedFigure) return;
    selectedFigure.remove();
    setSelectedFigure(null);
    setSelectedFigureProps(null);
    handleInput();
    showToast('Image deleted from article');
  };

  const handleEditAltText = useCallback(() => {
    if (!selectedFigure) return;
    const img = selectedFigure.querySelector('img');
    const currAlt = img ? img.getAttribute('alt') || '' : '';
    setAltFormText(currAlt);
    setAltModalOpen(true);
  }, [selectedFigure]);

  const handleSaveAltText = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (!selectedFigure) return;
      const img = selectedFigure.querySelector('img');
      if (img) {
        img.setAttribute('alt', altFormText.trim());
        handleInput();
        setSelectedFigureProps((prev) => ({ ...prev, alt: altFormText.trim() }));
        showToast('Image Alt text updated!');
      }
      setAltModalOpen(false);
    },
    [selectedFigure, altFormText, handleInput, showToast]
  );

  // Expose imperative methods to parent via ref
  useImperativeHandle(ref, () => ({
    insertImage,
    insertHtmlAtCursor: (html) => insertHtmlAtCursor(html),
    focus: () => {
      if (editorRef.current) editorRef.current.focus();
    },
    getEditorElement: () => editorRef.current,
  }));

  /**
   * Inserts cleaned HTML into the current cursor position.
   */
  const insertHtmlAtCursor = useCallback(
    (html) => {
      restoreSelection();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const frag = document.createDocumentFragment();
          let node;
          let lastNode = null;
          while ((node = tempDiv.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);

          if (lastNode) {
            const newRange = document.createRange();
            newRange.setStartAfter(lastNode);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();
          }

          handleInput();
          if (editorRef.current) editorRef.current.focus();
          return;
        }
      }

      // Fallback
      document.execCommand('insertHTML', false, html);
      handleInput();
      saveSelection();
      if (editorRef.current) editorRef.current.focus();
    },
    [restoreSelection, handleInput, saveSelection]
  );

  /**
   * Smart Paste Interceptor:
   * Handles copying from other websites' tables, Google Docs, Word, Excel, and sheets.
   */
  const handlePaste = useCallback(
    (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const htmlData = clipboardData.getData('text/html');
      const textData = clipboardData.getData('text/plain');

      // 1. Detect Excel / Google Sheets Tab-Separated Values
      if (textData && isTsvTable(textData)) {
        e.preventDefault();
        const tableHtml = tsvToHtmlTable(textData);
        insertHtmlAtCursor(tableHtml);
        showToast('Excel / Sheets Table detected and converted to responsive Super Kings Den format!');
        return;
      }

      // 2. Detect HTML from other websites, Google Docs, Word
      if (htmlData) {
        e.preventDefault();
        const hasTable = /<table[\s\S]*?>/i.test(htmlData);
        const isDoc = /docs-internal-guid|mso-|MsoNormal|<xml|class="xl/i.test(htmlData);

        const cleanedHtml = cleanPastedHtml(htmlData);

        if (cleanedHtml) {
          insertHtmlAtCursor(cleanedHtml);
          if (hasTable) {
            showToast('External Table cleaned: inline styles removed, responsive wrapper applied!');
          } else if (isDoc) {
            showToast('Document pasted: fonts, foreign margins, and styles normalized.');
          } else {
            showToast('Content pasted and formatted cleanly.');
          }
          return;
        }
      }

      // 3. Multiline plain text pasting
      if (textData && textData.includes('\n')) {
        const paragraphs = textData
          .split(/\r?\n\r?\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (paragraphs.length > 1) {
          e.preventDefault();
          const pHtml = paragraphs
            .map((p) => `<p class="wp-block-paragraph">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
            .join('\n');
          insertHtmlAtCursor(pHtml);
          return;
        }
      }
    },
    [insertHtmlAtCursor, showToast]
  );

  /**
   * One-click Sanitize and Clean entire article content
   */
  const handleCleanAllContent = () => {
    if (!editorRef.current) return;
    const raw = editorRef.current.innerHTML;
    const cleaned = cleanPastedHtml(raw);
    editorRef.current.innerHTML = cleaned;
    if (onChange) onChange(cleaned);
    showToast('Entire article sanitized! All tables, headings, and fonts normalized.');
  };

  /**
   * Block Formatter (Heading <-> Paragraph)
   */
  const handleFormatBlock = (targetTag) => {
    if (mode !== 'visual') return;
    restoreSelection();

    const tagLower = targetTag.toLowerCase().replace(/<|>/g, '');
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement;

        const blockTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BLOCKQUOTE', 'DIV'];
        let blockParent = null;
        let curr = node;
        while (curr && curr !== editorRef.current) {
          if (blockTags.includes(curr.tagName)) {
            blockParent = curr;
            break;
          }
          curr = curr.parentElement;
        }

        if (blockParent) {
          if (blockParent.tagName.toLowerCase() === tagLower) return;

          const newEl = document.createElement(tagLower);
          while (blockParent.firstChild) {
            newEl.appendChild(blockParent.firstChild);
          }

          if (tagLower.startsWith('h')) {
            newEl.className = 'wp-block-heading';
            const rawText = blockParent.textContent || '';
            const slug = rawText
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            if (slug) newEl.id = `h-${slug}`;
          } else if (tagLower === 'blockquote') {
            newEl.className = 'wp-block-quote';
          } else if (tagLower === 'p') {
            newEl.className = 'wp-block-paragraph';
          }

          blockParent.parentNode.replaceChild(newEl, blockParent);

          const newRange = document.createRange();
          newRange.selectNodeContents(newEl);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
          setCurrentBlockTag(tagLower);

          handleInput();
          if (editorRef.current) editorRef.current.focus();
          return;
        }
      }
    }

    try {
      document.execCommand('formatBlock', false, `<${tagLower}>`);
    } catch (_) {
      try {
        document.execCommand('formatBlock', false, tagLower);
      } catch (e) {
        console.warn('execCommand failed', e);
      }
    }

    setCurrentBlockTag(tagLower);
    handleInput();
    saveSelection();
    if (editorRef.current) editorRef.current.focus();
  };

  const handleInsertList = (type) => {
    if (mode !== 'visual') return;
    restoreSelection();
    document.execCommand(type === 'ol' ? 'insertOrderedList' : 'insertUnorderedList', false, null);
    if (editorRef.current) {
      editorRef.current.querySelectorAll('ul:not(.wp-block-list), ol:not(.wp-block-list)').forEach((l) => {
        l.classList.add('wp-block-list');
      });
    }
    handleInput();
    saveSelection();
  };

  const openLinkModal = useCallback(
    (targetLinkNode = null) => {
      if (mode !== 'visual') return;
      restoreSelection();

      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      let selectedText = '';
      let targetLink = targetLinkNode;

      if (!targetLink && sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          selectedText = range.toString().trim();
          let node = range.commonAncestorContainer;
          if (node.nodeType === 3) node = node.parentElement;
          targetLink = node?.closest('a') || null;
        }
      }

      if (targetLink && editorRef.current?.contains(targetLink)) {
        setActiveLinkNode(targetLink);
        setLinkForm({
          url: targetLink.getAttribute('href') || '',
          text: targetLink.textContent || selectedText,
          openInNewTab: targetLink.getAttribute('target') === '_blank',
          isExisting: true,
        });
      } else {
        setActiveLinkNode(null);
        setLinkForm({
          url: '',
          text: selectedText,
          openInNewTab: false,
          isExisting: false,
        });
      }

      setLinkPopover(null);
      setLinkModalOpen(true);
    },
    [mode, restoreSelection]
  );

  const handleApplyLink = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();

      let rawUrl = (linkForm.url || '').trim();
      if (!rawUrl) {
        showToast('Please enter a destination URL');
        return;
      }

      // Auto prepend https:// if missing protocol and not relative/internal link or anchor
      if (!rawUrl.match(/^([a-z]+:|\/|#)/i)) {
        rawUrl = `https://${rawUrl}`;
      }

      const displayText = linkForm.text?.trim() || rawUrl;

      if (activeLinkNode && editorRef.current?.contains(activeLinkNode)) {
        // Update existing link
        activeLinkNode.setAttribute('href', rawUrl);
        activeLinkNode.textContent = displayText;
        if (linkForm.openInNewTab) {
          activeLinkNode.setAttribute('target', '_blank');
          activeLinkNode.setAttribute('rel', 'noopener noreferrer');
        } else {
          activeLinkNode.removeAttribute('target');
          activeLinkNode.removeAttribute('rel');
        }

        handleInput();
        setLinkModalOpen(false);
        setActiveLinkNode(null);
        showToast('Link updated successfully!');
        return;
      }

      // Insert new link
      restoreSelection();
      if (editorRef.current) editorRef.current.focus();

      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const a = document.createElement('a');
          a.href = rawUrl;
          a.textContent = displayText;
          if (linkForm.openInNewTab) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }

          range.deleteContents();
          range.insertNode(a);

          // Move cursor after the inserted link
          const newRange = document.createRange();
          newRange.setStartAfter(a);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();

          handleInput();
          setLinkModalOpen(false);
          showToast('Link added successfully!');
          return;
        }
      }

      // Fallback: insertHtmlAtCursor
      const targetAttr = linkForm.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      const linkHtml = `<a href="${escapeHtml(rawUrl)}"${targetAttr}>${escapeHtml(displayText)}</a>`;
      insertHtmlAtCursor(linkHtml);
      setLinkModalOpen(false);
      showToast('Link added successfully!');
    },
    [activeLinkNode, linkForm, handleInput, restoreSelection, insertHtmlAtCursor, showToast]
  );

  const handleRemoveLink = useCallback(
    (targetNode = null) => {
      const node = targetNode || activeLinkNode;
      if (node && editorRef.current?.contains(node)) {
        const parent = node.parentNode;
        if (parent) {
          while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
          }
          parent.removeChild(node);
        }
        handleInput();
        setLinkPopover(null);
        setLinkModalOpen(false);
        setActiveLinkNode(null);
        showToast('Link removed');
      }
    },
    [activeLinkNode, handleInput, showToast]
  );

  const handleInsertTable = () => {
    if (mode !== 'visual') return;
    restoreSelection();
    const cricketTableHtml = `
      <figure class="wp-block-table my-6">
        <table class="has-fixed-layout w-full">
          <thead>
            <tr>
              <th>Match / Season</th>
              <th>Opposition</th>
              <th>Score / Figures</th>
              <th>Strike Rate / Econ</th>
              <th>Match Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IPL 2026 (Match 1)</td>
              <td>Mumbai Indians (MI)</td>
              <td>28* (12 balls)</td>
              <td>233.33 SR</td>
              <td>CSK Won by 5 wickets</td>
            </tr>
            <tr>
              <td>IPL 2026 (Match 5)</td>
              <td>Royal Challengers (RCB)</td>
              <td>45 (24 balls)</td>
              <td>187.50 SR</td>
              <td>CSK Won by 18 runs</td>
            </tr>
            <tr>
              <td>IPL 2026 (Match 9)</td>
              <td>Kolkata Knight Riders (KKR)</td>
              <td>35* (15 balls)</td>
              <td>233.33 SR</td>
              <td>CSK Won by 6 wickets</td>
            </tr>
          </tbody>
        </table>
      </figure>
      <p class="wp-block-paragraph"><br></p>
    `;
    insertHtmlAtCursor(cricketTableHtml);
    showToast('New cricket statistics table inserted!');
  };

  // TABLE EDITING HELPERS
  const getTableContext = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;
    const td = node.closest('td, th');
    const tr = node.closest('tr');
    const table = node.closest('table');
    const figure = node.closest('figure.wp-block-table') || (table ? table.parentElement : null);
    if (!td || !tr || !table) return null;
    return { td, tr, table, figure };
  };

  const handleAddRow = (below = true) => {
    const ctx = getTableContext();
    if (!ctx) return;
    const { tr } = ctx;
    const colCount = tr.children.length;
    const newTr = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const newTd = document.createElement('td');
      newTd.innerHTML = '&nbsp;';
      newTr.appendChild(newTd);
    }
    if (below) {
      tr.parentNode.insertBefore(newTr, tr.nextSibling);
    } else {
      tr.parentNode.insertBefore(newTr, tr);
    }
    handleInput();
    showToast(below ? 'New row added below' : 'New row added above');
  };

  const handleDeleteRow = () => {
    const ctx = getTableContext();
    if (!ctx) return;
    const { tr, table } = ctx;
    const allRows = table.querySelectorAll('tr');
    if (allRows.length <= 1) {
      handleDeleteTable();
      return;
    }
    tr.remove();
    handleInput();
    showToast('Row deleted');
  };

  const handleAddColumn = (after = true) => {
    const ctx = getTableContext();
    if (!ctx) return;
    const { td, table } = ctx;
    const colIndex = Array.from(td.parentNode.children).indexOf(td);
    const rows = table.querySelectorAll('tr');
    rows.forEach((r) => {
      const isHeaderRow = r.parentNode.tagName.toLowerCase() === 'thead' || r.querySelector('th');
      const newCell = document.createElement(isHeaderRow ? 'th' : 'td');
      newCell.innerHTML = isHeaderRow ? 'Header' : '&nbsp;';
      const refCell = r.children[colIndex];
      if (refCell) {
        if (after) {
          r.insertBefore(newCell, refCell.nextSibling);
        } else {
          r.insertBefore(newCell, refCell);
        }
      } else {
        r.appendChild(newCell);
      }
    });
    handleInput();
    showToast(after ? 'New column added to right' : 'New column added to left');
  };

  const handleDeleteColumn = () => {
    const ctx = getTableContext();
    if (!ctx) return;
    const { td, table } = ctx;
    const colIndex = Array.from(td.parentNode.children).indexOf(td);
    const rows = table.querySelectorAll('tr');
    rows.forEach((r) => {
      if (r.children[colIndex]) {
        r.children[colIndex].remove();
      }
    });
    handleInput();
    showToast('Column deleted');
  };

  const handleDeleteTable = () => {
    const ctx = getTableContext();
    if (!ctx) return;
    const { table, figure } = ctx;
    if (figure && figure.tagName.toLowerCase() === 'figure') {
      figure.remove();
    } else {
      table.remove();
    }
    setIsInsideTable(false);
    handleInput();
    showToast('Table removed');
  };

  // Switch mode with automatic normalization
  const handleSwitchMode = (newMode) => {
    if (mode === 'visual' && editorRef.current) {
      const normalized = cleanPastedHtml(editorRef.current.innerHTML);
      if (onChange) onChange(normalized);
    }
    setMode(newMode);
  };

  // Metrics
  const rawText = (value || '').replace(/<[^>]+>/g, ' ').trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all relative">
      {/* Toast Notification for Pasted/Cleaned Content */}
      {toastMessage && (
        <div className="absolute top-14 right-4 z-50 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white ml-1 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar: Mode Switcher + Live Status */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Mode Title & Stats */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            {mode === 'visual' && (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Visual WYSIWYG Editor</span>
              </>
            )}
            {mode === 'code' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>HTML / Code Source</span>
              </>
            )}
            {mode === 'preview' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Public Article Live Preview</span>
              </>
            )}
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            <strong className="text-yellow-400 font-semibold">{wordCount}</strong> words • ~{readTimeMins} min read
          </span>
        </div>

        {/* Right: Clean Action & Tabs */}
        <div className="flex items-center gap-2">
          {mode === 'visual' && (
            <button
              type="button"
              onClick={handleCleanAllContent}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-semibold flex items-center gap-1.5 border border-yellow-400/20 transition-all cursor-pointer shadow-sm hover:border-yellow-400/50"
              title="Clean & Reformat all pasted tables, documents, and headings"
            >
              <Wand2 className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Clean &amp; Fix Format</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchMode('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'visual'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'code'
                  ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'preview'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second Toolbar Row: Only for Visual Mode */}
      {mode === 'visual' && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-3.5 py-2 flex flex-wrap items-center gap-1.5">
          {/* Format Selector: Paragraph & Headings Pills */}
          <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800">
            {/* Paragraph (P) */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('p');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                currentBlockTag === 'p'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Convert selected text to Paragraph (wp-block-paragraph)"
            >
              <Pilcrow className="w-3 h-3" />
              <span>P</span>
            </button>

            {/* H1 */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('h1');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentBlockTag === 'h1'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800'
              }`}
              title="Heading 1 (wp-block-heading)"
            >
              H1
            </button>

            {/* H2 */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('h2');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentBlockTag === 'h2'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800'
              }`}
              title="Heading 2 (wp-block-heading with #anchor)"
            >
              H2
            </button>

            {/* H3 */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('h3');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentBlockTag === 'h3'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800'
              }`}
              title="Heading 3 (wp-block-heading with #anchor)"
            >
              H3
            </button>

            {/* H4 */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('h4');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentBlockTag === 'h4'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800'
              }`}
              title="Heading 4 (wp-block-heading)"
            >
              H4
            </button>

            {/* Quote */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatBlock('blockquote');
              }}
              className={`p-1 rounded-lg text-xs transition-all cursor-pointer ${
                currentBlockTag === 'blockquote'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800'
              }`}
              title="Quote Block (wp-block-quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Inline Text Styles */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('bold');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('italic');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('underline');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('strikeThrough');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertList('ul');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bullet List (wp-block-list)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertList('ol');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Numbered List (wp-block-list)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyLeft');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyCenter');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyRight');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Link & Table */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openLinkModal();
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeLinkNode || linkModalOpen
                ? 'bg-yellow-400 text-slate-950 font-bold'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Insert / Edit Link (Ctrl+K)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertTable();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            title="Insert Responsive Cricket Table (wp-block-table)"
          >
            <TableIcon className="w-3.5 h-3.5 text-yellow-400" />
            <span>+ Table</span>
          </button>

          {/* Media Library Button */}
          {onOpenMedia && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                onOpenMedia();
              }}
              className="ml-1 px-3 py-1 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Add Image from Media Library (wp-block-image)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
              <span>Add Media</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('undo');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('redo');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dynamic Table Editing Toolbar: Shows when cursor is placed inside any table */}
      {mode === 'visual' && isInsideTable && (
        <div className="bg-yellow-950/40 border-b border-yellow-500/30 px-3.5 py-1.5 flex items-center gap-2 flex-wrap text-xs animate-in fade-in">
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table Tools:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddRow(false);
              }}
              className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Add Row Above"
            >
              + Row Above
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddRow(true);
              }}
              className="px-2 py-1 rounded text-[11px] text-yellow-400 hover:text-yellow-300 hover:bg-slate-800 font-semibold transition cursor-pointer"
              title="Add Row Below"
            >
              + Row Below
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDeleteRow();
              }}
              className="px-2 py-1 rounded text-[11px] text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition cursor-pointer"
              title="Delete Current Row"
            >
              - Row
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddColumn(false);
              }}
              className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Add Column to Left"
            >
              + Col Left
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddColumn(true);
              }}
              className="px-2 py-1 rounded text-[11px] text-yellow-400 hover:text-yellow-300 hover:bg-slate-800 font-semibold transition cursor-pointer"
              title="Add Column to Right"
            >
              + Col Right
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDeleteColumn();
              }}
              className="px-2 py-1 rounded text-[11px] text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition cursor-pointer"
              title="Delete Current Column"
            >
              - Col
            </button>
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleDeleteTable();
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ml-auto"
            title="Delete Entire Table"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete Table</span>
          </button>
        </div>
      )}

      {/* Dynamic Image Editing Toolbar: Shows when any image is clicked/selected */}
      {mode === 'visual' && selectedFigure && selectedFigureProps && (
        <div className="bg-yellow-950/70 border-b border-yellow-500/40 px-3.5 py-2 flex items-center gap-2 flex-wrap text-xs animate-in fade-in slide-in-from-top-1 backdrop-blur-sm">
          {/* Active Badge */}
          <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold pr-1">
            <ImageIcon className="w-4 h-4 text-yellow-400" />
            <span>Image Tools:</span>
          </div>

          {/* Alignment Controls: Left, Center, Right, Full Width */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSetAlignment('alignleft');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedFigureProps.align === 'alignleft'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Float Left: Image sits on left, text wraps on right"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Left</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSetAlignment('aligncenter');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedFigureProps.align === 'aligncenter'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Center: Block image centered on page"
            >
              <AlignCenter className="w-3.5 h-3.5" />
              <span>Center</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSetAlignment('alignright');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedFigureProps.align === 'alignright'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Float Right: Image sits on right, text wraps on left"
            >
              <AlignRight className="w-3.5 h-3.5" />
              <span>Right</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSetAlignment('alignwide');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedFigureProps.align === 'alignwide'
                  ? 'bg-yellow-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Full Width: 100% wide banner"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full</span>
            </button>
          </div>

          {/* Quick Resize Presets */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSetWidth(pct);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedFigureProps.widthPct === pct
                    ? 'bg-yellow-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={`Resize to ${pct}% width`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Smooth Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={selectedFigureProps.widthPct || 100}
              onChange={(e) => handleSetWidth(parseInt(e.target.value, 10))}
              className="w-16 sm:w-24 accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              title="Width Slider"
            />
            <span className="font-mono text-[11px] text-yellow-300 font-bold min-w-[30px]">
              {selectedFigureProps.widthPct}%
            </span>
          </div>

          {/* Alt / SEO Button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleEditAltText();
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Edit Alt Text for Google SEO"
          >
            <Type className="w-3.5 h-3.5 text-yellow-400" />
            <span>Alt / SEO</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleDeleteImage();
            }}
            className="px-2.5 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Delete Image"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Deselect / Close Controls */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              deselectFigure();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-auto"
            title="Deselect Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      {mode === 'visual' && (
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleBlur}
            onPaste={handlePaste}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            onSelect={saveSelection}
            onClick={handleEditorClick}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openLinkModal();
              }
            }}
            placeholder={placeholder}
            className="sports-article-content p-6 sm:p-8 min-h-[480px] max-h-[720px] overflow-y-auto overflow-x-auto text-slate-100 text-sm md:text-base outline-none leading-relaxed focus:ring-1 focus:ring-yellow-400/50 bg-slate-950/60"
          />

          {/* Floating Link Quick Bar on Click (like WordPress inline preview) */}
          {linkPopover && (
            <div
              style={{ top: `${linkPopover.top}px`, left: `${linkPopover.left}px` }}
              className="absolute z-30 bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 flex items-center gap-1.5 text-xs animate-in fade-in duration-150"
            >
              <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 font-mono text-[11px] max-w-[200px] sm:max-w-[260px] truncate">
                <LinkIcon className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span className="truncate">{linkPopover.url}</span>
              </div>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              <button
                type="button"
                onClick={() => openLinkModal(activeLinkNode)}
                className="px-2 py-1 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 transition flex items-center gap-1 font-bold text-[11px]"
                title="Edit Link Settings"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>

              <a
                href={linkPopover.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Open Link in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => handleRemoveLink(activeLinkNode)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                title="Remove Link"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setLinkPopover(null)}
                className="p-1 text-slate-500 hover:text-white transition ml-0.5"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'code' && (
        <div className="relative">
          <textarea
            rows={20}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder="Write raw HTML or article markup..."
            className="w-full p-6 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm outline-none resize-y leading-relaxed focus:ring-1 focus:ring-yellow-400/50 border-0"
            spellCheck={false}
          />
        </div>
      )}

      {mode === 'preview' && (
        <div className="bg-slate-950 flex flex-col min-h-[500px]">
          {/* Preview Viewport Toolbar */}
          <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Device Simulator:</span>
              <span className="text-yellow-400 font-medium">
                {previewDevice === 'desktop'
                  ? 'Desktop View (Full)'
                  : previewDevice === 'tablet'
                  ? 'Tablet View (768px)'
                  : 'Mobile View (390px)'}
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  previewDevice === 'tablet'
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-yellow-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Formatted Article Preview Container */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[700px] flex justify-center bg-slate-950/90">
            <div
              className={`w-full transition-all duration-300 bg-slate-900/40 p-6 md:p-10 rounded-2xl border border-slate-800/80 shadow-2xl overflow-x-auto ${
                previewDevice === 'desktop'
                  ? 'max-w-4xl'
                  : previewDevice === 'tablet'
                  ? 'max-w-2xl'
                  : 'max-w-sm'
              }`}
            >
              {value ? (
                <div
                  className="sports-article-content text-slate-200 text-sm md:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              ) : (
                <div className="py-20 text-center text-slate-500 text-sm italic">
                  No content written yet. Switch back to Visual mode to add text, headings, tables, or images.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WordPress Classic Editor Style Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {linkForm.isExisting ? 'Edit Link' : 'Insert / Add Link'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    WordPress Classic Link Manager
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLinkModalOpen(false);
                  setActiveLinkNode(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleApplyLink} className="p-5 space-y-4">
              {/* URL Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>URL / Web Address</span>
                  <span className="text-[10px] text-yellow-400 font-mono">e.g. https://... or /csk-news/</span>
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden focus-within:border-yellow-400">
                  <span className="px-3 py-2 text-xs text-slate-500 bg-slate-900 border-r border-slate-800 font-mono">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    placeholder="https://superkingsden.com/... or /category/ipl/"
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Quick Suggestions / Internal Content Linking (WordPress Classic feature) */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Internal Links:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { label: 'CSK News', url: '/csk-news/' },
                    { label: 'CSK Team', url: '/csk-team/' },
                    { label: 'Trophies', url: '/csk-trophies/' },
                    { label: 'JSK (SA20)', url: '/joburg-super-kings/' },
                    { label: 'TSK (MLC)', url: '/texas-super-kings/' },
                    { label: 'Standings', url: '/standings/' },
                  ].map((sug) => (
                    <button
                      key={sug.url}
                      type="button"
                      onClick={() => setLinkForm((prev) => ({
                        ...prev,
                        url: sug.url,
                        text: prev.text || sug.label,
                      }))}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-yellow-400/20 text-slate-300 hover:text-yellow-300 border border-slate-800 text-[10px] transition font-medium"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Anchor Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Link Text (Anchor)
                </label>
                <input
                  type="text"
                  value={linkForm.text}
                  onChange={(e) => setLinkForm({ ...linkForm, text: e.target.value })}
                  placeholder="Text to display for this link..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              {/* Open in new tab checkbox */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition">
                <input
                  type="checkbox"
                  checked={linkForm.openInNewTab}
                  onChange={(e) => setLinkForm({ ...linkForm, openInNewTab: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 text-yellow-400 focus:ring-yellow-400 bg-slate-950 cursor-pointer"
                />
                <span className="text-xs text-slate-200 font-medium">
                  Open link in a new tab (target=&quot;_blank&quot;)
                </span>
              </label>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  {linkForm.isExisting && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Remove Link</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkModalOpen(false);
                      setActiveLinkNode(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{linkForm.isExisting ? 'Update Link' : 'Add Link'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Image Alt Text Modal (replaces browser prompt) */}
      {altModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-yellow-400" />
                <span>Image Alt Text (Google SEO)</span>
              </h3>
              <button
                type="button"
                onClick={() => setAltModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAltText} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">
                  Alt Description
                </label>
                <input
                  type="text"
                  autoFocus
                  value={altFormText}
                  onChange={(e) => setAltFormText(e.target.value)}
                  placeholder="Describe this image for screen readers and search engines..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAltModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Alt Text
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default RichTextEditor;
