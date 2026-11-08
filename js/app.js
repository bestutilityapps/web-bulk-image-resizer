/**
 * Best Utility Apps — Bulk Image Resizer Client-Side Application
 * Version: 1.6.4 (Web Edition)
 * 100% In-Browser Execution · Zero Server Uploads · Full Orientation & Batch Logic
 */

(function () {
  'use strict';

  // Supported Extensions (matching original desktop app)
  const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.tiff', '.tif', '.bmp', '.avif', '.webp'];

  // Default Width Presets by Orientation
  const DEFAULT_WIDTHS = {
    horizontal: [1920, 1600, 1280, 1024],
    vertical: [1080, 900, 720],
    square: [1200, 1000, 800]
  };

  const STORAGE_KEY = 'bua_bulk_resizer_settings_v1';

  // ── Application State ──────────────────────────────────────────────────
  const state = {
    queue: [],                 // Array of item objects
    nextId: 1,
    isProcessing: false,
    cancelRequested: false,
    activeTab: 'files',        // 'files' | 'summary'

    // Configuration Settings
    settings: {
      outputFormat: 'original', // 'original' | 'jpg' | 'png' | 'webp'
      quality: 90,
      activeWidths: {
        horizontal: [...DEFAULT_WIDTHS.horizontal],
        vertical: [...DEFAULT_WIDTHS.vertical],
        square: [...DEFAULT_WIDTHS.square]
      },
      stripMetadata: true,
      preserveFolders: true,
      includeOriginals: false,
      renamePrefix: '',
      renameSuffix: ''
    },

    // Session Statistics
    stats: {
      total: 0,
      resized: 0,
      created: 0,
      skipped: 0,
      errors: 0,
      originalBytes: 0,
      outputBytes: 0,
      startTime: null,
      endTime: null
    }
  };

  // ── DOM Element Cache ──────────────────────────────────────────────────
  const DOM = {};

  function initDOMCache() {
    DOM.dropZone = document.getElementById('dropZone');
    DOM.fileInput = document.getElementById('fileInput');
    DOM.folderInput = document.getElementById('folderInput');
    DOM.btnBrowseFiles = document.getElementById('btnBrowseFiles');
    DOM.btnBrowseFolder = document.getElementById('btnBrowseFolder');
    DOM.queueCountBadge = document.getElementById('queueCountBadge');

    DOM.formatSeg = document.getElementById('formatSeg');
    DOM.qualityRow = document.getElementById('qualityRow');
    DOM.qualitySlider = document.getElementById('qualitySlider');
    DOM.qualityVal = document.getElementById('qualityVal');

    DOM.chipsHorizontal = document.getElementById('chipsHorizontal');
    DOM.chipsVertical = document.getElementById('chipsVertical');
    DOM.chipsSquare = document.getElementById('chipsSquare');
    DOM.customInputHorizontal = document.getElementById('customInputHorizontal');
    DOM.customInputVertical = document.getElementById('customInputVertical');
    DOM.customInputSquare = document.getElementById('customInputSquare');
    DOM.btnAddHorizontal = document.getElementById('btnAddHorizontal');
    DOM.btnAddVertical = document.getElementById('btnAddVertical');
    DOM.btnAddSquare = document.getElementById('btnAddSquare');

    DOM.countHorizontal = document.getElementById('countHorizontal');
    DOM.countVertical = document.getElementById('countVertical');
    DOM.countSquare = document.getElementById('countSquare');

    DOM.toggleStripMeta = document.getElementById('toggleStripMeta');
    DOM.togglePreserveFolders = document.getElementById('togglePreserveFolders');
    DOM.toggleIncludeOriginals = document.getElementById('toggleIncludeOriginals');

    DOM.renamePrefix = document.getElementById('renamePrefix');
    DOM.renameSuffix = document.getElementById('renameSuffix');
    DOM.renamePreview = document.getElementById('renamePreview');

    DOM.btnResize = document.getElementById('btnResize');
    DOM.btnResizeText = document.getElementById('btnResizeText');
    DOM.btnCancel = document.getElementById('btnCancel');

    DOM.tabBtnFiles = document.getElementById('tabBtnFiles');
    DOM.tabBtnSummary = document.getElementById('tabBtnSummary');
    DOM.tabPillFiles = document.getElementById('tabPillFiles');
    DOM.btnClearAll = document.getElementById('btnClearAll');

    DOM.statTotal = document.getElementById('statTotal');
    DOM.statResized = document.getElementById('statResized');
    DOM.statCreated = document.getElementById('statCreated');
    DOM.statSkipped = document.getElementById('statSkipped');
    DOM.statSaved = document.getElementById('statSaved');

    DOM.progressWrap = document.getElementById('progressWrap');
    DOM.progressStatus = document.getElementById('progressStatus');
    DOM.progressCount = document.getElementById('progressCount');
    DOM.progressFill = document.getElementById('progressFill');

    DOM.panelFiles = document.getElementById('panelFiles');
    DOM.emptyQueueState = document.getElementById('emptyQueueState');
    DOM.fileQueueList = document.getElementById('fileQueueList');

    DOM.panelSummary = document.getElementById('panelSummary');
    DOM.emptySummaryState = document.getElementById('emptySummaryState');
    DOM.summaryDashboard = document.getElementById('summaryDashboard');
    DOM.summaryTotalImages = document.getElementById('summaryTotalImages');
    DOM.summaryOrientationBreakdown = document.getElementById('summaryOrientationBreakdown');
    DOM.summaryFilesCreated = document.getElementById('summaryFilesCreated');
    DOM.summaryAvgPerFile = document.getElementById('summaryAvgPerFile');
    DOM.summarySpaceSaved = document.getElementById('summarySpaceSaved');
    DOM.summaryCompressionRatio = document.getElementById('summaryCompressionRatio');

    DOM.chartSegHorizontal = document.getElementById('chartSegHorizontal');
    DOM.chartSegVertical = document.getElementById('chartSegVertical');
    DOM.chartSegSquare = document.getElementById('chartSegSquare');
    DOM.chartSegSkipped = document.getElementById('chartSegSkipped');
    DOM.legendCountH = document.getElementById('legendCountH');
    DOM.legendCountV = document.getElementById('legendCountV');
    DOM.legendCountS = document.getElementById('legendCountS');
    DOM.legendCountSkip = document.getElementById('legendCountSkip');

    DOM.globalStatusDot = document.getElementById('globalStatusDot');
    DOM.globalStatusText = document.getElementById('globalStatusText');
    DOM.btnExportCSV = document.getElementById('btnExportCSV');
    DOM.btnDownloadZip = document.getElementById('btnDownloadZip');

    DOM.previewModal = document.getElementById('previewModal');
    DOM.previewModalTitle = document.getElementById('previewModalTitle');
    DOM.previewModalMeta = document.getElementById('previewModalMeta');
    DOM.previewModalImg = document.getElementById('previewModalImg');
    DOM.previewModalSizes = document.getElementById('previewModalSizes');

    DOM.toast = document.getElementById('toast');
  }

  // ── Settings Persistence ──────────────────────────────────────────────
  function loadPersistedSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.outputFormat) state.settings.outputFormat = parsed.outputFormat;
        if (parsed.quality) state.settings.quality = parseInt(parsed.quality, 10);
        if (parsed.activeWidths) {
          state.settings.activeWidths = {
            horizontal: Array.isArray(parsed.activeWidths.horizontal) ? parsed.activeWidths.horizontal : [...DEFAULT_WIDTHS.horizontal],
            vertical: Array.isArray(parsed.activeWidths.vertical) ? parsed.activeWidths.vertical : [...DEFAULT_WIDTHS.vertical],
            square: Array.isArray(parsed.activeWidths.square) ? parsed.activeWidths.square : [...DEFAULT_WIDTHS.square]
          };
        }
        if (typeof parsed.stripMetadata === 'boolean') state.settings.stripMetadata = parsed.stripMetadata;
        if (typeof parsed.preserveFolders === 'boolean') state.settings.preserveFolders = parsed.preserveFolders;
        if (typeof parsed.includeOriginals === 'boolean') state.settings.includeOriginals = parsed.includeOriginals;
      }
    } catch (e) {
      console.warn('[Settings] Failed to load from localStorage:', e);
    }
  }

  function savePersistedSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        outputFormat: state.settings.outputFormat,
        quality: state.settings.quality,
        activeWidths: state.settings.activeWidths,
        stripMetadata: state.settings.stripMetadata,
        preserveFolders: state.settings.preserveFolders,
        includeOriginals: state.settings.includeOriginals
      }));
    } catch (e) {}
  }

  // ── Helper Utilities ──────────────────────────────────────────────────
  function sanitizeToken(str) {
    return str ? String(str).replace(/[^a-zA-Z0-9_\-]/g, '') : '';
  }

  function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function showToast(message, duration = 3000) {
    if (!DOM.toast) return;
    DOM.toast.textContent = message;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._timer);
    DOM.toast._timer = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, duration);
  }

  function isSupportedFile(file) {
    if (!file) return false;
    const name = typeof file === 'string' ? file : (file.name || '');
    const ext = name.includes('.') ? ('.' + name.split('.').pop().toLowerCase()) : '';
    if (SUPPORTED_EXTS.includes(ext)) return true;
    if (typeof file === 'object' && file.type && file.type.startsWith('image/')) return true;
    return false;
  }

  function classifyOrientation(width, height) {
    if (!width || !height) return 'horizontal';
    const ratio = width / height;
    if (ratio > 1.05) return 'horizontal';
    if (ratio < 0.95) return 'vertical';
    return 'square';
  }

  // ── Rendering Controls & UI ───────────────────────────────────────────
  function applySettingsToUI() {
    // Format buttons
    const formatBtns = DOM.formatSeg.querySelectorAll('.format-btn');
    formatBtns.forEach(btn => {
      const fmt = btn.getAttribute('data-format');
      const isActive = fmt === state.settings.outputFormat;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Quality slider visibility
    const showQuality = state.settings.outputFormat === 'jpg' || state.settings.outputFormat === 'webp';
    DOM.qualityRow.style.display = showQuality ? 'flex' : 'none';
    DOM.qualitySlider.value = state.settings.quality;
    DOM.qualityVal.textContent = state.settings.quality + '%';

    // Toggles
    DOM.toggleStripMeta.checked = state.settings.stripMetadata;
    DOM.togglePreserveFolders.checked = state.settings.preserveFolders;
    DOM.toggleIncludeOriginals.checked = state.settings.includeOriginals;

    // Renaming fields
    DOM.renamePrefix.value = state.settings.renamePrefix;
    DOM.renameSuffix.value = state.settings.renameSuffix;
    updateRenamePreview();

    // Render orientation chips
    renderOrientationChips('horizontal', DOM.chipsHorizontal);
    renderOrientationChips('vertical', DOM.chipsVertical);
    renderOrientationChips('square', DOM.chipsSquare);
  }

  function renderOrientationChips(orientation, container) {
    container.textContent = '';
    const activeList = state.settings.activeWidths[orientation] || [];
    const defaults = DEFAULT_WIDTHS[orientation];

    // Combine defaults and any custom active widths into unique sorted list (descending)
    const allKnown = [...new Set([...defaults, ...activeList])].sort((a, b) => b - a);

    allKnown.forEach(w => {
      const isDefault = defaults.includes(w);
      const isActive = activeList.includes(w);

      const chip = document.createElement('div');
      chip.className = 'chip' + (isActive ? ' active' : '') + (!isDefault ? ' custom-chip' : '');
      chip.textContent = w + 'px';

      // Toggle width
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip-remove')) return;
        toggleWidth(orientation, w);
      });

      // Remove button for custom widths
      if (!isDefault) {
        const removeBtn = document.createElement('span');
        removeBtn.className = 'chip-remove';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove custom width';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeCustomWidth(orientation, w);
        });
        chip.appendChild(removeBtn);
      }

      container.appendChild(chip);
    });
  }

  function toggleWidth(orientation, width) {
    const list = state.settings.activeWidths[orientation];
    const idx = list.indexOf(width);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(width);
      list.sort((a, b) => b - a);
    }
    savePersistedSettings();
    renderOrientationChips(orientation, getChipContainer(orientation));
    updateFileQueueItemsTargetWidths();
    updateMainActionBtn();
  }

  function addCustomWidth(orientation, inputEl) {
    const val = parseInt(inputEl.value, 10);
    if (!val || val < 10 || val > 16000) {
      showToast('Please enter a valid width between 10px and 16000px');
      return;
    }

    const list = state.settings.activeWidths[orientation];
    if (!list.includes(val)) {
      list.push(val);
      list.sort((a, b) => b - a);
      savePersistedSettings();
    }
    inputEl.value = '';
    renderOrientationChips(orientation, getChipContainer(orientation));
    updateFileQueueItemsTargetWidths();
    updateMainActionBtn();
    showToast(`Added ${val}px to ${orientation} presets`);
  }

  function removeCustomWidth(orientation, width) {
    const list = state.settings.activeWidths[orientation];
    const idx = list.indexOf(width);
    if (idx >= 0) {
      list.splice(idx, 1);
      savePersistedSettings();
    }
    renderOrientationChips(orientation, getChipContainer(orientation));
    updateFileQueueItemsTargetWidths();
    updateMainActionBtn();
  }

  function getChipContainer(orientation) {
    if (orientation === 'horizontal') return DOM.chipsHorizontal;
    if (orientation === 'vertical') return DOM.chipsVertical;
    return DOM.chipsSquare;
  }

  function updateRenamePreview() {
    const prefix = sanitizeToken(DOM.renamePrefix.value);
    const suffix = sanitizeToken(DOM.renameSuffix.value);
    state.settings.renamePrefix = prefix;
    state.settings.renameSuffix = suffix;

    let ext = '.jpg';
    if (state.settings.outputFormat === 'png') ext = '.png';
    else if (state.settings.outputFormat === 'webp') ext = '.webp';

    const pPart = prefix ? prefix + '-' : '';
    const sPart = suffix ? '-' + suffix : '';
    DOM.renamePreview.textContent = `${pPart}sample-photo${sPart}-1920w${ext}`;
  }

  // ── Image Ingestion Pipeline ──────────────────────────────────────────
  async function ingestFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    // Automatically switch to files tab so user sees the images immediately
    switchTab('files');

    let addedCount = 0;
    const entries = Array.from(fileList);

    DOM.globalStatusDot.className = 'status-indicator-dot busy';
    DOM.globalStatusText.textContent = `Analyzing ${entries.length} images...`;

    for (const file of entries) {
      if (!isSupportedFile(file)) continue;

      const relativePath = file.customRelativePath || file.webkitRelativePath || file.name;
      const id = 'img_' + (state.nextId++);

      // Extract image dimensions asynchronously
      try {
        const meta = await loadImageMeta(file);
        const orientation = classifyOrientation(meta.width, meta.height);

        const item = {
          id,
          file,
          name: file.name,
          relativePath,
          size: file.size,
          type: file.type || 'image/jpeg',
          width: meta.width,
          height: meta.height,
          orientation,
          thumbUrl: meta.objectUrl,
          status: 'pending', // 'pending' | 'resizing' | 'done' | 'skipped' | 'error'
          skipReason: '',
          outputFiles: [],
          totalOutputBytes: 0
        };

        state.queue.push(item);
        addedCount++;
        renderQueueItem(item);
      } catch (err) {
        console.warn('Could not read image metadata for', file.name, err);
      }
    }

    DOM.globalStatusDot.className = 'status-indicator-dot';
    DOM.globalStatusText.textContent = state.queue.length > 0 ? 'Ready for batch resizing' : 'Ready for images';

    updateGlobalStats();
    updateMainActionBtn();

    if (addedCount > 0) {
      showToast(`Added ${addedCount} image${addedCount > 1 ? 's' : ''} to queue`);
    } else {
      showToast('No supported images found in selection.');
    }
  }

  function loadImageMeta(file) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      let settled = false;

      img.onload = () => {
        if (settled) return;
        settled = true;
        resolve({
          width: img.naturalWidth || img.width || 800,
          height: img.naturalHeight || img.height || 600,
          objectUrl
        });
      };

      img.onerror = () => {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to decode image data'));
      };

      img.src = objectUrl;

      // In case image was decoded synchronously / cached
      if (img.complete && img.naturalWidth > 0) {
        img.onload();
      }
    });
  }

  // Robust File and Directory Extraction for Drag & Drop
  async function extractDroppedFiles(dataTransfer) {
    if (!dataTransfer) return [];

    // Capture items synchronously before any async operations, as browser may clear dataTransfer
    const items = dataTransfer.items ? Array.from(dataTransfer.items) : [];
    const entries = [];
    let hasDirectory = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.kind === 'file') {
        if (typeof item.webkitGetAsEntry === 'function') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            entries.push(entry);
            if (entry.isDirectory) hasDirectory = true;
          }
        }
      }
    }

    // If NO directories were dropped (standard single/multi image drag-and-drop),
    // dataTransfer.files is 100% reliable, synchronous, and complete!
    if (!hasDirectory && dataTransfer.files && dataTransfer.files.length > 0) {
      return Array.from(dataTransfer.files);
    }

    // If folders exist, traverse recursively
    const collectedFiles = [];

    async function traverseEntry(entry, path = '') {
      if (!entry) return;
      if (entry.isFile) {
        try {
          const file = await new Promise((resolve, reject) => {
            entry.file(resolve, reject);
          });
          file.customRelativePath = path ? path + '/' + file.name : file.name;
          collectedFiles.push(file);
        } catch (err) {
          console.warn('Error reading entry file:', entry.name, err);
        }
      } else if (entry.isDirectory) {
        try {
          const dirReader = entry.createReader();
          const readAllEntries = () => new Promise((resolve) => {
            const all = [];
            function read() {
              dirReader.readEntries((batch) => {
                if (!batch || batch.length === 0) resolve(all);
                else {
                  all.push(...batch);
                  read();
                }
              }, () => resolve(all));
            }
            read();
          });
          const children = await readAllEntries();
          const currentPath = path ? path + '/' + entry.name : entry.name;
          for (const child of children) {
            await traverseEntry(child, currentPath);
          }
        } catch (err) {
          console.warn('Error reading directory:', entry.name, err);
        }
      }
    }

    if (entries.length > 0) {
      for (const entry of entries) {
        await traverseEntry(entry);
      }
    }

    if (collectedFiles.length > 0) {
      return collectedFiles;
    }

    return dataTransfer.files ? Array.from(dataTransfer.files) : [];
  }

  // ── Queue UI Updates ──────────────────────────────────────────────────
  function renderQueueItem(item) {
    DOM.emptyQueueState.style.display = 'none';
    DOM.fileQueueList.style.display = 'flex';

    const row = document.createElement('div');
    row.className = 'file-queue-item';
    row.id = 'item_' + item.id;

    // Thumbnail
    const thumbBox = document.createElement('div');
    thumbBox.className = 'item-thumb-box';
    thumbBox.title = 'Click to view high-res preview';
    const thumbImg = document.createElement('img');
    thumbImg.className = 'item-thumb-img';
    thumbImg.src = item.thumbUrl;
    thumbImg.alt = item.name;
    thumbBox.appendChild(thumbImg);
    thumbBox.addEventListener('click', () => openPreviewModal(item));

    // Info Center
    const info = document.createElement('div');
    info.className = 'item-info';

    const nameRow = document.createElement('div');
    nameRow.className = 'item-name-row';

    const nameEl = document.createElement('span');
    nameEl.className = 'item-name';
    nameEl.textContent = item.name;
    nameEl.title = item.relativePath;

    const orientPill = document.createElement('span');
    orientPill.className = `orient-pill ${item.orientation}`;
    orientPill.textContent = item.orientation;

    nameRow.appendChild(nameEl);
    nameRow.appendChild(orientPill);

    const metaRow = document.createElement('div');
    metaRow.className = 'item-meta-row';

    const dimText = document.createElement('span');
    dimText.className = 'item-dims';
    dimText.textContent = `${item.width} × ${item.height} px`;

    const sizeText = document.createElement('span');
    sizeText.className = 'item-size';
    sizeText.textContent = formatBytes(item.size);

    const targetTags = document.createElement('div');
    targetTags.className = 'item-widths-tags';
    targetTags.id = `tags_${item.id}`;

    metaRow.appendChild(dimText);
    metaRow.appendChild(document.createTextNode('•'));
    metaRow.appendChild(sizeText);
    metaRow.appendChild(document.createTextNode('•'));
    metaRow.appendChild(targetTags);

    info.appendChild(nameRow);
    info.appendChild(metaRow);

    // Status Column
    const statusCol = document.createElement('div');
    statusCol.className = 'item-status-col';

    const statusTag = document.createElement('span');
    statusTag.className = 'status-tag status-pending';
    statusTag.id = `status_${item.id}`;
    statusTag.textContent = 'Pending';
    statusCol.appendChild(statusTag);

    // Actions
    const actionBtns = document.createElement('div');
    actionBtns.className = 'item-action-btns';

    const btnDownload = document.createElement('button');
    btnDownload.type = 'button';
    btnDownload.className = 'btn-item-action download';
    btnDownload.title = 'Download generated sizes';
    btnDownload.disabled = true;
    btnDownload.id = `dl_${item.id}`;
    btnDownload.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;
    btnDownload.addEventListener('click', () => downloadItemSizes(item));

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-item-action remove';
    btnRemove.title = 'Remove image';
    btnRemove.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    btnRemove.addEventListener('click', () => removeQueueItem(item.id));

    actionBtns.appendChild(btnDownload);
    actionBtns.appendChild(btnRemove);

    row.appendChild(thumbBox);
    row.appendChild(info);
    row.appendChild(statusCol);
    row.appendChild(actionBtns);

    DOM.fileQueueList.appendChild(row);
    updateItemTargetWidthsTags(item);
  }

  function updateItemTargetWidthsTags(item) {
    const container = document.getElementById(`tags_${item.id}`);
    if (!container) return;
    container.textContent = '';

    const activeList = state.settings.activeWidths[item.orientation] || [];
    const validWidths = activeList.filter(w => w < item.width);

    if (validWidths.length === 0) {
      const noneTag = document.createElement('span');
      noneTag.className = 'width-tag';
      noneTag.textContent = activeList.length === 0 ? 'No widths set' : 'Skip (smaller than targets)';
      container.appendChild(noneTag);
      return;
    }

    validWidths.forEach(w => {
      const tag = document.createElement('span');
      tag.className = 'width-tag' + (item.status === 'done' ? ' generated' : '');
      tag.textContent = `${w}w`;
      container.appendChild(tag);
    });
  }

  function updateFileQueueItemsTargetWidths() {
    state.queue.forEach(item => {
      if (item.status === 'pending') {
        updateItemTargetWidthsTags(item);
      }
    });
  }

  function removeQueueItem(id) {
    const idx = state.queue.findIndex(item => item.id === id);
    if (idx >= 0) {
      const item = state.queue[idx];
      if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl);
      if (item.outputFiles) {
        item.outputFiles.forEach(f => URL.revokeObjectURL(f.url));
      }
      state.queue.splice(idx, 1);
      const row = document.getElementById('item_' + id);
      if (row) row.remove();
      updateGlobalStats();
      updateMainActionBtn();
    }

    if (state.queue.length === 0) {
      DOM.emptyQueueState.style.display = 'flex';
      DOM.fileQueueList.style.display = 'none';
      DOM.emptySummaryState.style.display = 'flex';
      DOM.summaryDashboard.style.display = 'none';
    }
  }

  function clearAllQueue() {
    if (state.isProcessing) return;
    state.queue.forEach(item => {
      if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl);
      if (item.outputFiles) {
        item.outputFiles.forEach(f => URL.revokeObjectURL(f.url));
      }
    });
    state.queue = [];
    DOM.fileQueueList.textContent = '';
    DOM.emptyQueueState.style.display = 'flex';
    DOM.fileQueueList.style.display = 'none';
    DOM.emptySummaryState.style.display = 'flex';
    DOM.summaryDashboard.style.display = 'none';

    updateGlobalStats();
    updateMainActionBtn();
    showToast('Queue cleared.');
  }

  function updateGlobalStats() {
    const total = state.queue.length;
    let horizontalCount = 0;
    let verticalCount = 0;
    let squareCount = 0;
    let doneCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let errorsCount = 0;
    let totalOriginalBytes = 0;
    let totalOutputBytes = 0;

    state.queue.forEach(item => {
      totalOriginalBytes += item.size;
      if (item.orientation === 'horizontal') horizontalCount++;
      else if (item.orientation === 'vertical') verticalCount++;
      else squareCount++;

      if (item.status === 'done') {
        doneCount++;
        createdCount += item.outputFiles.length;
        totalOutputBytes += item.totalOutputBytes;
      } else if (item.status === 'skipped') {
        skippedCount++;
      } else if (item.status === 'error') {
        errorsCount++;
      }
    });

    state.stats.total = total;
    state.stats.resized = doneCount;
    state.stats.created = createdCount;
    state.stats.skipped = skippedCount;
    state.stats.errors = errorsCount;
    state.stats.originalBytes = totalOriginalBytes;
    state.stats.outputBytes = totalOutputBytes;

    // Badges & Orientation counts
    DOM.queueCountBadge.textContent = `${total} file${total === 1 ? '' : 's'}`;
    DOM.tabPillFiles.textContent = total;
    DOM.countHorizontal.textContent = `${horizontalCount} image${horizontalCount === 1 ? '' : 's'}`;
    DOM.countVertical.textContent = `${verticalCount} image${verticalCount === 1 ? '' : 's'}`;
    DOM.countSquare.textContent = `${squareCount} image${squareCount === 1 ? '' : 's'}`;

    // Stat Pills
    DOM.statTotal.textContent = total;
    DOM.statResized.textContent = doneCount;
    DOM.statCreated.textContent = createdCount;
    DOM.statSkipped.textContent = skippedCount;

    const netSaved = totalOutputBytes > 0 && totalOriginalBytes > totalOutputBytes
      ? totalOriginalBytes - totalOutputBytes
      : 0;
    DOM.statSaved.textContent = netSaved > 0 ? formatBytes(netSaved) : '0 KB';

    // Summary Dashboard Updates
    DOM.summaryTotalImages.textContent = total;
    DOM.summaryOrientationBreakdown.textContent = `${horizontalCount} horizontal · ${verticalCount} vertical · ${squareCount} square`;
    DOM.summaryFilesCreated.textContent = createdCount;
    const avgPerFile = doneCount > 0 ? (createdCount / doneCount).toFixed(1) : '0';
    DOM.summaryAvgPerFile.textContent = `Avg ${avgPerFile} sizes generated per resized image`;
    DOM.summarySpaceSaved.textContent = formatBytes(netSaved);

    const ratioPercent = totalOriginalBytes > 0 && netSaved > 0
      ? Math.round((netSaved / totalOriginalBytes) * 100)
      : 0;
    DOM.summaryCompressionRatio.textContent = `${ratioPercent}% total size reduction`;

    // Orientation Breakdown Bar Chart
    if (total > 0) {
      const pctH = ((horizontalCount / total) * 100).toFixed(1);
      const pctV = ((verticalCount / total) * 100).toFixed(1);
      const pctS = ((squareCount / total) * 100).toFixed(1);
      const pctSkip = ((skippedCount / total) * 100).toFixed(1);

      DOM.chartSegHorizontal.style.width = pctH + '%';
      DOM.chartSegVertical.style.width = pctV + '%';
      DOM.chartSegSquare.style.width = pctS + '%';
      DOM.chartSegSkipped.style.width = pctSkip + '%';

      DOM.legendCountH.textContent = horizontalCount;
      DOM.legendCountV.textContent = verticalCount;
      DOM.legendCountS.textContent = squareCount;
      DOM.legendCountSkip.textContent = skippedCount;
    }

    DOM.btnClearAll.disabled = total === 0 || state.isProcessing;
    DOM.btnExportCSV.disabled = doneCount === 0 && skippedCount === 0;
    DOM.btnDownloadZip.disabled = createdCount === 0;
  }

  function updateMainActionBtn() {
    const total = state.queue.length;
    const hasAnyWidths =
      state.settings.activeWidths.horizontal.length > 0 ||
      state.settings.activeWidths.vertical.length > 0 ||
      state.settings.activeWidths.square.length > 0;

    const canResize = total > 0 && hasAnyWidths && !state.isProcessing;
    DOM.btnResize.disabled = !canResize;
    DOM.btnResizeText.textContent = total > 0 ? `Resize ${total} Image${total === 1 ? '' : 's'}` : 'Resize Images';
  }

  // ── High-Quality Canvas Resizing Engine ────────────────────────────────
  // Uses multi-step downscaling for razor-sharp fidelity and no pixelation
  function resizeImageToCanvas(sourceImg, targetW, targetH) {
    let currentCanvas = document.createElement('canvas');
    let currentCtx = currentCanvas.getContext('2d');

    let curW = sourceImg.naturalWidth || sourceImg.width;
    let curH = sourceImg.naturalHeight || sourceImg.height;

    currentCanvas.width = curW;
    currentCanvas.height = curH;
    currentCtx.drawImage(sourceImg, 0, 0);

    // Multi-step half-size downsampling until within 2x of target size
    while (curW / 2 > targetW) {
      const stepW = Math.round(curW / 2);
      const stepH = Math.round(curH / 2);
      const nextCanvas = document.createElement('canvas');
      const nextCtx = nextCanvas.getContext('2d');
      nextCanvas.width = stepW;
      nextCanvas.height = stepH;

      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(currentCanvas, 0, 0, stepW, stepH);

      currentCanvas = nextCanvas;
      currentCtx = nextCtx;
      curW = stepW;
      curH = stepH;
    }

    // Final precision scale down to target dimension
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);

    return finalCanvas;
  }

  function resolveMimeAndExtension(sourceType, sourceName, outputFormat) {
    if (outputFormat === 'jpg') return { mime: 'image/jpeg', ext: '.jpg' };
    if (outputFormat === 'png') return { mime: 'image/png', ext: '.png' };
    if (outputFormat === 'webp') return { mime: 'image/webp', ext: '.webp' };

    // 'original' mode: preserve if common web format, or fallback to PNG for BMP/TIFF/GIF
    const ext = '.' + sourceName.split('.').pop().toLowerCase();
    if (['.jpg', '.jpeg', '.jfif'].includes(ext)) return { mime: 'image/jpeg', ext: '.jpg' };
    if (ext === '.webp') return { mime: 'image/webp', ext: '.webp' };
    return { mime: 'image/png', ext: '.png' };
  }

  function buildOutputFilename(baseName, prefix, suffix, width, ext) {
    const pPart = prefix ? prefix + '-' : '';
    const sPart = suffix ? '-' + suffix : '';
    return `${pPart}${baseName}${sPart}-${width}w${ext}`;
  }

  // ── Core Batch Execution ──────────────────────────────────────────────
  async function startBatchResize() {
    if (state.isProcessing || state.queue.length === 0) return;

    state.isProcessing = true;
    state.cancelRequested = false;

    DOM.btnResize.style.display = 'none';
    DOM.btnCancel.style.display = 'inline-flex';
    DOM.progressWrap.style.display = 'block';

    DOM.globalStatusDot.className = 'status-indicator-dot busy';
    DOM.globalStatusText.textContent = 'Batch resizing in progress...';

    // Switch to Files tab
    switchTab('files');

    const total = state.queue.length;
    let completedCount = 0;

    for (let i = 0; i < total; i++) {
      if (state.cancelRequested) {
        showToast('Batch resizing cancelled by user.');
        break;
      }

      const item = state.queue[i];

      // Update item UI to resizing
      item.status = 'resizing';
      updateItemStatusUI(item);

      // Determine valid target widths for this image
      const configuredWidths = state.settings.activeWidths[item.orientation] || [];
      const validWidths = configuredWidths.filter(w => w < item.width);

      if (configuredWidths.length === 0) {
        item.status = 'skipped';
        item.skipReason = 'No target widths configured for this orientation';
        updateItemStatusUI(item);
        completedCount++;
        updateProgress(completedCount, total, item.name);
        continue;
      }

      if (validWidths.length === 0) {
        item.status = 'skipped';
        item.skipReason = `Source width (${item.width}px) is smaller than target widths (${configuredWidths.join(', ')}px)`;
        updateItemStatusUI(item);
        completedCount++;
        updateProgress(completedCount, total, item.name);
        continue;
      }

      // Load original image into DOM Image for canvas operations
      try {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Failed to load image for rendering'));
          el.src = item.thumbUrl;
        });

        // Clean base name
        const cleanBaseName = sanitizeToken(item.name.replace(/\.[^/.]+$/, '')) || 'image';
        const { mime, ext } = resolveMimeAndExtension(item.type, item.name, state.settings.outputFormat);
        const qualityParam = (mime === 'image/jpeg' || mime === 'image/webp') ? (state.settings.quality / 100) : undefined;

        item.outputFiles = [];
        let itemBytes = 0;

        for (const targetW of validWidths) {
          if (state.cancelRequested) break;

          const targetH = Math.round((item.height / item.width) * targetW);
          const canvas = resizeImageToCanvas(img, targetW, targetH);

          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, mime, qualityParam);
          });

          if (blob) {
            const outName = buildOutputFilename(
              cleanBaseName,
              state.settings.renamePrefix,
              state.settings.renameSuffix,
              targetW,
              ext
            );

            item.outputFiles.push({
              name: outName,
              width: targetW,
              height: targetH,
              blob,
              url: URL.createObjectURL(blob),
              size: blob.size
            });

            itemBytes += blob.size;
          }
        }

        if (state.cancelRequested) {
          item.status = 'pending';
          updateItemStatusUI(item);
          break;
        }

        item.status = 'done';
        item.totalOutputBytes = itemBytes;
        updateItemStatusUI(item);

      } catch (err) {
        console.error('Error resizing', item.name, err);
        item.status = 'error';
        item.skipReason = err.message || 'Processing failed';
        updateItemStatusUI(item);
      }

      completedCount++;
      updateProgress(completedCount, total, item.name);
      updateGlobalStats();

      // Yield event loop to ensure smooth 60fps UI
      await new Promise(r => setTimeout(r, 0));
    }

    // Wrap up
    state.isProcessing = false;
    DOM.btnResize.style.display = 'inline-flex';
    DOM.btnCancel.style.display = 'none';
    DOM.progressWrap.style.display = 'none';

    DOM.globalStatusDot.className = 'status-indicator-dot';
    DOM.globalStatusText.textContent = state.cancelRequested ? 'Batch cancelled' : 'Batch complete';

    updateGlobalStats();
    updateMainActionBtn();

    if (!state.cancelRequested) {
      showToast(`Batch completed! Created ${state.stats.created} resized images.`);
      // Show summary dashboard
      DOM.emptySummaryState.style.display = 'none';
      DOM.summaryDashboard.style.display = 'flex';
    }
  }

  function cancelBatch() {
    state.cancelRequested = true;
    DOM.btnCancel.textContent = 'Cancelling...';
    DOM.btnCancel.disabled = true;
  }

  function updateProgress(done, total, currentFileName) {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    DOM.progressFill.style.width = pct + '%';
    DOM.progressCount.textContent = `${done} / ${total} (${pct}%)`;
    DOM.progressStatus.textContent = `Resizing: ${currentFileName}`;
  }

  function updateItemStatusUI(item) {
    const statusEl = document.getElementById(`status_${item.id}`);
    const dlBtn = document.getElementById(`dl_${item.id}`);
    if (!statusEl) return;

    statusEl.className = 'status-tag status-' + item.status;

    if (item.status === 'pending') {
      statusEl.textContent = 'Pending';
    } else if (item.status === 'resizing') {
      statusEl.textContent = 'Resizing...';
    } else if (item.status === 'done') {
      statusEl.textContent = `Done (${item.outputFiles.length} sizes)`;
      if (dlBtn) dlBtn.disabled = false;
    } else if (item.status === 'skipped') {
      statusEl.textContent = 'Skipped';
      statusEl.title = item.skipReason;
    } else if (item.status === 'error') {
      statusEl.textContent = 'Error';
      statusEl.title = item.skipReason;
    }

    updateItemTargetWidthsTags(item);
  }

  // ── Download & Export Logic ───────────────────────────────────────────
  function triggerDirectDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  function downloadItemSizes(item) {
    if (!item.outputFiles || item.outputFiles.length === 0) return;
    if (item.outputFiles.length === 1) {
      triggerDirectDownload(item.outputFiles[0].blob, item.outputFiles[0].name);
      showToast(`Downloaded ${item.outputFiles[0].name}`);
    } else {
      openPreviewModal(item);
    }
  }

  async function downloadBatchZip() {
    if (typeof JSZip === 'undefined') {
      showToast('ZIP library loading error. Please refresh the page.');
      return;
    }

    const zip = new JSZip();
    let fileCount = 0;

    DOM.globalStatusDot.className = 'status-indicator-dot busy';
    DOM.globalStatusText.textContent = 'Creating ZIP package...';

    const preserveFolders = state.settings.preserveFolders;
    const includeOriginals = state.settings.includeOriginals;

    state.queue.forEach(item => {
      if (item.status === 'done' && item.outputFiles) {
        let folderPath = '';
        if (preserveFolders && item.relativePath.includes('/')) {
          folderPath = item.relativePath.substring(0, item.relativePath.lastIndexOf('/'));
        }

        item.outputFiles.forEach(out => {
          const zipPath = folderPath ? `${folderPath}/${out.name}` : out.name;
          zip.file(zipPath, out.blob);
          fileCount++;
        });

        if (includeOriginals && item.file) {
          const origPath = folderPath ? `originals_backup/${folderPath}/${item.name}` : `originals_backup/${item.name}`;
          zip.file(origPath, item.file);
        }
      }
    });

    if (fileCount === 0) {
      showToast('No resized files to package.');
      return;
    }

    try {
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        DOM.globalStatusText.textContent = `Packaging ZIP: ${Math.round(metadata.percent)}%`;
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `bulk-image-resizer-${timestamp}.zip`;

      triggerDirectDownload(zipBlob, filename);
      showToast(`Downloaded ZIP containing ${fileCount} images!`);
    } catch (err) {
      console.error('ZIP generation failed', err);
      showToast('Failed to create ZIP archive: ' + err.message);
    } finally {
      DOM.globalStatusDot.className = 'status-indicator-dot';
      DOM.globalStatusText.textContent = 'Ready';
    }
  }

  function exportCsvReport() {
    const rows = [
      ['File Name', 'Relative Path', 'Orientation', 'Status', 'Sizes Generated', 'Original Dimensions', 'Original Size (KB)', 'Output Size (KB)', 'Savings (KB)', 'Savings (%)']
    ];

    state.queue.forEach(item => {
      const sizesStr = item.outputFiles && item.outputFiles.length > 0
        ? item.outputFiles.map(f => `${f.width}w`).join(' | ')
        : (item.skipReason || 'None');

      const origKb = (item.size / 1024).toFixed(1);
      const outKb = item.totalOutputBytes > 0 ? (item.totalOutputBytes / 1024).toFixed(1) : '0';
      const netKb = item.size > item.totalOutputBytes && item.totalOutputBytes > 0
        ? ((item.size - item.totalOutputBytes) / 1024).toFixed(1)
        : '0';
      const pct = item.size > 0 && item.totalOutputBytes > 0 && item.size > item.totalOutputBytes
        ? Math.round(((item.size - item.totalOutputBytes) / item.size) * 100) + '%'
        : '0%';

      rows.push([
        item.name,
        item.relativePath,
        item.orientation,
        item.status,
        sizesStr,
        `${item.width}x${item.height}`,
        origKb,
        outKb,
        netKb,
        pct
      ]);
    });

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const timestamp = new Date().toISOString().slice(0, 10);
    triggerDirectDownload(blob, `bulk-resizer-report-${timestamp}.csv`);
    showToast('Exported CSV report.');
  }

  // ── Preview Modal ─────────────────────────────────────────────────────
  function openPreviewModal(item) {
    if (!DOM.previewModal) return;
    DOM.previewModalTitle.textContent = item.name;
    DOM.previewModalMeta.textContent = `${item.orientation.toUpperCase()} · ${item.width} × ${item.height} px · ${formatBytes(item.size)}`;

    // Default image to original or largest output
    const defaultUrl = item.outputFiles && item.outputFiles.length > 0
      ? item.outputFiles[0].url
      : item.thumbUrl;

    DOM.previewModalImg.src = defaultUrl;
    DOM.previewModalSizes.textContent = '';

    if (item.outputFiles && item.outputFiles.length > 0) {
      item.outputFiles.forEach(out => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary btn-sm';
        btn.textContent = `Download ${out.width}w (${formatBytes(out.size)})`;
        btn.addEventListener('click', () => {
          triggerDirectDownload(out.blob, out.name);
        });
        DOM.previewModalSizes.appendChild(btn);
      });
    }

    DOM.previewModal.style.display = 'flex';
  }

  window.closePreviewModal = function (e) {
    if (e.target === DOM.previewModal) {
      DOM.previewModal.style.display = 'none';
      DOM.previewModalImg.src = '';
    }
  };

  window.closePreviewModalDirect = function () {
    DOM.previewModal.style.display = 'none';
    DOM.previewModalImg.src = '';
  };

  // ── Navigation Tabs ───────────────────────────────────────────────────
  function switchTab(tabId) {
    state.activeTab = tabId;
    if (tabId === 'files') {
      DOM.tabBtnFiles.classList.add('active');
      DOM.tabBtnSummary.classList.remove('active');
      DOM.panelFiles.style.display = 'flex';
      DOM.panelSummary.style.display = 'none';
    } else {
      DOM.tabBtnSummary.classList.add('active');
      DOM.tabBtnFiles.classList.remove('active');
      DOM.panelFiles.style.display = 'none';
      DOM.panelSummary.style.display = 'flex';
    }
  }

  // ── Event Listeners Setup ─────────────────────────────────────────────
  function setupEventListeners() {
    // Browse Buttons
    DOM.btnBrowseFiles.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.fileInput.click();
    });

    DOM.btnBrowseFolder.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.folderInput.click();
    });

    DOM.fileInput.addEventListener('change', (e) => {
      ingestFiles(e.target.files);
      DOM.fileInput.value = '';
    });

    DOM.folderInput.addEventListener('change', (e) => {
      ingestFiles(e.target.files);
      DOM.folderInput.value = '';
    });

    // Clicking the dropzone triggers file picker (unless clicking browse folder button)
    DOM.dropZone.addEventListener('click', (e) => {
      if (e.target.closest('#btnBrowseFolder')) return;
      DOM.fileInput.click();
    });

    // Prevent default drag behaviors on window so browser never navigates away or opens file
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
      window.addEventListener(name, (e) => {
        e.preventDefault();
      }, false);
    });

    // Drop targets (left dropzone, right queue panel, empty state, and whole tool workspace card)
    const toolApp = document.getElementById('tool-app');
    const dropTargets = [DOM.dropZone, DOM.panelFiles, DOM.emptyQueueState, toolApp].filter(Boolean);

    dropTargets.forEach(target => {
      target.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.dropZone.classList.add('dragover');
        if (toolApp) toolApp.classList.add('drag-active');
      });

      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        DOM.dropZone.classList.add('dragover');
        if (toolApp) toolApp.classList.add('drag-active');
      });

      target.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only remove highlight if leaving the element completely
        if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
          DOM.dropZone.classList.remove('dragover');
          if (toolApp) toolApp.classList.remove('drag-active');
        }
      });

      target.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.dropZone.classList.remove('dragover');
        if (toolApp) toolApp.classList.remove('drag-active');

        const dt = e.dataTransfer;
        if (!dt) return;

        try {
          const files = await extractDroppedFiles(dt);
          if (files && files.length > 0) {
            await ingestFiles(files);
          } else {
            showToast('No images detected in dropped items.');
          }
        } catch (err) {
          console.error('Error handling dropped files:', err);
          showToast('Failed to read dropped files: ' + err.message);
        }
      });
    });

    // Format Selector
    DOM.formatSeg.addEventListener('click', (e) => {
      const btn = e.target.closest('.format-btn');
      if (!btn) return;
      const fmt = btn.getAttribute('data-format');
      state.settings.outputFormat = fmt;
      savePersistedSettings();
      applySettingsToUI();
    });

    // Quality Slider
    DOM.qualitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.settings.quality = val;
      DOM.qualityVal.textContent = val + '%';
      savePersistedSettings();
    });

    // Custom Width Buttons
    DOM.btnAddHorizontal.addEventListener('click', () => addCustomWidth('horizontal', DOM.customInputHorizontal));
    DOM.customInputHorizontal.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCustomWidth('horizontal', DOM.customInputHorizontal); });

    DOM.btnAddVertical.addEventListener('click', () => addCustomWidth('vertical', DOM.customInputVertical));
    DOM.customInputVertical.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCustomWidth('vertical', DOM.customInputVertical); });

    DOM.btnAddSquare.addEventListener('click', () => addCustomWidth('square', DOM.customInputSquare));
    DOM.customInputSquare.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCustomWidth('square', DOM.customInputSquare); });

    // Toggles
    DOM.toggleStripMeta.addEventListener('change', (e) => {
      state.settings.stripMetadata = e.target.checked;
      savePersistedSettings();
    });

    DOM.togglePreserveFolders.addEventListener('change', (e) => {
      state.settings.preserveFolders = e.target.checked;
      savePersistedSettings();
    });

    DOM.toggleIncludeOriginals.addEventListener('change', (e) => {
      state.settings.includeOriginals = e.target.checked;
      savePersistedSettings();
    });

    // Renaming Inputs
    DOM.renamePrefix.addEventListener('input', updateRenamePreview);
    DOM.renameSuffix.addEventListener('input', updateRenamePreview);

    // Primary Actions
    DOM.btnResize.addEventListener('click', startBatchResize);
    DOM.btnCancel.addEventListener('click', cancelBatch);
    DOM.btnClearAll.addEventListener('click', clearAllQueue);
    DOM.btnDownloadZip.addEventListener('click', downloadBatchZip);
    DOM.btnExportCSV.addEventListener('click', exportCsvReport);

    // Navigation Tabs
    DOM.tabBtnFiles.addEventListener('click', () => switchTab('files'));
    DOM.tabBtnSummary.addEventListener('click', () => switchTab('summary'));

    // Global Keybindings
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.previewModal && DOM.previewModal.style.display !== 'none') {
          closePreviewModalDirect();
        }
      }
    });

    // Listen for Theme Changes (from /shared/navbar.js)
    window.addEventListener('bua-theme-change', () => {
      // Theme change handled seamlessly by CSS variables
    });
  }

  // ── Initialization ────────────────────────────────────────────────────
  function init() {
    initDOMCache();
    loadPersistedSettings();
    applySettingsToUI();
    setupEventListeners();
    updateGlobalStats();
    updateMainActionBtn();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
