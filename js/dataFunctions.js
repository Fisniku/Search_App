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
    let resultArray = [];
    const wikiSearchString = getWikiSearchString(searchTerm);
    const wikiSearchResults = await requestData(wikiSearchString);
    console.log("🚀 ~ file: dataFunctions.js ~ line 34 ~ retrieveSearchResults ~ wikiSearchResults", wikiSearchResults)
    
    if (wikiSearchResults.hasOwnProperty("query")) {
        resultArray = processWikiResults(wikiSearchResults.query.pages);
    }

    return resultArray;

};

const getWikiSearchString = (searchTerm) => {
    console.log('document.getElementsByName("radio")[1].checked',document.getElementsByName("radio")[1].checked)
    const page = parseInt(document.getElementsByClassName("paginate active")[0].text);
    const searchMethod = getSearchMethod();
    let gsroffset = null;
    if(page != 1){
        gsroffset = page * 5;
    }
    const maxChars = getMaxChars();
    const maxThumbSize = getMaxThumbSize();

    let rawSearchString = ''
    switch(searchMethod){
        case 'text':
            rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=5&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
            if(gsroffset) rawSearchString += `&gsroffset=${gsroffset}`
        break;
        case 'image':
            //First api call -> get the name of file 
            rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchTerm}&prop=images&format=json&origin=*`;
            const rawFileNames = await requestData(rawSearchString);
            const fileNames = prepareFileNames(rawFileNames);
            console.log("🚀 ~ file: dataFunctions.js ~ line 66 ~ getWikiSearchString ~ fileNames", fileNames)
            return
            //Second api call -> get the href of that image

            // rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|pageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=${maxThumbSize}&pilimit=50&wbptterms=description&gpssearch=${searchTerm}&gpslimit=5&origin=*`;
            // if(gsroffset) rawSearchString += `&gpsoffset=${gsroffset}`

        break;
        case 'video':
            // rawSearchString = `https://www.mediawiki.org/w/api.php?action=query&titles=File:ASC Leiden - van de Bruinhorst Collection - Somaliland 2019 - 4480 - Two young red cats (one male) and one black cat, Hargeisa.webm&prop=videoinfo&viprop=derivatives&format=json&origin=*`;
        break;
    }
    

    const searchString = encodeURI(rawSearchString);

    return searchString;
};

const prepareFileNames = (rawFileNames) => {
    let fileNames = [];
    Object.keys(rawFileNames.query.pages).forEach((page) => {
        Object.keys(rawFileNames.query.pages[page].images).forEach((image) => {
            fileNames.push(rawFileNames.query.pages[page].images[image].title)
        })
    })
    return fileNames;
}

const getSearchMethod = () => {
    const radios = document.getElementsByName('radio');
    let searchMethod = 'text';
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            // do whatever you want with the checked radio
            searchMethod = radios[i].value;

            // only one radio can be logically checked, don't check the rest
            break;
        }
    }

    return searchMethod;
}

const getMaxChars = () => {
    const width = window.innerWidth || document.body.clientWidth;
    let maxChars;
    if (width < 414) maxChars = 65;
    if (width >= 414 && width < 1400) maxChars = 100;
    if (width >= 1400) maxChars = 130;

    return maxChars;
};

const getMaxThumbSize = () => {
    const width = window.innerWidth || document.body.clientWidth;
    let maxThumbSize;
    if (width < 414) maxThumbSize = 200;
    if (width >= 414 && width < 1400) maxThumbSize = 500;
    if (width >= 1400) maxThumbSize = 1000;

    return maxThumbSize;
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
    const searchMethod = getSearchMethod();
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
        if(searchMethod == 'image' && !results[key].hasOwnProperty("thumbnail")) return;
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

