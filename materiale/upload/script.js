let currentFiles = [];
let uploadInProgress = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeDropZone();
    loadRecentUploads();
});

// Inițializare zona de drop
function initializeDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Evenimente pentru drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // Tratare drop fișiere
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Tratare selectie fisier prin buton
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (uploadInProgress) {
        alert('Vă rugăm să așteptați finalizarea încărcării curente.');
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Verificare tip fișier
        const allowedTypes = [
            'application/pdf',
            'image/jpeg', 
            'image/jpg',
            'image/png',
            'audio/mpeg',
            'video/mp4',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(`Tipul fișierului "${file.name}" nu este suportat.`);
            continue;
        }

        // Adaugă fișierul la lista curentă
        currentFiles.push({
            file: file,
            id: Date.now() + i,
            name: file.name,
            size: file.size,
            type: file.type
        });
    }

    updateFilesList();
    showMaterialForm();
}

// Actualizează lista de fișiere afișată
function updateFilesList() {
    const filesList = document.getElementById('filesList');
    
    if (currentFiles.length === 0) {
        filesList.innerHTML = '<p class="no-uploads">Niciun fișier selectat</p>';
        return;
    }

    filesList.innerHTML = currentFiles.map(file => `
        <div class="file-item">
            <div class="file-icon">${getFileIcon(file.type)}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeFile(${file.id})">Șterge</button>
        </div>
    `).join('');
}

// Obține iconița pentru tipul de fișier
function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('document')) return '📝';
    return '📁';
}

// Formatare dimensiune fișier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Afișează formularul pentru detalii material
function showMaterialForm() {
    document.getElementById('materialForm').style.display = 'block';
    document.getElementById('pendingFiles').style.display = 'block';
}

// Ascunde formularul
function hideMaterialForm() {
    document.getElementById('materialForm').style.display = 'none';
    document.getElementById('pendingFiles').style.display = 'none';
}

// Elimină un fișier din lista curentă
function removeFile(fileId) {
    currentFiles = currentFiles.filter(file => file.id !== fileId);
    updateFilesList();
    
    if (currentFiles.length === 0) {
        hideMaterialForm();
    }
}

// Anulează încărcarea
function cancelUpload() {
    if (confirm('Sigur doriți să anulați încărcarea? Toate fișierele selectate vor fi șterse.')) {
        currentFiles = [];
        updateFilesList();
        hideMaterialForm();
        resetProgress();
    }
}

// Resetare progress bar
function resetProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
    uploadInProgress = false;
}

// Încărcare material
function uploadMaterial() {
    const materialName = document.getElementById('materialName').value.trim();
    const materialLevel = document.getElementById('materialLevel').value;
    const materialType = document.getElementById('materialType').value;

    // Validare
    if (!materialName) {
        alert('Vă rugăm să introduceți un nume pentru material.');
        return;
    }

    if (!materialLevel) {
        alert('Vă rugăm să selectați nivelul pentru material.');
        return;
    }

    if (!materialType) {
        alert('Vă rugăm să selectați tipul materialului.');
        return;
    }

    if (currentFiles.length === 0) {
        alert('Vă rugăm să selectați cel puțin un fișier.');
        return;
    }

    // Pornire încărcare
    startUpload(materialName, materialLevel, materialType);
}

// Simulare încărcare (în viitor va fi cu server real)
function startUpload(materialName, level, type) {
    uploadInProgress = true;
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadProgress = document.getElementById('uploadProgress');
    
    uploadProgress.style.display = 'flex';

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            finishUpload(materialName, level, type);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 200);
}

async function finishUpload(materialName, level, type) {
    try {
        const formData = new FormData();
        
        // Adaugă fișierele
        currentFiles.forEach(file => {
            formData.append('files', file.file);
        });
        
        // Adaugă metadatele
        formData.append('name', materialName);
        formData.append('level', level);
        formData.append('type', type);
        formData.append('description', document.getElementById('materialDescription').value);

        // Trimite la server
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Salvare în localStorage pentru a putea afișa materialele
        const material = {
            id: 'material_' + Date.now(),
            name: materialName,
            level: level,
            type: type, // ACEST CÂMP ERA PROBLEMA!
            description: document.getElementById('materialDescription').value,
            files: result.files || currentFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString()
            })),
            uploadDate: new Date().toISOString()
        };

            const existingMaterials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
            existingMaterials.push(material);
            localStorage.setItem('teachingMaterials', JSON.stringify(existingMaterials));

            alert('Material încărcat cu succes pe server!');
            currentFiles = [];
            updateFilesList();
            hideMaterialForm();
            resetProgress();
            loadRecentUploads();
            
            // Resetare câmpuri formular
            document.getElementById('materialName').value = '';
            document.getElementById('materialLevel').value = '';
            document.getElementById('materialType').value = '';
            document.getElementById('materialDescription').value = '';
            document.getElementById('fileInput').value = '';
        } else {
            alert('Eroare la încărcare: ' + result.error);
        }
    } catch (error) {
        alert('Eroare la încărcare: ' + error.message);
    }
}

