const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ========== WebSocket Protocol (RFC 6455) ==========

const OPCODES = { TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0A };
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAcceptKey(clientKey) {
  return crypto.createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}

function encodeFrame(opcode, payload) {
  const fin = 0x80;
  const len = payload.length;
  let header;

  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = fin | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = fin | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = fin | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;

  const secondByte = buffer[1];
  const opcode = buffer[0] & 0x0F;
  const masked = (secondByte & 0x80) !== 0;
  let payloadLen = secondByte & 0x7F;
  let offset = 2;

  if (!masked) throw new Error('Client frames must be masked');

  if (payloadLen === 126) {
    if (buffer.length < 4) return null;
    payloadLen = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buffer.length < 10) return null;
    payloadLen = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  const maskOffset = offset;
  const dataOffset = offset + 4;
  const totalLen = dataOffset + payloadLen;
  if (buffer.length < totalLen) return null;

  const mask = buffer.slice(maskOffset, dataOffset);
  const data = Buffer.alloc(payloadLen);
  for (let i = 0; i < payloadLen; i++) {
    data[i] = buffer[dataOffset + i] ^ mask[i % 4];
  }

  return { opcode, payload: data, bytesConsumed: totalLen };
}

// ========== Configuration ==========

const PORT = process.env.DESIGNKIT_PORT || (49152 + Math.floor(Math.random() * 16383));
const HOST = process.env.DESIGNKIT_HOST || '127.0.0.1';
const URL_HOST = process.env.DESIGNKIT_URL_HOST || (HOST === '127.0.0.1' ? 'localhost' : HOST);
const SESSION_DIR = process.env.DESIGNKIT_DIR || '/tmp/designkit';
const CONTENT_DIR = path.join(SESSION_DIR, 'content');
const STATE_DIR = path.join(SESSION_DIR, 'state');
const SNAPSHOT_DIR = path.join(SESSION_DIR, 'snapshots');
const CATALOG_DIR = process.env.DESIGNKIT_CATALOG || path.join(path.dirname(__dirname), 'catalog');
let ownerPid = process.env.DESIGNKIT_OWNER_PID ? Number(process.env.DESIGNKIT_OWNER_PID) : null;

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};

// ========== Snapshot System ==========

const POINTER_FILE = path.join(SNAPSHOT_DIR, 'pointer.json');

function readPointer() {
  try {
    return JSON.parse(fs.readFileSync(POINTER_FILE, 'utf8'));
  } catch {
    return { current: 0, total: 0 };
  }
}

function writePointer(pointer) {
  fs.writeFileSync(POINTER_FILE, JSON.stringify(pointer));
}

function saveSnapshot(html) {
  const pointer = readPointer();
  const next = pointer.current + 1;
  const filename = String(next).padStart(3, '0') + '.html';

  // Truncate forward history if we branched
  if (pointer.current < pointer.total) {
    for (let i = pointer.current + 1; i <= pointer.total; i++) {
      const old = path.join(SNAPSHOT_DIR, String(i).padStart(3, '0') + '.html');
      try { fs.unlinkSync(old); } catch {}
    }
  }

  fs.writeFileSync(path.join(SNAPSHOT_DIR, filename), html);
  writePointer({ current: next, total: next });
  return { current: next, total: next };
}

function getCurrentSnapshot() {
  const pointer = readPointer();
  if (pointer.current === 0) return null;
  const filename = String(pointer.current).padStart(3, '0') + '.html';
  try {
    return fs.readFileSync(path.join(SNAPSHOT_DIR, filename), 'utf8');
  } catch {
    return null;
  }
}

function snapshotUndo() {
  const pointer = readPointer();
  if (pointer.current <= 1) return null;
  pointer.current -= 1;
  writePointer(pointer);
  return { html: getCurrentSnapshot(), pointer };
}

function snapshotRedo() {
  const pointer = readPointer();
  if (pointer.current >= pointer.total) return null;
  pointer.current += 1;
  writePointer(pointer);
  return { html: getCurrentSnapshot(), pointer };
}

// ========== Catalog Helpers ==========

function readManifest() {
  const manifestPath = path.join(CATALOG_DIR, 'manifest.json');
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return { blocks: [], templates: [] };
  }
}

