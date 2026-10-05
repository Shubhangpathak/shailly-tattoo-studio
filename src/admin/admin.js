import { element, TAGS, validateItems } from '../gallery/shared.js';

const $ = selector => document.querySelector(selector);
const grid = $('[data-grid]');
const message = $('[data-message]');
const uploadDialog = $('[data-upload-dialog]');
const editDialog = $('[data-edit-dialog]');
const removeDialog = $('[data-remove-dialog]');
let photos = [], csrf = '', activeFilter = 'all', initialized = false, uploading = false;
let editing, removing;
const queue = [];

function notify(text, error = false) {
  message.textContent = text;
  message.dataset.error = String(error);
  message.hidden = !text;
}

async function request(action, data = {}) {
  const options = { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(action === 'initialize' ? 180000 : 30000) };
  if (action) Object.assign(options, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ action, ...data }) });
  const response = await fetch('/admin/api.php', options);
  let result;
  try { result = await response.json(); }
  catch { throw new Error('The server did not return gallery data. Check PHP and password protection, then refresh.'); }
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

function tagField(selected = []) {
  const fieldset = element('fieldset', { class: 'admin-tag-field' });
  const options = element('div', { class: 'admin-tag-options' });
  fieldset.append(element('legend', {}, 'Gallery tags'), options);
  Object.entries(TAGS).forEach(([value, label]) => {
    const input = element('input', { type: 'checkbox', name: 'tags', value });
    input.checked = selected.includes(value);
    const option = element('label');
    option.append(input, document.createTextNode(label));
    options.append(option);
  });
  return fieldset;
}

function selectedTags(root) { return [...root.querySelectorAll('[name="tags"]:checked')].map(input => input.value); }

function setDialogBusy(dialog, busy) {
  dialog.dataset.busy = String(busy);
  dialog.querySelectorAll('[data-close]').forEach(button => { button.disabled = busy; });
}

function render() {
  const query = $('[data-search]').value.trim().toLowerCase();
  const visible = photos.filter(photo => (activeFilter === 'all' || photo.tags.includes(activeFilter)) && photo.title.toLowerCase().includes(query));
  $('[data-count]').textContent = `${visible.length} ${visible.length === 1 ? 'photo' : 'photos'}${visible.length !== photos.length ? ` of ${photos.length}` : ''}`;
  $('[data-empty]').hidden = !initialized || visible.length > 0;
  $('[data-empty]').textContent = photos.length ? 'No photos match this search or filter.' : 'Your gallery is empty. Add photos to start your collection.';
  grid.replaceChildren(...visible.map(photo => {
    const card = element('article', { class: 'admin-card' });
    const image = element('img', { src: photo.thumbnail, alt: photo.alt, width: photo.width, height: photo.height, loading: 'lazy', decoding: 'async' });
    const body = element('div', { class: 'admin-card__body' });
    const tags = element('div', { class: 'admin-card__tags' });
    (photo.tags.length ? photo.tags.map(tag => TAGS[tag]) : ['All work']).forEach(tag => tags.append(element('span', { class: 'admin-card__tag' }, tag)));
    const actions = element('div', { class: 'admin-card__actions' });
    const edit = element('button', { type: 'button', 'aria-label': `Edit ${photo.title}` }, 'Edit');
    const remove = element('button', { type: 'button', 'aria-label': `Remove ${photo.title}` }, 'Remove');
    edit.addEventListener('click', () => openEditor(photo));
    remove.addEventListener('click', () => openRemoval(photo));
    actions.append(edit, remove); body.append(element('h2', {}, photo.title), tags, actions); card.append(image, body);
    return card;
  }));
}

async function refresh() {
  $('[data-refresh]').disabled = true;
  grid.setAttribute('aria-busy', 'true');
  try {
    const result = await request();
    photos = validateItems(result.items);
    csrf = result.csrf;
    initialized = result.initialized;
    $('[data-setup]').hidden = initialized;
    $('[data-add]').disabled = !initialized;
    render();
    notify('');
    return true;
  } catch (error) { notify(error.message, true); return false; }
  finally { $('[data-refresh]').disabled = false; grid.setAttribute('aria-busy', 'false'); }
}

