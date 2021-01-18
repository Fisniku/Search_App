import { setSearchFocus, showClearTextButton, clearSearchText, clearPushListener } from "./searchBar.js";
import { deleteSearchResults, buildSearchResults, clearStatsLine, setStatsLine, returnToDefaultPageView, addStyleToStatsLine} from "./searchResults.js";
import { getSearchTerm, retrieveSearchResults, setActiveLinkInPagination, setPaginationOnFooter} from "./dataFunctions.js";

document.addEventListener("readystatechange",(event)=> {
    if(event.target.readyState === 'complete'){
        initApp();
    }
});

const initApp = () => {
    setSearchFocus();

    const logo = document.getElementById("logo");
    logo.addEventListener("click", returnToHomePage);

    const search = document.getElementById("search");
    search.addEventListener("input", showClearTextButton);

    const clear = document.getElementById("clear");
    clear.addEventListener("click", clearSearchText);
    
    clear.addEventListener("keydown", clearPushListener);

    const form = document.getElementById("searchBar");
    form.addEventListener("submit", submitTheSearch);

    const lucky = document.getElementById("luckyButton");
    lucky.addEventListener("click",submitTheLuckySearch)

    //Pagination event listeners
    const paginationLinks = document.getElementsByClassName("paginate");
    for (let key in paginationLinks) {
        if(paginationLinks){
            paginationLinks[key].addEventListener("click", clickPaginate, false)
        }
    }
}

const returnToHomePage = (event) => {
    returnToDefaultPageView();
}

const clickPaginate = (event) =>{
    event.preventDefault();
    //Set active link in pagination
    setActiveLinkInPagination(event.target.id);
    submitTheSearch(event);
}

//Procedural "workflow" function
const submitTheSearch = (event,luckySearch=false) => {
    event.preventDefault();
    deleteSearchResults();
    processTheSearch(luckySearch);
    setSearchFocus();
}

const submitTheLuckySearch = (event) => {
    event.preventDefault();
    submitTheSearch(event,true);
}

//Procedural
const processTheSearch = async (luckySearch) => {
    clearStatsLine();
    const searchTerm = await getSearchTerm(luckySearch);
    if (searchTerm === "") return;
    const resultArray = await retrieveSearchResults(searchTerm);
    if(resultArray.length) buildSearchResults(resultArray);
    addStyleToStatsLine();
    setStatsLine(resultArray.length);
    setPaginationOnFooter();
}