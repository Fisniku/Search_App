import {showClearTextButton} from "./searchBar.js"

export const getSearchTerm = async (luckySearch = false) => {
    let searchTerm = "";

    if(luckySearch) {
        //User has clicked on "I"m feeling lucky", therefore generate results for a random string
        searchTerm =  await getWikiRandomString();
        //Add value in the search input
        document.getElementById("search").value = searchTerm;
        //Display the clear button
        showClearTextButton(); 
    } else {
        //Regular search
        const rawSearchTerm = document.getElementById("search").value.trim();
        const regex = /[ ]{2,}/gi;
        searchTerm = rawSearchTerm.replaceAll(regex, " ");
    }
    
    return searchTerm;
};

const getWikiRandomString = async () => {
    const searchString = encodeURI('https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&format=json&origin=*');
    const wikiRandomPageInfo = await requestData(searchString);
    const wikiRandomString = wikiRandomPageInfo.query.random[0].title;
    return wikiRandomString;
}

export const retrieveSearchResults = async (searchTerm) => {
    const wikiSearchString = getWikiSearchString(searchTerm);
    const wikiSearchResults = await requestData(wikiSearchString);
    let resultArray = [];
    if (wikiSearchResults.hasOwnProperty("query")) {
        resultArray = processWikiResults(wikiSearchResults.query.pages);
    }

    return resultArray;
};

const getWikiSearchString = (searchTerm) => {
    const page = parseInt(document.getElementsByClassName("paginate active")[0].text);
    let gsroffset = null;
    if(page != 1){
        gsroffset = page + 5; 

    }
    console.log('gsroffset',gsroffset)
    const maxChars = getMaxChars();
    let rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=5&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
    
    if(gsroffset) rawSearchString += `&gsroffset=${gsroffset}`

    const searchString = encodeURI(rawSearchString);

    return searchString;
};

const getMaxChars = () => {
    const width = window.innerWidth || document.body.clientWidth;
    let maxChars;
    if (width < 414) maxChars = 65;
    if (width >= 414 && width < 1400) maxChars = 100;
    if (width >= 1400) maxChars = 130;

    return maxChars;
};

const requestData = async (searchString) => {
    try {
        const response = await fetch(searchString);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

const processWikiResults = (results) => {
    const resultArray = [];
    Object.keys(results).forEach((key) => {
        const id    = key;
        const title = results[key].title;
        const text  = results[key].extract;
        const img   = results[key].hasOwnProperty("thumbnail") ? results[key].thumbnail.source : null;
        const item  = {
            id    : id,
            title : title,
            img   : img,
            text  : text
        };
        resultArray.push(item);
    });

    return resultArray;
}

export const setActiveLinkInPagination = (id) => {
    const activeLink = document.getElementsByClassName("paginate active")[0];    
    let link = '';
    if(id == 'paginateFowrard') {
         link = document.getElementById(activeLink.nextSibling.nextSibling.id);
    } else if (id == 'paginateBack') {
        link = document.getElementById(activeLink.previousSibling.previousSibling.id);
    } else {
        link = document.getElementById(id);
    }
    
    if(['paginateFowrard', 'paginateBack'].includes(link.id)) return;
    activeLink.classList.remove("active");
    link.classList.add("active");
}

export const setPaginationOnFooter = () => {
    document.getElementsByClassName("pagination")[0].classList.remove("none");
}

