import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { provideToastr } from 'ngx-toastr';
import { headerInterceptor } from './core/interceptors/header-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
      withHashLocation()
    ),
    provideHttpClient(withFetch(), withInterceptors([headerInterceptor, errorInterceptor, loadingInterceptor])),
    provideToastr(),
    importProvidersFrom(NgxSpinnerModule),
    DatePipe
  ]
};
