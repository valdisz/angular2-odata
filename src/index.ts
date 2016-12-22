export * from './oDataHttp';
export * from './oDataRoute';

import { NgModule , ModuleWithProviders, ValueProvider } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ODataHttp, ODATA_ENDPOINT_URL } from './oDataHttp';

@NgModule({
    imports: [
        HttpModule
    ],
    providers: [
        ODataHttp
    ]
})
export class ODataModule {
    public static withEdnpointUrl(ednpointUrl: string): ModuleWithProviders {
        const endpointUrlProvider: ValueProvider = {
            provide: ODATA_ENDPOINT_URL,
            multi: false,
            useValue: ednpointUrl
        };

        return {
            ngModule: ODataModule,
            providers: [ endpointUrlProvider ]
        };
    }
}