Object.entries({ all: 'All work', ...TAGS }).forEach(([value, label]) => {
  const button = element('button', { type: 'button', class: 'admin-tab', 'data-filter': value, 'aria-pressed': String(value === 'all') }, label);
  button.addEventListener('click', () => {
    activeFilter = value;
    document.querySelectorAll('[data-filter]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    render();
  });
  $('[data-filters]').append(button);
});
$('[data-search]').addEventListener('input', render);
$('[data-refresh]').addEventListener('click', refresh);
$('[data-initialize]').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true; button.textContent = 'Importing your collection…';
  try {
    await request('initialize');
    if (await refresh()) notify('Your existing collection is ready. You can now upload, edit, and remove photos.');
  } catch (error) { notify(error.message, true); }
  finally { button.disabled = false; button.textContent = 'Import 19 photos'; }
});

function openEditor(photo) {
  editing = photo;
  $('[data-edit-preview]').src = photo.thumbnail;
  $('[data-edit-preview]').alt = photo.alt;
  $('#photo-title').value = photo.title;
  $('#photo-alt').value = photo.alt;
  $('[data-edit-tags]').replaceChildren(tagField(photo.tags));
  $('[data-edit-error]').textContent = '';
  editDialog.showModal();
}

$('[data-edit-form]').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('[type="submit"]');
  button.disabled = true;
  setDialogBusy(editDialog, true);
  try {
    const result = await request('edit', { id: editing.id, title: $('#photo-title').value, alt: $('#photo-alt').value, tags: selectedTags(editDialog) });
    const item = validateItems([result.item])[0];
    photos = photos.map(photo => photo.id === item.id ? item : photo);
    render(); editDialog.close(); notify('Photo updated. Your changes are live in the gallery.');
  } catch (error) { $('[data-edit-error]').textContent = error.message; }
  finally { button.disabled = false; setDialogBusy(editDialog, false); }
});

function openRemoval(photo) {
  removing = photo;
  $('[data-remove-preview]').src = photo.thumbnail;
  $('[data-remove-preview]').alt = photo.alt;
  $('[data-remove-title]').textContent = photo.title;
  $('[data-remove-error]').textContent = '';
  removeDialog.showModal();
}

$('[data-remove-confirm]').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  setDialogBusy(removeDialog, true);
  try {
    const result = await request('remove', { id: removing.id });
    photos = photos.filter(photo => photo.id !== removing.id);
    render(); removeDialog.close(); notify(result.warning || 'Photo permanently removed from the gallery.', Boolean(result.warning));
  } catch (error) { $('[data-remove-error]').textContent = error.message; }
  finally { button.disabled = false; setDialogBusy(removeDialog, false); }
});

function updateQueueSummary() {
  const pending = queue.filter(item => item.state !== 'done').length;
  $('[data-upload-summary]').textContent = queue.length ? `${queue.filter(item => item.state === 'done').length} uploaded · ${pending} remaining` : 'No photos selected';
  $('[data-upload-submit]').disabled = uploading || !pending;
  $('[data-upload-submit]').textContent = uploading ? 'Uploading…' : 'Upload photos';
}

function addFiles(files) {
  if (uploading) return;
  const errors = [];
  [...files].forEach(file => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { errors.push(`${file.name}: use JPEG, PNG or WebP, up to 10 MB.`); return; }
    const url = URL.createObjectURL(file);
    const row = element('div', { class: 'admin-upload-row' });
    const image = element('img', { src: url, alt: 'Selected photo preview', loading: 'lazy' });
    const body = element('div');
    const field = element('label', { class: 'field' });
    const title = element('input', { type: 'text', maxlength: '180', required: '', 'aria-label': `Title for ${file.name}` });
    title.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    field.append(element('span', {}, 'Photo title'), title);
    const tags = tagField();
    const progress = element('progress', { value: 0, max: 100, 'aria-label': `Upload progress for ${file.name}` });
    const label = element('span', { 'data-progress-label': '', role: 'status' }, 'Ready to upload');
    const remove = element('button', { type: 'button', class: 'admin-text-button' }, 'Remove from upload');
    const item = { file, url, row, title, tags, progress, label, state: 'pending', requestId: crypto.randomUUID() };
    remove.addEventListener('click', () => {
      if (uploading) return;
      queue.splice(queue.indexOf(item), 1); row.remove(); URL.revokeObjectURL(url); updateQueueSummary();
    });
    body.append(field, tags, progress, label, remove); row.append(image, body);
    queue.push(item); $('[data-upload-list]').append(row);
  });
  $('[data-upload-error]').textContent = errors.join(' ');
  updateQueueSummary();
}

