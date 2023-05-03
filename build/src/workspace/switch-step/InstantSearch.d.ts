export default InstantSearch;
export type InstantSearchOptions = {
    /**
     * The URL which the search bar will query to retrieve results
     */
    searchUrl: URL;
    /**
     * The name of the query parameter to be used in each request
     */
    queryParam: string;
    /**
     * Takes the response from the instant search and returns an array of results
     */
    responseParser: Function;
    /**
     * Takes an instant search result and produces the HTML for it
     */
    templateFunction: Function;
};
/**
 * @typedef {Object} InstantSearchOptions
 * @property {URL} searchUrl The URL which the search bar will query to retrieve results
 * @property {string} queryParam The name of the query parameter to be used in each request
 * @property {Function} responseParser Takes the response from the instant search and returns an array of results
 * @property {Function} templateFunction Takes an instant search result and produces the HTML for it
 */
declare class InstantSearch {
    /**
     * Initialises the instant search bar. Retrieves and creates elements.
     *
     * @param {HTMLElement} instantSearch The container element for the instant search
     * @param {InstantSearchOptions} options A list of options for configuration
     */
    constructor(instantSearch: HTMLElement, options: InstantSearchOptions);
    options: InstantSearchOptions;
    elements: {
        main: HTMLElement;
        input: Element | null;
        resultsContainer: HTMLDivElement;
    };
    /**
     * Adds event listeners for elements of the instant search.
     */
    addListeners(): void;
    /**
     * Updates the HTML to display each result under the search bar.
     *
     * @param {Object[]} results
     */
    populateResults(results: Object[]): void;
    /**
     * Creates the HTML to represents a single result in the list of results.
     *
     * @param {Object} result An instant search result
     * @returns {HTMLAnchorElement}
     */
    createResultElement(result: Object): HTMLAnchorElement;
    /**
     * Makes a request at the search URL and retrieves results.
     *
     * @param {string} query Search query
     * @returns {Promise<Object[]>}
     */
    performSearch(query: string): Promise<Object[]>;
    /**
     * Shows or hides the loading indicator for the search bar.
     *
     * @param {boolean} b True will show the loading indicator, false will not
     */
    setLoading(b: boolean): void;
}
import InstantSearch from "./InstantSearch.js";