// Încărcare materiale recente REALĂ
async function loadRecentUploads() {
    try {
        const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
        const uploadsList = document.getElementById('uploadsList');
        
        if (materials.length === 0) {
            uploadsList.innerHTML = '<p class="no-uploads">Niciun material încărcat recent</p>';
            return;
        }

        const recentMaterials = materials
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);

        uploadsList.innerHTML = recentMaterials.map(material => {
            // Asigură-te că toate câmpurile există
            const level = material.level || 'clasa-a-II-a';
            const type = material.type || 'resursa';
            const uploadDate = material.uploadDate ? formatDate(material.uploadDate) : 'Data necunoscută';
            
            return `
            <div class="upload-item">
                <div class="upload-icon-small">${getFileIcon(material.files[0]?.type || '')}</div>
                <div class="upload-info">
                    <div class="upload-name">${material.name || 'Nume necunoscut'}</div>
                    <div class="upload-meta">
                        ${getLevelName(level)} • ${type} • ${uploadDate}
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn-view" onclick="viewMaterial('${material.id}')">Vizualizează</button>
                    <button class="btn-edit" onclick="editMaterial('${material.id}')">Editare</button>
                    <button class="btn-delete" onclick="deleteMaterial('${material.id}')">Șterge</button>
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Eroare la încărcarea materialelor:', error);
        uploadsList.innerHTML = '<p class="no-uploads">Eroare la încărcarea materialelor</p>';
    }
}

// Funcție pentru ștergere material
function deleteMaterial(materialId) {
    if (!confirm('Sigur doriți să ștergeți acest material? Această acțiune este permanentă.')) {
        return;
    }

    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    const updatedMaterials = materials.filter(m => m.id !== materialId);
    
    localStorage.setItem('teachingMaterials', JSON.stringify(updatedMaterials));
    loadRecentUploads();
    alert('Material șters cu succes!');
}

// Vizualizare material - VERSIUNEA IMBUNĂTĂȚITĂ
function viewMaterial(materialId) {
    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        alert('Materialul nu a fost găsit.');
        return;
    }

    // Creează vizualizatorul cu conținut real
    const viewerHTML = `
        <div class="pdf-viewer-overlay">
            <div class="pdf-viewer-container">
                <div class="pdf-viewer-header">
                    <h3>${material.name}</h3>
                    <button onclick="closePDFViewer()" class="btn-close">×</button>
                </div>
                <div class="pdf-viewer-content">
                    <div class="material-details">
                        <h4>📋 Detalii Material</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Nivel:</strong> ${getLevelName(material.level)}
                            </div>
                            <div class="detail-item">
                                <strong>Tip:</strong> ${material.type}
                            </div>
                            <div class="detail-item">
                                <strong>Data:</strong> ${formatDate(material.uploadDate)}
                            </div>
                            <div class="detail-item">
                                <strong>Descriere:</strong> ${material.description || 'Nicio descriere'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-preview-section">
                        <h4>📎 Fișiere Atașate</h4>
                        ${material.files.map(file => `
                            <div class="file-preview-card">
                                <div class="file-header">
                                    <span class="file-icon-large">${getFileIcon(file.type)}</span>
                                    <div class="file-info">
                                        <div class="file-name-large">${file.name}</div>
                                        <div class="file-meta">${formatFileSize(file.size)} • ${file.type}</div>
                                    </div>
                                </div>
                                <div class="file-actions">
                                    <button class="btn-download-file" onclick="downloadFile('${file.name}', '${file.type}')">
                                        Descarcă fișierul
                                    </button>
                                    <button class="btn-open-file" onclick="openFileInNewTab('${file.name}', '${file.type}')">
                                        Deschide în tab nou
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="quick-actions">
                        <h4>⚡ Acțiuni Rapide</h4>
                        <div class="action-buttons">
                            <button class="btn-action" onclick="editMaterial('${material.id}')">
                                ✏️ Editare Material
                            </button>
                            <button class="btn-action" onclick="shareMaterial('${material.id}')">
                                📤 Partajează
                            </button>
                            <button class="btn-action" onclick="printMaterial('${material.id}')">
                                🖨️ Tipărește
                            </button>
                            <button class="btn-action btn-close-action" onclick="closePDFViewer()">
                                ❌ Închide Vizualizatorul
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
}

// Descărcare fișier REALĂ
function downloadFile(fileName, fileType) {
    const fileUrl = `http://localhost:3000/uploads/${encodeURIComponent(fileName)}`;
    
    // Creează link temporar pentru descărcare
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Deschidere fișier REALĂ
function openFileInNewTab(fileName, fileType) {
    const fileUrl = `http://localhost:3000/uploads/${encodeURIComponent(fileName)}`;
    
    // Deschide fișierul direct în tab nou
    window.open(fileUrl, '_blank');
}

function shareMaterial(materialId) {
    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        alert('Materialul nu a fost găsit.');
        return;
    }

    // Creează linkul de partajare (în aplicația reală ar fi un URL real)
    const shareData = {
        title: material.name,
        text: `Material educațional: ${material.name} - Nivel: ${getLevelName(material.level)}`,
        url: window.location.href // În realitate ar fi URL-ul materialului
    };

    // Încearcă Web Share API (dacă browser-ul suportă)
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Partajare reușită!'))
            .catch(error => console.log('Eroare la partajare:', error));
    } else {
        // Fallback pentru browsere vechi
        const shareText = `Partajează materialul: ${material.name}\nNivel: ${getLevelName(material.level)}\nTip: ${material.type}`;
        if (confirm(`${shareText}\n\nCopiază acest text pentru a partaja?`)) {
            navigator.clipboard.writeText(shareText)
                .then(() => alert('Text copiat în clipboard!'))
                .catch(() => prompt('Copiază manual acest text:', shareText));
        }
    }
}

        function printMaterial(materialId) {
            const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
            const material = materials.find(m => m.id === materialId);
            
            if (!material) {
                alert('Materialul nu a fost găsit.');
                return;
            }

            // Creează o pagină optimizată pentru printare
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${material.name} - Print</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                        }
                        .header { 
                            border-bottom: 2px solid #333; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        .detail { 
                            margin: 10px 0; 
                        }
                        .files { 
                            margin-top: 20px; 
                        }
                        .file-item { 
                            background: #f5f5f5; 
                            padding: 10px; 
                            margin: 5px 0; 
                            border-radius: 5px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${material.name}</h1>
                        <p><strong>Tipărit din aplicația Citire Rapidă</strong></p>
                    </div>
                    
                    <div class="details">
                        <div class="detail"><strong>Nivel:</strong> ${getLevelName(material.level)}</div>
                        <div class="detail"><strong>Tip material:</strong> ${material.type}</div>
                        <div class="detail"><strong>Data încărcării:</strong> ${formatDate(material.uploadDate)}</div>
                        <div class="detail"><strong>Descriere:</strong> ${material.description || 'Nicio descriere'}</div>
                    </div>
                    
                    <div class="files">
                        <h3>Fișiere atașate:</h3>
                        ${material.files.map(file => `
                            <div class="file-item">
                                <strong>${file.name}</strong> (${formatFileSize(file.size)}) - ${file.type}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="no-print" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
                        <button onclick="window.print()">Tipărește</button>
                        <button onclick="window.close()">Închide</button>
                        <p><em>Apasă "Tipărește" pentru a trimite la imprimantă</em></p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        }

function closePDFViewer() {
    const overlay = document.querySelector('.pdf-viewer-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Funcție pentru editare material
function editMaterial(materialId) {
    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    const material = materials.find(m => m.id === materialId);
    
    if (!material) {
        alert('Materialul nu a fost găsit.');
        return;
    }

    const newName = prompt('Introdu noul nume pentru material:', material.name);
    if (newName === null) return; // User a apăsat Cancel
    
    const newNameTrimmed = newName.trim();
    if (!newNameTrimmed) {
        alert('Numele nu poate fi gol!');
        return;
    }

    // Actualizează materialul
    const materialIndex = materials.findIndex(m => m.id === materialId);
    materials[materialIndex].name = newNameTrimmed;
    
    // Salvează în localStorage
    localStorage.setItem('teachingMaterials', JSON.stringify(materials));
    
    // Reîncarcă lista
    loadRecentUploads();
    alert('Numele materialului a fost actualizat!');
}

// Helper functions
function getLevelName(level) {
    const levels = {
        'pregatitoare': 'Pregătitoare',
        'clasa-I': 'Clasa I', 
        'clasa-a-II-a': 'Clasa a II-a'
    };
    return levels[level] || level;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ro-RO');
}