function parseBlockFrontmatter(html) {
  const match = html.match(/^<!--\s*\n([\s\S]*?)\n-->/);
  if (!match) return { meta: {}, content: html };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  });
  const content = html.slice(match[0].length).trim();
  return { meta, content };
}

// ========== Templates and Constants ==========

const WAITING_PAGE = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Brainstorm Companion</title>
<style>body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
h1 { color: #333; } p { color: #666; }</style>
</head>
<body><h1>Brainstorm Companion</h1>
<p>Waiting for the agent to push a screen...</p></body></html>`;

function getFrameTemplate() {
  return fs.readFileSync(path.join(__dirname, 'frame-template.html'), 'utf-8');
}

function getWorkbenchScripts() {
  const scripts = ['undo.js', 'catalog.js', 'workbench.js'];
  let injection = '';
  for (const name of scripts) {
    const fp = path.join(__dirname, name);
    if (fs.existsSync(fp)) {
      injection += '<script>\n' + fs.readFileSync(fp, 'utf-8') + '\n</script>\n';
    }
  }
  return injection;
}

function getHelperInjection() {
  const helperScript = fs.readFileSync(path.join(__dirname, 'helper.js'), 'utf-8');
  return '<script>\n' + helperScript + '\n</script>';
}

function getThemeDataInjection() {
  const themeData = fs.readFileSync(path.join(__dirname, 'theme-data.js'), 'utf-8');
  return '<script>\n' + themeData + '\n</script>';
}

// ========== Helper Functions ==========

function extractContent(html) {
  // Extract <style> blocks and <body> content from full documents
  // so they can be wrapped in the frame template
  const trimmed = html.trimStart().toLowerCase();
  const isFullDoc = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
  if (!isFullDoc) return html;

  let styles = '';
  let body = html;

  // Extract all <style> blocks, scoping :root to #claude-content
  // so prototype tokens don't leak into the frame template chrome
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    let css = match[1];
    css = css.replace(/:root\b/g, '#claude-content');
    css = css.replace(/(?<![.\-\w])body(?=[^{]*\{)/g, '#claude-content');
    styles += '<style>' + css + '</style>\n';
  }

  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    body = bodyMatch[1];
  }

  return styles + body;
}

function wrapInFrame(content) {
  return getFrameTemplate().replace('<!-- CONTENT -->', content);
}

function getNewestScreen() {
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => {
      const fp = path.join(CONTENT_DIR, f);
      return { path: fp, mtime: fs.statSync(fp).mtime.getTime() };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? files[0].path : null;
}

// ========== HTTP Request Handler ==========

function handleRequest(req, res) {
  touchActivity();
  const reqUrl = req.url.split('?')[0];

  if (req.method === 'GET' && reqUrl === '/') {
    // Serve current snapshot if one exists, otherwise fall back to newest screen
    const snapshot = getCurrentSnapshot();
    const screenFile = snapshot ? null : getNewestScreen();
    let content = snapshot
      ? snapshot
      : screenFile
        ? extractContent(fs.readFileSync(screenFile, 'utf-8'))
        : null;

    let html = content ? wrapInFrame(content) : WAITING_PAGE;

    const allScripts = getThemeDataInjection() + '\n' + getWorkbenchScripts() + '\n' + getHelperInjection();
    if (html.includes('</body>')) {
      html = html.replace('</body>', allScripts + '\n</body>');
    } else {
      html += allScripts;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // GET /catalog — returns manifest with all blocks and templates
  if (req.method === 'GET' && reqUrl === '/catalog') {
    const manifest = readManifest();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(manifest));
    return;
  }

  // GET /catalog/blocks/:name — returns a single block's HTML + metadata
  const blockMatch = reqUrl.match(/^\/catalog\/blocks\/(.+)$/);
  if (req.method === 'GET' && blockMatch) {
    const blockFile = path.join(CATALOG_DIR, 'blocks', decodeURIComponent(blockMatch[1]));
    try {
      const html = fs.readFileSync(blockFile, 'utf8');
      const { meta, content } = parseBlockFrontmatter(html);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ meta, content }));
    } catch {
      res.writeHead(404);
      res.end('Block not found');
    }
    return;
  }

  // GET /templates — list available templates
  if (req.method === 'GET' && reqUrl === '/templates') {
    const tplDir = path.join(CATALOG_DIR, 'templates');
    try {
      const files = fs.readdirSync(tplDir).filter(f => f.endsWith('.html'));
      const templates = files.map(f => ({
        file: f,
        name: f.replace('.html', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(templates));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  // GET /templates/:name — returns a page template HTML
  const templateMatch = reqUrl.match(/^\/templates\/(.+)$/);
  if (req.method === 'GET' && templateMatch) {
    const tplFile = path.join(CATALOG_DIR, 'templates', decodeURIComponent(templateMatch[1]));
    try {
      const html = fs.readFileSync(tplFile, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end('Template not found');
    }
    return;
  }

  // GET /snapshot-pointer — returns current snapshot pointer
  if (req.method === 'GET' && reqUrl === '/snapshot-pointer') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readPointer()));
    return;
  }

  if (req.method === 'GET' && reqUrl.startsWith('/files/')) {
    const fileName = reqUrl.slice(7);
    const filePath = path.join(CONTENT_DIR, path.basename(fileName));
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

// ========== WebSocket Connection Handling ==========

const clients = new Set();

function handleUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }

  const accept = computeAcceptKey(key);
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );

  let buffer = Buffer.alloc(0);
  clients.add(socket);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length > 0) {
      let result;
      try {
        result = decodeFrame(buffer);
      } catch (e) {
        socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
        clients.delete(socket);
        return;
      }
      if (!result) break;
      buffer = buffer.slice(result.bytesConsumed);

      switch (result.opcode) {
        case OPCODES.TEXT:
          handleMessage(result.payload.toString(), socket);
          break;
        case OPCODES.CLOSE:
          socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
          clients.delete(socket);
          return;
        case OPCODES.PING:
          socket.write(encodeFrame(OPCODES.PONG, result.payload));
          break;
        case OPCODES.PONG:
          break;
        default: {
          const closeBuf = Buffer.alloc(2);
          closeBuf.writeUInt16BE(1003);
          socket.end(encodeFrame(OPCODES.CLOSE, closeBuf));
          clients.delete(socket);
          return;
        }
      }
    }
  });

  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
}

function sendToClient(socket, msg) {
  const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
  try { socket.write(encodeFrame(OPCODES.TEXT, Buffer.from(payload))); } catch {}
}

function handleMessage(text, senderSocket) {
  let event;
  try {
    event = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e.message);
    return;
  }
  touchActivity();
  console.log(JSON.stringify({ source: 'user-event', type: event.type }));

  // Snapshot save
  if (event.type === 'save') {
    const pointer = saveSnapshot(event.html);
    // Write to CONTENT_DIR too so GET / serves the latest
    const contentFile = path.join(CONTENT_DIR, 'canvas.html');
    fs.writeFileSync(contentFile, event.html);
    if (senderSocket) sendToClient(senderSocket, JSON.stringify({ type: 'save-ok', pointer }));
    return;
  }

  // Snapshot undo
  if (event.type === 'snapshot-undo') {
    const result = snapshotUndo();
    if (result) {
      fs.writeFileSync(path.join(CONTENT_DIR, 'canvas.html'), result.html);
      broadcast({ type: 'snapshot-load', html: result.html, pointer: result.pointer });
    }
    return;
  }

  // Snapshot redo
  if (event.type === 'snapshot-redo') {
    const result = snapshotRedo();
    if (result) {
      fs.writeFileSync(path.join(CONTENT_DIR, 'canvas.html'), result.html);
      broadcast({ type: 'snapshot-load', html: result.html, pointer: result.pointer });
    }
    return;
  }

  if (event.choice) {
    const eventsFile = path.join(STATE_DIR, 'events');
    fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
  }
  if (event.type === 'annotations' && Array.isArray(event.items)) {
    const eventsFile = path.join(STATE_DIR, 'events');
    event.items.forEach(item => {
      fs.appendFileSync(eventsFile, JSON.stringify(item) + '\n');
    });
  }
}

function broadcast(msg) {
  const frame = encodeFrame(OPCODES.TEXT, Buffer.from(JSON.stringify(msg)));
  for (const socket of clients) {
    try { socket.write(frame); } catch (e) { clients.delete(socket); }
  }
}

// ========== Activity Tracking ==========

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let lastActivity = Date.now();

function touchActivity() {
  lastActivity = Date.now();
}

// ========== File Watching ==========

const debounceTimers = new Map();

// ========== Server Startup ==========

function startServer() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  // Track known files to distinguish new screens from updates.
  // macOS fs.watch reports 'rename' for both new files and overwrites,
  // so we can't rely on eventType alone.
  const knownFiles = new Set(
    fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html'))
  );

  const server = http.createServer(handleRequest);
  server.on('upgrade', handleUpgrade);

  const watcher = fs.watch(CONTENT_DIR, (eventType, filename) => {
    if (!filename || !filename.endsWith('.html')) return;

    if (debounceTimers.has(filename)) clearTimeout(debounceTimers.get(filename));
    debounceTimers.set(filename, setTimeout(() => {
      debounceTimers.delete(filename);
      const filePath = path.join(CONTENT_DIR, filename);

      if (!fs.existsSync(filePath)) return; // file was deleted
      touchActivity();

      if (!knownFiles.has(filename)) {
        knownFiles.add(filename);
        const eventsFile = path.join(STATE_DIR, 'events');
        if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);
        console.log(JSON.stringify({ type: 'screen-added', file: filePath }));
      } else {
        console.log(JSON.stringify({ type: 'screen-updated', file: filePath }));
      }

      broadcast({ type: 'reload' });
    }, 100));
  });
  watcher.on('error', (err) => console.error('fs.watch error:', err.message));

  // Watch snapshots directory for external writes (from Claude)
  const snapshotWatcher = fs.watch(SNAPSHOT_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.html') && eventType === 'rename') {
      const num = parseInt(filename.replace('.html', ''), 10);
      const pointer = readPointer();
      if (num > pointer.total) {
        writePointer({ current: num, total: num });
        broadcast({ type: 'reload' });
      }
    }
  });
  snapshotWatcher.on('error', () => {});

  function shutdown(reason) {
    console.log(JSON.stringify({ type: 'server-stopped', reason }));
    const infoFile = path.join(STATE_DIR, 'server-info');
    if (fs.existsSync(infoFile)) fs.unlinkSync(infoFile);
    fs.writeFileSync(
      path.join(STATE_DIR, 'server-stopped'),
      JSON.stringify({ reason, timestamp: Date.now() }) + '\n'
    );
    watcher.close();
    snapshotWatcher.close();
    clearInterval(lifecycleCheck);
    server.close(() => process.exit(0));
  }

  function ownerAlive() {
    if (!ownerPid) return true;
    try { process.kill(ownerPid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
  }

  // Check every 60s: exit if owner process died or idle for 30 minutes
  const lifecycleCheck = setInterval(() => {
    if (!ownerAlive()) shutdown('owner process exited');
    else if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) shutdown('idle timeout');
  }, 60 * 1000);
  lifecycleCheck.unref();

  // Validate owner PID at startup. If it's already dead, the PID resolution
  // was wrong (common on WSL, Tailscale SSH, and cross-user scenarios).
  // Disable monitoring and rely on the idle timeout instead.
  if (ownerPid) {
    try { process.kill(ownerPid, 0); }
    catch (e) {
      if (e.code !== 'EPERM') {
        console.log(JSON.stringify({ type: 'owner-pid-invalid', pid: ownerPid, reason: 'dead at startup' }));
        ownerPid = null;
      }
    }
  }

  server.listen(PORT, HOST, () => {
    const info = JSON.stringify({
      type: 'server-started', port: Number(PORT), host: HOST,
      url_host: URL_HOST, url: 'http://' + URL_HOST + ':' + PORT,
      screen_dir: CONTENT_DIR, state_dir: STATE_DIR
    });
    console.log(info);
    fs.writeFileSync(path.join(STATE_DIR, 'server-info'), info + '\n');
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { computeAcceptKey, encodeFrame, decodeFrame, OPCODES };
