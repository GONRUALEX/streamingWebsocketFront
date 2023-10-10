import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class XhrhandlerService {

  constructor(private httpClient: HttpClient) { }


  doGet(path : string) {
    return this.httpClient.get(environment.pathUser + path);
  }

  doPost(path : string, reqData : any) {
    return this.httpClient.post(environment.pathUser + path, JSON.stringify(reqData), {headers: HeaderService.getCommonHeaders()});
  }

}
