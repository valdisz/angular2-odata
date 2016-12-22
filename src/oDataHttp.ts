import { Injectable, Inject, OpaqueToken } from '@angular/core';
import { Http, Request, Response, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs';

export interface ODataQueryOptions {
    /** Expands related entities inline. */
    $expand?: string[];

    /** Filters the results, based on a Boolean condition. */
    $filter?: string;

    /** Tells the server to include the total count of matching entities in the response. (Useful for server-side paging.) */
    $inlinecount?: boolean;

    /** Sorts the results. */
    $orderby?: string[];

    /** Selects which properties to include in the response. */
    $select?: string[];

    /** Skips the first n results. */
    $skip?: number;

    /** Returns only the first n the results. */
    $top?: number;

    /** Specifies that a response to the request MUST use the media type specified by the query option */
    $format?: string;
}

function buildODataQuery(opt: ODataQueryOptions): string[] {
    let q = [];

    if (opt.$expand)      q.push(`$expand=${opt.$expand.join(',')}`);
    if (opt.$filter)      q.push(`$filter=${opt.$filter}`);
    if (opt.$inlinecount) q.push('$inlinecount=allpages');
    if (opt.$orderby)     q.push(`$orderby=${opt.$orderby.join(',')}`);
    if (opt.$select)      q.push(`$select=${opt.$select.join(',')}`);
    if (opt.$skip)        q.push(`$skip=${opt.$skip}`);
    if (opt.$top)         q.push(`$top=${opt.$top}`);
    if (opt.$format)      q.push(`$format=${opt.$format}`);

    return q;
}

export const ODATA_ENDPOINT_URL = new OpaqueToken('ODATA_ENDPOINT_URL');

@Injectable()
export class ODataHttp {
    constructor(private http: Http, @Inject(ODATA_ENDPOINT_URL) private endpointUrl: string) {
        this.endpointUrl = endpointUrl.endsWith('/')
            ? endpointUrl.substring(0, -1)
            : endpointUrl;
    }

    private static injectODataArgs(url: string, oDataOptions: ODataQueryOptions): string {
        let oda = oDataOptions !== undefined && oDataOptions != null
            ? buildODataQuery(oDataOptions)
            : [];

        if (oda.length > 0) {
            let args = oda.join('&');
            return url + (url.indexOf('?') < 0 ? `?${args}` : args);
        }

        return url;
    }

    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    request(url: string | Request, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        if (typeof url === 'string') {
            url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        }
        else {
            (<Request>url).url += ODataHttp.injectODataArgs((<Request>url).url, oDataOptions);
        }

        return this.http.request(this.endpointUrl + url, options);
    }

    /**
     * Performs a request with `get` http method.
     */
    get(url: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.get(this.endpointUrl + url, options);
    }

    /**
     * Performs a request with `post` http method.
     */
    post(url: string, body: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.post(this.endpointUrl + url, body, options);
    }

    /**
     * Performs a request with `put` http method.
     */
    put(url: string, body: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.put(this.endpointUrl + url, body, options);
    }

    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.delete(this.endpointUrl + url, options);
    }

    /**
     * Performs a request with `patch` http method.
     */
    patch(url: string, body: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.patch(this.endpointUrl + url, body, options);
    }

    /**
     * Performs a request with `head` http method.
     */
    head(url: string, options?: RequestOptionsArgs, oDataOptions?: ODataQueryOptions): Observable<Response> {
        url = ODataHttp.injectODataArgs(<string>url, oDataOptions);
        return this.http.head(this.endpointUrl + url, options);
    }
}
