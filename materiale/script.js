// Funcții pentru gestionarea materialelor
function navigateTo(url) {
    window.location.href = url;
}

// Încărcarea datelor la deschiderea paginii
document.addEventListener('DOMContentLoaded', function() {
    loadMaterialStats();
    loadRecentMaterials();
});

// Încarcă statisticile materialelor
function loadMaterialStats() {
    // Aici vom prelua datele din localStorage sau API
    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    
    document.getElementById('total-files').textContent = materials.length;
    
    // Calculează spațiul total utilizat
    const totalSize = materials.reduce((total, material) => total + (material.size || 0), 0);
    document.getElementById('total-size').textContent = Math.round(totalSize / 1024 / 1024) + ' MB';
}

// Încarcă materialele recente
function loadRecentMaterials() {
    const materials = JSON.parse(localStorage.getItem('teachingMaterials')) || [];
    const recentList = document.getElementById('recent-materials-list');
    
    if (materials.length === 0) {
        recentList.innerHTML = '<p class="no-materials">Niciun material încărcat recent</p>';
        return;
    }
    
    // Sortează după data încărcării (cele mai recente primele)
    const recentMaterials = materials
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5);
    
    recentList.innerHTML = recentMaterials.map(material => `
        <div class="material-item">
            <div class="material-icon">${getFileIcon(material.type)}</div>
            <div class="material-info">
                <div class="material-name">${material.name}</div>
                <div class="material-meta">
                    ${material.level} • ${formatFileSize(material.size)} • ${formatDate(material.uploadDate)}
                </div>
            </div>
            <div class="material-actions">
                <button class="btn-download" onclick="downloadMaterial('${material.id}')">Descarcă</button>
                <button class="btn-delete" onclick="deleteMaterial('${material.id}')">Șterge</button>
            </div>
        </div>
    `).join('');
}

// Obține iconița corespunzătoare tipului de fișier
function getFileIcon(fileType) {
    const icons = {
        'pdf': '📄',
        'image': '🖼️',
        'audio': '🎵',
        'video': '🎬',
        'document': '📝'
    };
    
    if (fileType.includes('pdf')) return icons.pdf;
    if (fileType.includes('image')) return icons.image;
    if (fileType.includes('audio')) return icons.audio;
    if (fileType.includes('video')) return icons.video;
    return icons.document;
}

// Formatare dimensiune fișier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Formatare dată
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
}

// Funcții pentru acțiuni (vor fi implementate complet în submodule)
function downloadMaterial(materialId) {
    console.log('Descărcare material:', materialId);
    // Va fi implementată în modulul de download
}

function deleteMaterial(materialId) {
    if (confirm('Sigur doriți să ștergeți acest material?')) {
        console.log('Ștergere material:', materialId);
        // Va fi implementată complet
        loadMaterialStats();
        loadRecentMaterials();
    }
}

// Export pentru utilizare în alte module
window.MaterialsManager = {
    loadMaterialStats,
    loadRecentMaterials,
    navigateTo
};