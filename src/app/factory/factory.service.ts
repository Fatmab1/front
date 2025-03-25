import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class FactoryService {
  private apiUrl = 'http://localhost:3000/factory/tree';

  constructor(private http: HttpClient) {}

  getFactoryTree(): Observable<TreeNode[]> {
    return this.http.get<TreeNode[]>(this.apiUrl);
  }
}
