import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean history storage: only store genuine, user-executed scans
const SEED_DATA = [];

export function getHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(SEED_DATA, null, 2));
      return SEED_DATA;
    }
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading history file:', err);
    return SEED_DATA;
  }
}

export function saveScan(scanData) {
  try {
    const list = getHistory();
    // Prepend new scan, remove duplicate id if present
    const updated = [scanData, ...list.filter(item => item.id !== scanData.id)];
    // Keep up to 200 most recent items
    const trimmed = updated.slice(0, 200);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
    return scanData;
  } catch (err) {
    console.error('Error saving scan to history:', err);
    return scanData;
  }
}

export function getScanById(id) {
  const list = getHistory();
  return list.find(item => item.id === id) || null;
}

export function deleteScanById(id) {
  try {
    const list = getHistory();
    const filtered = list.filter(item => item.id !== id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(filtered, null, 2));
    return true;
  } catch (err) {
    console.error('Error deleting scan from history:', err);
    return false;
  }
}

export function clearAllHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
    return true;
  } catch (err) {
    console.error('Error clearing history:', err);
    return false;
  }
}

