import { setSearchFocus, showClearTextButton, clearSearchText, clearPushListener } from "./searchBar.js";
import { deleteSearchResults, buildSearchResults, clearStatsLine, setStatsLine } from "./searchResults.js";
import { getSearchTerm, retrieveSearchResults, setActiveLinkInPagination, setPaginationOnFooter} from "./dataFunctions.js";

document.addEventListener("readystatechange",(event)=> {
    if(event.target.readyState === 'complete'){
        initApp();
    }
});

const initApp = () => {
    setSearchFocus();

    // Radio buttons event listeners
    var radios = document.forms["searchType"].elements["radio"];
    for(var i = 0, max = radios.length; i < max; i++) {
        // radios[i].onclick = function() {
            radios[i].addEventListener("change", changeSearchMethod);
        // }
    }

    //Search button event listener
    const search = document.getElementById("search");
    search.addEventListener("input", showClearTextButton);

    // const imageSearch = document.getElementById("imageSearch");
    // imageSearch.addEventListener("click", searchImages);

    //Clear button event listener
    const clear = document.getElementById("clear");
    clear.addEventListener("click", clearSearchText);
    
    clear.addEventListener("keydown", clearPushListener);

    //Form event listener
    const form = document.getElementById("searchBar");
    form.addEventListener("submit", submitTheSearch);

    //Lucky search button event listener
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

const changeSearchMethod = (event) => {
    event.preventDefault();
    console.info('changeSearchMethod:',event.target.value);
    submitTheSearch(event);
}

const clickPaginate = (event) =>{
    event.preventDefault();
    //Set active link in pagination
    setActiveLinkInPagination(event.target.id);
    submitTheSearch(event);
}

//Procedural "workflow" function
const submitTheSearch = (event, luckySearch=false) => {
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
    console.log(resultArray);
    if(resultArray.length) buildSearchResults(resultArray);
    setStatsLine(resultArray.length);
    setPaginationOnFooter();
}