import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TreeService {
  private apiUrl = 'http://localhost:3000/tree'; 

  constructor(private http: HttpClient) {}

  getTreeNodes(): Observable<TreeNode[]> {
    return this.http.get<TreeNode[]>(this.apiUrl);
  }
}