function uploadPhoto(item) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('action', 'upload'); form.append('photo', item.file);
    form.append('title', item.title.value.trim()); form.append('alt', item.title.value.trim());
    form.append('tags', JSON.stringify(selectedTags(item.tags))); form.append('requestId', item.requestId);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/api.php'); xhr.timeout = 120000;
    xhr.setRequestHeader('X-CSRF-Token', csrf);
    xhr.upload.onprogress = event => {
      if (!event.lengthComputable) return;
      item.progress.value = Math.round(event.loaded / event.total * 100);
      item.label.textContent = item.progress.value === 100 ? 'Optimizing photo…' : `Uploading ${item.progress.value}%`;
    };
    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) throw new Error(result.error || 'Upload failed.');
        resolve(validateItems([result.item])[0]);
      } catch (error) { reject(error instanceof SyntaxError ? new Error('The server did not return upload data. Refresh and check your collection.') : error); }
    };
    xhr.onerror = xhr.ontimeout = () => reject(new Error('The connection was interrupted. Retry this photo to check or finish its upload.'));
    xhr.send(form);
  });
}

$('[data-upload-submit]').addEventListener('click', async () => {
  uploading = true;
  $('[data-files]').disabled = true;
  uploadDialog.querySelectorAll('input, [data-close]').forEach(input => { input.disabled = true; });
  updateQueueSummary();
  let count = 0;
  for (const item of queue.filter(item => item.state !== 'done')) {
    item.label.dataset.error = 'false';
    if (!item.title.value.trim()) { item.label.textContent = 'Enter a photo title before uploading.'; item.label.dataset.error = 'true'; continue; }
    try {
      const photo = await uploadPhoto(item);
      item.state = 'done'; item.progress.value = 100; item.label.textContent = 'Uploaded';
      if (!photos.some(existing => existing.id === photo.id)) photos.unshift(photo);
      count++;
    } catch (error) { item.state = 'failed'; item.label.textContent = error.message; item.label.dataset.error = 'true'; }
    updateQueueSummary();
  }
  uploading = false;
  uploadDialog.querySelectorAll('input, [data-close]').forEach(input => { input.disabled = false; });
  queue.filter(item => item.state === 'done').forEach(item => item.row.querySelectorAll('input').forEach(input => { input.disabled = true; }));
  updateQueueSummary(); render();
  if (count) notify(`${count} ${count === 1 ? 'photo added' : 'photos added'} to your gallery.`);
});

$('[data-add]').addEventListener('click', () => uploadDialog.showModal());
$('[data-files]').addEventListener('change', event => { addFiles(event.target.files); event.target.value = ''; });
const dropzone = $('[data-dropzone]');
['dragenter', 'dragover'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.dataset.dragging = 'true'; }));
['dragleave', 'drop'].forEach(name => dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.dataset.dragging = 'false'; }));
dropzone.addEventListener('drop', event => addFiles(event.dataTransfer.files));
document.querySelectorAll('.admin-dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => { if (!uploading) dialog.close(); }));
  dialog.addEventListener('cancel', event => { if (uploading || dialog.dataset.busy === 'true') event.preventDefault(); });
});
uploadDialog.addEventListener('close', () => {
  queue.forEach(item => URL.revokeObjectURL(item.url)); queue.length = 0;
  $('[data-upload-list]').replaceChildren(); $('[data-upload-error]').textContent = ''; updateQueueSummary();
});
refresh();
