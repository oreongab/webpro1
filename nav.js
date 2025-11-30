
function goToHome() {
    window.location.href = 'deskmain.html';
}


function goToFavorites() {
    window.location.href = 'favorite.html';
}


function goToRank() {
    window.location.href = 'rank.html';
}

function goToPlace(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}


document.addEventListener('DOMContentLoaded', function() {
    
    const navLinks = document.querySelectorAll('.choose a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            
            switch(href) {
                case '#home':
                    goToHome();
                    break;
                case '#category':
                   
                    if (typeof openCategoryPopup === 'function') {
                        openCategoryPopup();
                    }
                    break;
                case '#favorites':
                    goToFavorites();
                    break;
                case '#rank':
                    goToRank();
                    break;
            }
        });
    });
    
    const placeCards = document.querySelectorAll('.place > div');
    
    placeCards.forEach(card => {
        card.addEventListener('click', function(e) {
           
            if (e.target.classList.contains('favorite-icon')) {
                return;
            }
            
           
            const placeId = this.id.replace('place', '');
            goToPlace(placeId);
        });
    });
});


function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.choose a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        
        if ((currentPage === 'deskmain.html' || currentPage === '') && href === '#home') {
            link.classList.add('active');
        } else if (currentPage === 'favorite.html' && href === '#favorites') {
            link.classList.add('active');
        } else if (currentPage === 'rank.html' && href === '#rank') {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);