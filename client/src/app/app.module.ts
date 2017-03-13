import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {RouterModule} from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ImageComponent } from './components/image/image.component';
import { AdminComponent } from './components/admin/admin.component';
import {HomeComponent} from './components/home/home.component';
import {appRoutes} from './app.routing';
import {ApiService} from './services/apiService';
import {TokenService} from './services/tokenService';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    ImageComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    FileUploadModule
  ],
  providers: [ApiService, TokenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
