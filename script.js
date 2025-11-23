// Funcții pentru panoul principal
function openSettings() {
    alert('Panoul de setări va fi implementat aici!');
    // Va deschide un modal cu setări pentru aplicație
}

function showStats() {
    alert('Statisticile de utilizare vor fi afișate aici!');
    // Va afișa statistici despre utilizarea aplicației
}

function exportData() {
    alert('Funcția de export date va fi implementată aici!');
    // Va permite exportul datelor în format CSV sau PDF
}

// Verificare dacă utilizatorul este profesor
function checkUserRole() {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'professor') {
        alert('Acces restricționat! Această aplicație este doar pentru profesori.');
        window.location.href = '/login.html';
    }
}

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicația Citire Rapidă este gata!');
    // checkUserRole(); // Dezcomentează această linie când ai sistem de autentificare
});

// Funcție pentru gestionarea temei (light/dark mode)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}