document.addEventListener('DOMContentLoaded', function () {
    const searchIcon = document.querySelector('.searchicon');
    const searchbar = document.querySelector('.searchbar');

    searchIcon.addEventListener('click', function () {
        if (searchbar.style.display === "none" || searchbar.style.display === "") {
            searchbar.style.display = "block";
            setTimeout(function () {
                searchbar.classList.add('active');
            }, 50);
            searchIcon.src= "https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/close.svg";
        } else {
            searchbar.classList.remove('active');
            setTimeout(function () {
                searchbar.style.display = "none";
            }, 250);
            searchIcon.src= "https://raw.githubusercontent.com/KraitOPP/spotify.github.io/main/Assets/search-icon.svg";
        }
    });
    const menuicon = document.querySelector('.menu-btn');
    const menucontainer = document.querySelector('.leftcontainer');

    menuicon.addEventListener('click', function () {
        if (menucontainer.style.display === "none" || menucontainer.style.display === "") {
            menucontainer.style.display = "block";
            setTimeout(function () {
                menucontainer.classList.add('active');
            }, 50);
            
        } else {
            menucontainer.classList.remove('active');
            setTimeout(function () {
                menucontainer.style.display = "none";
            }, 250);
        }
    });
    
    const closemenu = document.querySelector('.close-menu');
    closemenu.addEventListener('click', function () {
        menucontainer.classList.remove('active');
    });
    
});
