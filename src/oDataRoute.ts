import { ODataHttp, ODataQueryOptions } from './oDataHttp';

function isGuid(value: string): boolean {
    return /^[{|\(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[\)|}]?$/i.test(value);
}

function oDataKey(value): string {
    switch (typeof value) {
        case 'string': return isGuid(value)
            ? value
            : `'${value}'`;
        case 'number': return value;
        case 'object':
            return Object.getOwnPropertyNames(value)
                .map(k => `${k}=${oDataKey(value[k])}`)
                .join(',');
    }
}

export interface ODateRouteCallback {
     (args: any[]): string;
}

export type ODataRouteSegment = string | ODateRouteCallback;

function buildODataUri(spec: ODataRouteSegment[], args: any[]): string {
    let uri = spec
        .map(seg => {
            switch (typeof seg) {
                case 'string': return seg;
                case 'function':
                    let key = (<ODateRouteCallback>seg)(args);
                    return `(${oDataKey(key)})`;
            }
        })
        .join('');
    return uri;
}

export interface ODataAnnotations {
    context?: string;
    metadataEtag?: string;
    type?: string;
    count?: number;
    nextLink?: string;
    deltaLink?: string;
    id?: string;
    editLink?: string;
    readLink?: string;
    etag?: string;
    navigationLink?: string;
    associationLink?: string;

    [name: string]: any;
}

export interface ODataResponseConverter<TIn, TOut> {
    (data: TIn, annotations?: ODataAnnotations): TOut;
}

interface ODataArrayReponse {
    value: any[];
}

export function ODataRoute<TIn, TOut>(
    spec: ODataRouteSegment[],
    convert?: ODataResponseConverter<TIn, TOut>): MethodDecorator {

    return (target: Function, key: string, descriptor: any) => {
        descriptor.value = function (...args: any[]) {
            let resourceUri = buildODataUri(spec, args);
            let opts = args.length > 0
                ? args[args.length - 1]
                : null;

            if (opts && typeof opts !== 'object') {
                opts = null;
            }

            // tslint:disable-next-line:no-invalid-this
            const { odhttp } = (<ODataBase>this);
            return odhttp
                .get(resourceUri, null, opts)
                .map(response => {
                    const data = response.json();

                    // collect ODataannotations into specific object
                    const context = {};
                    for (let prop in Object.getOwnPropertyNames(data)) {
                        if (prop.startsWith('@odata.')) {
                            context[prop.replace('@odata.', '')] = data[prop];
                            delete data[prop];
                        }
                    }

                    const arrayData: ODataArrayReponse = data;
                    let value = data && data.value && Array.isArray(data.value)
                        ? arrayData.value
                        : data;

                    let result = convert
                        ? convert(value, context)
                        : value;

                    return result;
                });
        };

        return descriptor;
    };
}

export abstract class ODataBase {
    constructor(public odhttp: ODataHttp) {
    }
}
